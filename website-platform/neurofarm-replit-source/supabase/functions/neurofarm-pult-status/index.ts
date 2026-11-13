import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// TRIZNES · единый статус конвейера для ПУЛЬТА (v1, 29.10.2026)
// Только чтение. Собирает живые счётчики существующих узлов нейрофермы в одну доску:
// приём → сборка (COLLIDER) → QC → просмотр → выпуск, плюс список «требует внимания».
// Ничего не запускает, не публикует и не меняет. Доступ — только администратор (как в neurofarm-provider-status).

const projectUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

const STUCK_GENERATING_MS = 24 * 60 * 60 * 1000; // run в generating дольше суток считаем застрявшим

async function rest(path: string): Promise<any[]> {
  const r = await fetch(`${projectUrl}/rest/v1/${path}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`rest_${r.status}`);
  const data = await r.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

function tally(rows: any[], field: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) {
    const key = String(row?.[field] ?? "—");
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

const n = (map: Record<string, number>, ...keys: string[]) => keys.reduce((sum, k) => sum + (map[k] || 0), 0);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!projectUrl || !serviceKey) return json({ error: "backend_not_configured" }, 503);

  const authorization = req.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

  try {
    // Проверка администратора — тем же способом, что и neurofarm-provider-status.
    const authResp = await fetch(`${projectUrl}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: authorization },
      signal: AbortSignal.timeout(10000),
    });
    const authData = await authResp.json().catch(() => null);
    const userId = authData && typeof authData === "object" ? (authData as Record<string, unknown>).id : null;
    if (!authResp.ok || typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) return json({ error: "unauthorized" }, 401);
    const profiles = await rest(`profiles?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`);
    const role = profiles[0] && typeof profiles[0].role === "string" ? profiles[0].role.trim().toLowerCase() : "";
    if (!["admin", "administrator", "администратор"].includes(role)) return json({ error: "admin_only" }, 403);

    // Живые данные существующих узлов (только чтение).
    const [queue, runs, releases] = await Promise.all([
      rest("social_content_queue?select=status,delivery_status,rights_status&limit=5000").catch(() => []),
      rest("content_collider_runs?select=id,title,status,metadata,updated_at&order=updated_at.desc&limit=500").catch(() => []),
      rest("triznes_reel_releases?select=id,character,title,status,updated_at&order=updated_at.desc&limit=500").catch(() => []),
    ]);

    const queueByStatus = tally(queue, "status");
    const queueByDelivery = tally(queue, "delivery_status");
    const queueByRights = tally(queue, "rights_status");
    const runsByStatus = tally(runs, "status");
    const releasesByStatus = tally(releases, "status");

    const now = Date.now();
    // «Требует внимания»: застрявшая сборка, провалившиеся сборки, провалы доставки.
    const stuckGenerating = runs.filter((r: any) => {
      if (r.status !== "generating") return false;
      const t = Date.parse(r.updated_at || "");
      return Number.isFinite(t) && now - t > STUCK_GENERATING_MS;
    }).map((r: any) => ({
      id: r.id,
      title: String(r.title || "").slice(0, 120),
      stage: String(r?.metadata?.cinema_stage || "—"),
      updated_at: r.updated_at,
      age_hours: Math.round((now - Date.parse(r.updated_at || "")) / 3_600_000),
    }));

    const failedRuns = runs.filter((r: any) => r.status === "partial_failed").map((r: any) => ({
      id: r.id,
      title: String(r.title || "").slice(0, 120),
      stage: String(r?.metadata?.cinema_stage || "—"),
      error: String(r?.metadata?.cinema_error || r?.metadata?.cinema_blocker || "—").slice(0, 200),
      updated_at: r.updated_at,
    })).slice(0, 25);

    // Доска этапов (единый путь материала). Счётчики только из реальных данных.
    const board = [
      { key: "intake", label: "Приём / исходник", count: n(runsByStatus, "draft") + n(releasesByStatus, "awaiting_character"), hint: "новые сборки и ролики, ждущие хода" },
      { key: "assembly", label: "Сборка (COLLIDER)", count: n(runsByStatus, "generating"), hint: "рендер у провайдера (Creatomate/нейро-шоты)" },
      { key: "review", label: "Просмотр / одобрение", count: n(queueByStatus, "review") + n(runsByStatus, "review"), hint: "ждёт решения человека" },
      { key: "changes", label: "Правки / согласие", count: n(queueByStatus, "changes_requested") + n(queueByRights, "consent_needed"), hint: "вернулось на доработку или ждёт согласия персонажа" },
      { key: "publish", label: "Выпуск", count: n(queueByStatus, "published") + n(queueByDelivery, "published", "delivered"), hint: "опубликовано в соцсетях" },
    ];

    const attention = {
      stuck_generating: stuckGenerating,
      failed_runs: failedRuns,
      delivery_failed: n(queueByDelivery, "failed"),
      queue_failed: n(queueByStatus, "failed"),
      awaiting_review: n(queueByStatus, "review"),
    };

    return json({
      ok: true,
      checked_at: new Date().toISOString(),
      read_only: true,
      board,
      totals: {
        queue_total: queue.length,
        runs_total: runs.length,
        releases_total: releases.length,
      },
      queue: { by_status: queueByStatus, by_delivery: queueByDelivery, by_rights: queueByRights },
      collider_runs: { by_status: runsByStatus },
      reel_releases: { by_status: releasesByStatus },
      attention,
    });
  } catch (e) {
    return json({ error: "pult_status_failed", detail: e instanceof Error ? e.message.slice(0, 200) : "unknown" }, 502);
  }
});
