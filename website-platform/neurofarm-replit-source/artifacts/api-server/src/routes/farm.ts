import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { and, eq, ne, desc, sql } from "drizzle-orm";
import { db, farmJobs, farmSettings, farmDailyUsage } from "@workspace/db";
import {
  CreateJobBody, CreateJobResponse, DeleteJobParams, GetJobParams, GetJobResponse,
  GetFarmIntegrationsResponse, GetFarmOverviewResponse, GetFarmSessionResponse,
  GetFarmSettingsResponse, ListJobsResponse, RunJobActionParams, RunJobActionBody,
  RunJobActionResponse, UpdateFarmSettingsBody, UpdateFarmSettingsResponse,
  UpdateJobBody, UpdateJobParams, UpdateJobResponse,
} from "@workspace/api-zod";
import { ServiceError, generateScript, klingReady, submitVideo, checkVideo, driveConnected, exportScript } from "../lib/providers";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const ownerId = () => process.env.FARM_OWNER_USER_ID?.trim() || null;
const userId = (req: Request) => getAuth(req).userId;
const owner = (req: Request) => !!ownerId() && userId(req) === ownerId();
const ownerError = () => new ServiceError(403, ownerId()
  ? "Операции с AI и Google Drive доступны только владельцу фермы."
  : "Владелец фермы не настроен: задайте FARM_OWNER_USER_ID равным Clerk user ID владельца.");
const error = (res: Response, e: unknown) => {
  if (e instanceof ServiceError) res.status(e.status).json({ error: e.message });
  else { res.req.log.error({ err: e }, "Farm operation failed"); res.status(500).json({ error: "Внутренняя ошибка. Повторите попытку позже." }); }
};
const invalid = (res: Response) => res.status(400).json({ error: "Некорректные данные запроса." });
const jobOutput = (job: typeof farmJobs.$inferSelect) => ({
  id: job.id, title: job.title, brief: job.brief, kind: job.kind, format: job.format,
  status: job.status, script: job.script, error: job.error,
  driveUrl: job.driveUrl, videoUrl: job.videoUrl, createdAt: job.createdAt,
});
const ownJob = (id: string, user: string) => and(eq(farmJobs.id, id), eq(farmJobs.ownerId, user));
async function settingsFor(user: string) {
  const [row] = await db.select().from(farmSettings).where(eq(farmSettings.ownerId, user));
  return row || { ownerId: user, workspaceName: "Нейроферма", dailyLimit: 10 };
}
const currentDay = () => new Date().toISOString().slice(0, 10);
async function charge(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], user: string) {
  await tx.insert(farmSettings).values({ ownerId: user }).onConflictDoNothing();
  const [settings] = await tx.select().from(farmSettings).where(eq(farmSettings.ownerId, user)).for("update");
  const day = currentDay();
  await tx.insert(farmDailyUsage).values({ ownerId: user, day }).onConflictDoNothing();
  const [usage] = await tx.select().from(farmDailyUsage)
    .where(and(eq(farmDailyUsage.ownerId, user), eq(farmDailyUsage.day, day))).for("update");
  if (usage.count >= settings.dailyLimit) throw new ServiceError(429, "Дневной лимит действий исчерпан (UTC). Измените лимит в настройках или дождитесь следующего дня.");
  await tx.update(farmDailyUsage).set({ count: sql`${farmDailyUsage.count} + 1` })
    .where(and(eq(farmDailyUsage.ownerId, user), eq(farmDailyUsage.day, day)));
}

router.get("/farm/session", (req, res): void => {
  res.json(GetFarmSessionResponse.parse({ authenticated: !!userId(req), configured: !!ownerId(), owner: owner(req) }));
});
router.use("/farm", (req: Request, res: Response, next: NextFunction) => {
  if (!userId(req)) { res.status(401).json({ error: "Войдите в аккаунт для доступа к ферме." }); return; }
  next();
});

