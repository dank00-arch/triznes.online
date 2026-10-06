import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, farmDailyUsage, farmMontages, farmSettings } from "@workspace/db";
import {
  ListMontagesResponse, CreateMontageBody, CreateMontageResponse, GetMontageParams, GetMontageResponse,
  UpdateMontageParams, UpdateMontageBody, UpdateMontageResponse, RenderMontageParams, RenderMontageResponse,
} from "@workspace/api-zod";
import { ServiceError } from "../lib/providers";
import { checkMontage, submitMontage, validateMontage } from "../lib/montage-provider";

const router: IRouter = Router();
const userId = (req: Request) => getAuth(req).userId;
const own = (id: string, user: string) => and(eq(farmMontages.id, id), eq(farmMontages.ownerId, user));
const output = (row: typeof farmMontages.$inferSelect) => ({
  id: row.id, title: row.title, format: row.format, clips: row.clips,
  status: row.status, projectId: row.projectId, videoUrl: row.videoUrl, error: row.error, createdAt: row.createdAt,
});
function fail(req: Request, res: Response, e: unknown) {
  if (e instanceof ServiceError) res.status(e.status).json({ error: e.message });
  else { req.log.error({ err: e }, "Montage operation failed"); res.status(500).json({ error: "Внутренняя ошибка. Повторите попытку позже." }); }
}
function bad(res: Response, message = "Некорректные данные монтажа.") { res.status(400).json({ error: message }); }

router.use("/farm/montages", (req: Request, res: Response, next: NextFunction) => {
  if (!userId(req)) { res.status(401).json({ error: "Войдите в аккаунт." }); return; }
  next();
});