router.get("/farm/jobs", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(farmJobs).where(eq(farmJobs.ownerId, userId(req)!)).orderBy(desc(farmJobs.createdAt));
    const current = owner(req) ? await Promise.all(rows.map(refreshVideo)) : rows;
    res.json(ListJobsResponse.parse(current.map(jobOutput)));
  } catch (e) { error(res, e); }
});
router.post("/farm/jobs", async (req, res): Promise<void> => {
  const input = CreateJobBody.safeParse(req.body);
  if (!input.success || !input.data.title.trim() || !input.data.brief.trim()) { invalid(res); return; }
  try {
    const [job] = await db.insert(farmJobs).values({ ...input.data, ownerId: userId(req)! }).returning();
    res.status(201).json(CreateJobResponse.parse(jobOutput(job)));
  } catch (e) { error(res, e); }
});

async function refreshVideo(job: typeof farmJobs.$inferSelect) {
  if (job.status !== "processing" || job.processingAction !== "generate_video" || !job.providerTaskId ||
    (job.lastPolledAt && Date.now() - job.lastPolledAt.getTime() < 15000)) return job;
  const [claimed] = await db.update(farmJobs).set({ lastPolledAt: new Date() })
    .where(and(eq(farmJobs.id, job.id), eq(farmJobs.ownerId, job.ownerId), eq(farmJobs.status, "processing"),
      eq(farmJobs.processingAction, "generate_video"), sql`(${farmJobs.lastPolledAt} IS NULL OR ${farmJobs.lastPolledAt} < now() - interval '15 seconds')`))
    .returning();
  if (!claimed) return job;
  try {
    const result = await checkVideo(claimed.providerTaskId!);
    if (result.status === "succeed" && result.url) {
      const [updated] = await db.update(farmJobs).set({ status: "completed", videoUrl: result.url, processingAction: null, error: null })
        .where(and(eq(farmJobs.id, job.id), eq(farmJobs.ownerId, job.ownerId), eq(farmJobs.status, "processing"))).returning();
      return updated || claimed;
    }
    if (result.status === "failed") {
      const [updated] = await db.update(farmJobs).set({ status: "failed", processingAction: null, error: "Kling не создал видео. Проверьте сценарий и попробуйте позже." })
        .where(and(eq(farmJobs.id, job.id), eq(farmJobs.ownerId, job.ownerId), eq(farmJobs.status, "processing"))).returning();
      return updated || claimed;
    }
  } catch (e) {
    // A transient read failure must not trigger another paid submission.
    logger.warn({ err: e, jobId: job.id }, "Kling status polling failed; submission remains reserved");
  }
  return claimed;
}
router.get("/farm/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) { invalid(res); return; }
  try {
    const [job] = await db.select().from(farmJobs).where(ownJob(params.data.id, userId(req)!));
    if (!job) { res.status(404).json({ error: "Задача не найдена." }); return; }
    res.json(GetJobResponse.parse(jobOutput(owner(req) ? await refreshVideo(job) : job)));
  } catch (e) { error(res, e); }
});
router.patch("/farm/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params), body = UpdateJobBody.safeParse(req.body);
  if (!params.success || !body.success || (body.data.title !== undefined && !body.data.title.trim())) { invalid(res); return; }
  try {
    const [job] = await db.transaction(async tx => {
      const [existing] = await tx.select().from(farmJobs).where(ownJob(params.data.id, userId(req)!)).for("update");
      if (!existing) throw new ServiceError(404, "Задача не найдена.");
      if (existing.status === "processing") throw new ServiceError(409, "Задача обрабатывается; редактирование сейчас недоступно.");
      return tx.update(farmJobs).set({
        ...body.data, ...(body.data.script !== undefined ? { status: body.data.script.trim() ? "script_ready" as const : "draft" as const, videoUrl: null, driveUrl: null } : {}),
        error: null,
      }).where(ownJob(params.data.id, userId(req)!)).returning();
    });
    res.json(UpdateJobResponse.parse(jobOutput(job)));
  } catch (e) { error(res, e); }
});
router.delete("/farm/jobs/:id", async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) { invalid(res); return; }
  try {
    const [job] = await db.delete(farmJobs).where(and(ownJob(params.data.id, userId(req)!), ne(farmJobs.status, "processing"))).returning();
    if (job) { res.sendStatus(204); return; }
    const [existing] = await db.select({ id: farmJobs.id }).from(farmJobs).where(ownJob(params.data.id, userId(req)!));
    throw new ServiceError(existing ? 409 : 404, existing ? "Задача обрабатывается; удаление сейчас недоступно." : "Задача не найдена.");
  } catch (e) { error(res, e); }
});

router.post("/farm/jobs/:id/action", async (req, res): Promise<void> => {
  const params = RunJobActionParams.safeParse(req.params), body = RunJobActionBody.safeParse(req.body);
  if (!params.success || !body.success) { invalid(res); return; }
  const action = body.data.action, user = userId(req)!;
  if (action !== "approve" && !owner(req)) { error(res, ownerError()); return; }
  if (action === "generate_script" && !process.env.GEMINI_API_KEY) { error(res, new ServiceError(503, "Gemini не настроен: добавьте GEMINI_API_KEY.")); return; }
  if (action === "generate_video" && !klingReady()) { error(res, new ServiceError(503, "Kling не настроен: добавьте KLING_API_KEY или KLING_ACCESS_KEY и KLING_SECRET_KEY.")); return; }
  try {
    const initial = await db.transaction(async tx => {
      const [job] = await tx.select().from(farmJobs).where(ownJob(params.data.id, user)).for("update");
      if (!job) throw new ServiceError(404, "Задача не найдена.");
      if (job.status === "processing") throw new ServiceError(409, "Задача уже обрабатывается. Повторная отправка может привести к оплате дважды.");
      if (action === "approve" && (job.status === "approved" || job.status === "completed")) return { job, run: false, previousStatus: job.status };
      if (action === "generate_script" && ["script_ready", "approved", "completed"].includes(job.status)) return { job, run: false, previousStatus: job.status };
      if (action === "export_drive" && job.driveUrl) return { job, run: false, previousStatus: job.status };
      if (action === "generate_video" && job.videoUrl) return { job, run: false, previousStatus: job.status };
      if (action === "approve" && !job.script.trim()) throw new ServiceError(400, "Сначала создайте или добавьте сценарий.");
      if (action === "export_drive" && !job.script.trim()) throw new ServiceError(400, "Для экспорта нужен сценарий.");
      if (action === "generate_video" && (job.kind !== "video" || job.status !== "approved")) throw new ServiceError(400, "Для генерации видео утвердите сценарий видеозадачи.");
      if (action === "generate_video" && job.providerTaskId) throw new ServiceError(409, "Видео уже отправлено в Kling; повторная платная отправка заблокирована.");
      await charge(tx, user);
      const [updated] = await tx.update(farmJobs).set(action === "approve"
        ? { status: "approved", error: null }
        : { status: "processing", processingAction: action, error: null })
        .where(ownJob(job.id, user)).returning();
      return { job: updated, run: action !== "approve", previousStatus: job.status };
    });
    if (!initial.run) { res.json(RunJobActionResponse.parse(jobOutput(initial.job))); return; }
    const job = initial.job;
    let changes: Partial<typeof farmJobs.$inferInsert>;
    if (action === "generate_script") {
      changes = { script: await generateScript(job.title, job.brief, job.kind, job.format), status: "script_ready", processingAction: null };
    } else if (action === "generate_video") {
      const taskId = await submitVideo(job.id, job.script, job.format);
      changes = { providerTaskId: taskId, lastPolledAt: null };
    } else {
      changes = { driveUrl: await exportScript(job.title, job.script, job.videoUrl), status: initial.previousStatus, processingAction: null };
    }
    const [updated] = await db.update(farmJobs).set(changes)
      .where(and(ownJob(job.id, user), eq(farmJobs.status, "processing"), eq(farmJobs.processingAction, action))).returning();
    res.json(RunJobActionResponse.parse(jobOutput(updated)));
  } catch (e) {
    // A failed or timed-out external write may have succeeded upstream. Keep the
    // processing reservation until reconciled; never auto-submit a paid request.
    if (action === "generate_script") {
      await db.update(farmJobs).set({ status: "failed", processingAction: null, error: e instanceof ServiceError ? e.message : "Gemini недоступен; проверьте настройки и попробуйте позже." })
        .where(and(ownJob(params.data.id, user), eq(farmJobs.processingAction, action))).catch(() => {});
    }
    error(res, e);
  }
});