router.get("/farm/montages", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(farmMontages).where(eq(farmMontages.ownerId, userId(req)!)).orderBy(desc(farmMontages.createdAt));
    res.json(ListMontagesResponse.parse(rows.map(output)));
  } catch (e) { fail(req, res, e); }
});
router.post("/farm/montages", async (req, res): Promise<void> => {
  const parsed = CreateMontageBody.safeParse(req.body);
  if (!parsed.success) { bad(res); return; }
  const validation = validateMontage(parsed.data);
  if (validation) { bad(res, validation); return; }
  try {
    const [row] = await db.insert(farmMontages).values({ ...parsed.data, title: parsed.data.title.trim(), ownerId: userId(req)! }).returning();
    res.status(201).json(CreateMontageResponse.parse(output(row)));
  } catch (e) { fail(req, res, e); }
});
async function refresh(row: typeof farmMontages.$inferSelect) {
  if (row.status !== "processing" || !row.projectId ||
    (row.lastPolledAt && Date.now() - row.lastPolledAt.getTime() < 15000)) return row;
  const [claimed] = await db.update(farmMontages).set({ lastPolledAt: new Date() })
    .where(and(own(row.id, row.ownerId), eq(farmMontages.status, "processing"),
      sql`(${farmMontages.lastPolledAt} IS NULL OR ${farmMontages.lastPolledAt} < now() - interval '15 seconds')`)).returning();
  if (!claimed) return row;
  try {
    const result = await checkMontage(row.projectId);
    if (result.status === "processing") {
      const [updated] = await db.update(farmMontages).set({ error: result.error ?? null })
        .where(and(own(row.id, row.ownerId), eq(farmMontages.status, "processing"))).returning();
      return updated ?? claimed;
    }
    const [updated] = await db.update(farmMontages).set({
      status: result.status, videoUrl: result.url ?? null, error: result.error ?? null,
    }).where(and(own(row.id, row.ownerId), eq(farmMontages.status, "processing"))).returning();
    return updated ?? claimed;
  } catch (e) {
    // Status reads are safe to retry; paid submissions are not.
    const [updated] = await db.update(farmMontages).set({ error: "Не удалось обновить статус у JSON2Video. Следующая проверка через 15 секунд." })
      .where(and(own(row.id, row.ownerId), eq(farmMontages.status, "processing"))).returning();
    return updated ?? claimed;
  }
}
router.get("/farm/montages/:id", async (req, res): Promise<void> => {
  const params = GetMontageParams.safeParse(req.params);
  if (!params.success) { bad(res); return; }
  try {
    const [row] = await db.select().from(farmMontages).where(own(params.data.id, userId(req)!));
    if (!row) { res.status(404).json({ error: "Монтаж не найден." }); return; }
    res.json(GetMontageResponse.parse(output(await refresh(row))));
  } catch (e) { fail(req, res, e); }
});
router.patch("/farm/montages/:id", async (req, res): Promise<void> => {
  const params = UpdateMontageParams.safeParse(req.params), body = UpdateMontageBody.safeParse(req.body);
  if (!params.success || !body.success) { bad(res); return; }
  const validation = validateMontage(body.data);
  if (validation) { bad(res, validation); return; }
  try {
    const [row] = await db.update(farmMontages).set({ ...body.data, title: body.data.title.trim() })
      .where(and(own(params.data.id, userId(req)!), eq(farmMontages.status, "draft"))).returning();
    if (!row) throw new ServiceError(409, "Можно редактировать только свой черновик. Для новой версии создайте другой монтаж.");
    res.json(UpdateMontageResponse.parse(output(row)));
  } catch (e) { fail(req, res, e); }
});
router.post("/farm/montages/:id/render", async (req, res): Promise<void> => {
  const params = RenderMontageParams.safeParse(req.params);
  if (!params.success) { bad(res); return; }
  const user = userId(req)!;
  if (!process.env.FARM_OWNER_USER_ID?.trim() || user !== process.env.FARM_OWNER_USER_ID.trim()) {
    fail(req, res, new ServiceError(403, "Платный рендер доступен только владельцу фермы (FARM_OWNER_USER_ID).")); return;
  }
  if (!process.env.JSON2VIDEO_API_KEY) { fail(req, res, new ServiceError(503, "JSON2Video не настроен.")); return; }
  try {
    // Row lock serializes concurrent clicks. Charge and reservation commit together.
    const row = await db.transaction(async tx => {
      const [existing] = await tx.select().from(farmMontages).where(own(params.data.id, user)).for("update");
      if (!existing) throw new ServiceError(404, "Монтаж не найден.");
      if (existing.status !== "draft") throw new ServiceError(409, "Монтаж уже отправлен. Повторная платная отправка заблокирована.");
      const validation = validateMontage(existing);
      if (validation) throw new ServiceError(400, validation);
      await tx.insert(farmSettings).values({ ownerId: user }).onConflictDoNothing();
      const [settings] = await tx.select().from(farmSettings).where(eq(farmSettings.ownerId, user)).for("update");
      const day = new Date().toISOString().slice(0, 10);
      await tx.insert(farmDailyUsage).values({ ownerId: user, day }).onConflictDoNothing();
      const [usage] = await tx.select().from(farmDailyUsage)
        .where(and(eq(farmDailyUsage.ownerId, user), eq(farmDailyUsage.day, day))).for("update");
      if (usage.count >= settings.dailyLimit) throw new ServiceError(429, "Дневной лимит действий исчерпан (UTC).");
      await tx.update(farmDailyUsage).set({ count: sql`${farmDailyUsage.count} + 1` })
        .where(and(eq(farmDailyUsage.ownerId, user), eq(farmDailyUsage.day, day)));
      const [reserved] = await tx.update(farmMontages).set({ status: "submitting", error: null })
        .where(and(own(existing.id, user), eq(farmMontages.status, "draft"))).returning();
      return reserved;
    });
    // Timeout/error is ambiguous: leave "submitting" persisted; never retry automatically.
    let project: string;
    try { project = await submitMontage(row.format, row.clips); }
    catch (e) {
      req.log.warn({ montageId: row.id, err: e instanceof Error ? e.message : "unknown" }, "JSON2Video submission outcome ambiguous");
      fail(req, res, new ServiceError(502, "Ответ JSON2Video не получен или отклонён. Повторная отправка заблокирована во избежание двойной оплаты; проверьте проект у провайдера."));
      return;
    }
    const [updated] = await db.update(farmMontages).set({ projectId: project, status: "processing" })
      .where(and(own(row.id, user), eq(farmMontages.status, "submitting"))).returning();
    res.json(RenderMontageResponse.parse(output(updated)));
  } catch (e) { fail(req, res, e); }
});

export default router;