router.get("/farm/overview", async (req, res): Promise<void> => {
  try {
    const rows = await db.select({ status: farmJobs.status }).from(farmJobs).where(eq(farmJobs.ownerId, userId(req)!));
    res.json(GetFarmOverviewResponse.parse({
      total: rows.length, drafts: rows.filter(r => r.status === "draft").length,
      completed: rows.filter(r => r.status === "completed").length,
      active: rows.filter(r => r.status === "processing" || r.status === "approved" || r.status === "script_ready").length,
    }));
  } catch (e) { error(res, e); }
});
router.get("/farm/integrations", async (req, res): Promise<void> => {
  let drive: "connected" | "missing" | "unavailable" = "unavailable";
  if (owner(req)) { try { drive = await driveConnected() ? "connected" : "missing"; } catch { drive = "unavailable"; } }
  res.json(GetFarmIntegrationsResponse.parse([
    { id: "gemini", name: "Gemini", status: owner(req) && process.env.GEMINI_API_KEY ? "connected" : "missing", detail: process.env.GEMINI_API_KEY ? "Ключ настроен; доступ проверится при запросе." : "Добавьте GEMINI_API_KEY. Генерация недоступна." },
    { id: "kling", name: "Kling AI", status: owner(req) && klingReady() ? "connected" : "missing", detail: klingReady() ? "Ключ настроен; доступ проверится при запросе. Видео доступно до 30 дней." : "Добавьте ключ Kling для генерации видео." },
    { id: "json2video", name: "JSON2Video", status: owner(req) && process.env.JSON2VIDEO_API_KEY ? "connected" : "missing", detail: process.env.JSON2VIDEO_API_KEY ? "Ключ настроен на сервере; доступ проверится при рендере. Платный рендер только для владельца." : "Добавьте JSON2VIDEO_API_KEY на сервере для монтажа." },
    { id: "google-drive", name: "Google Drive", status: drive, detail: drive === "connected" ? "Подключение проекта найдено; запись файла проверится при экспорте. Только владелец." : "Подключите Google Drive к проекту; экспорт доступен только владельцу." },
  ]));
});
router.get("/farm/settings", async (req, res): Promise<void> => {
  try { res.json(GetFarmSettingsResponse.parse(await settingsFor(userId(req)!))); } catch (e) { error(res, e); }
});
router.patch("/farm/settings", async (req, res): Promise<void> => {
  const parsed = UpdateFarmSettingsBody.safeParse(req.body);
  if (!parsed.success || (parsed.data.workspaceName !== undefined && !parsed.data.workspaceName.trim())) { invalid(res); return; }
  try {
    const user = userId(req)!;
    await db.insert(farmSettings).values({ ownerId: user }).onConflictDoNothing();
    const [row] = await db.update(farmSettings).set(parsed.data).where(eq(farmSettings.ownerId, user)).returning();
    res.json(UpdateFarmSettingsResponse.parse(row));
  } catch (e) { error(res, e); }
});

export default router;