import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, farmDailyUsage, farmImages, farmSettings } from "@workspace/db";
import { CreateImageBody, CreateImageResponse, GenerateImageParams, GenerateImageResponse, ListImagesResponse } from "@workspace/api-zod";
import { ServiceError } from "../lib/providers";
import { generateGeminiImage } from "../lib/image-provider";
import { getImageFile, saveImage } from "../lib/image-storage";

const router: IRouter = Router();
const user = (req: Request) => getAuth(req).userId;
const own = (id: string, uid: string) => and(eq(farmImages.id, id), eq(farmImages.ownerId, uid));
const output = (row: typeof farmImages.$inferSelect) => ({
  id: row.id, title: row.title, prompt: row.prompt, format: row.format, model: row.model,
  status: row.status, description: row.description, error: row.error,
  imageUrl: row.status === "completed" && row.objectPath ? `/api/farm/images/${row.id}/file` : null,
  createdAt: row.createdAt,
});
function fail(req: Request, res: Response, e: unknown) {
  if (e instanceof ServiceError) res.status(e.status).json({ error: e.message });
  else { req.log.error({ err: e }, "Image operation failed"); res.status(500).json({ error: "Ошибка создания изображения. Проверьте галерею перед новым платным запросом." }); }
}

router.use("/farm/images", (req: Request, res: Response, next: NextFunction) => {
  if (!user(req)) { res.status(401).json({ error: "Войдите в аккаунт." }); return; }
  next();
});
router.get("/farm/images", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(farmImages).where(eq(farmImages.ownerId, user(req)!)).orderBy(desc(farmImages.createdAt));
    res.json(ListImagesResponse.parse(rows.map(output)));
  } catch (e) { fail(req, res, e); }
});
router.post("/farm/images", async (req, res): Promise<void> => {
  const parsed = CreateImageBody.safeParse(req.body);
  if (!parsed.success || !parsed.data.title.trim() || parsed.data.prompt.trim().length < 10) {
    res.status(400).json({ error: "Название и описание обязательны (от 10 до 2000 символов)." }); return;
  }
  try {
    const [row] = await db.insert(farmImages).values({ ...parsed.data, title: parsed.data.title.trim(), prompt: parsed.data.prompt.trim(), ownerId: user(req)! }).returning();
    res.status(201).json(CreateImageResponse.parse(output(row)));
  } catch (e) { fail(req, res, e); }
});
router.post("/farm/images/:id/generate", async (req, res): Promise<void> => {
  const parsed = GenerateImageParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: "Некорректный идентификатор." }); return; }
  const uid = user(req)!;
  if (!process.env.FARM_OWNER_USER_ID?.trim() || uid !== process.env.FARM_OWNER_USER_ID.trim()) {
    res.status(403).json({ error: "Платная генерация доступна только владельцу фермы (FARM_OWNER_USER_ID)." }); return;
  }
  if (!process.env.GEMINI_IMAGE_API_KEY) { res.status(503).json({ error: "Ключ Gemini для изображений не настроен." }); return; }
  let reserved = false;
  try {
    const row = await db.transaction(async tx => {
      const [existing] = await tx.select().from(farmImages).where(own(parsed.data.id, uid)).for("update");
      if (!existing) throw new ServiceError(404, "Творение не найдено.");
      if (existing.status !== "draft") throw new ServiceError(409, "Генерация уже запущена или завершена. Повторная платная отправка заблокирована.");
      await tx.insert(farmSettings).values({ ownerId: uid }).onConflictDoNothing();
      const [settings] = await tx.select().from(farmSettings).where(eq(farmSettings.ownerId, uid)).for("update");
      const day = new Date().toISOString().slice(0, 10);
      await tx.insert(farmDailyUsage).values({ ownerId: uid, day }).onConflictDoNothing();
      const [usage] = await tx.select().from(farmDailyUsage).where(and(eq(farmDailyUsage.ownerId, uid), eq(farmDailyUsage.day, day))).for("update");
      if (usage.count >= settings.dailyLimit) throw new ServiceError(429, "Дневной лимит действий исчерпан (UTC).");
      await tx.update(farmDailyUsage).set({ count: sql`${farmDailyUsage.count} + 1` }).where(and(eq(farmDailyUsage.ownerId, uid), eq(farmDailyUsage.day, day)));
      const [updated] = await tx.update(farmImages).set({ status: "processing" }).where(own(existing.id, uid)).returning();
      return updated;
    });
    reserved = true;
    // No retries: a timed-out paid request may have succeeded upstream.
    const image = await generateGeminiImage(row.model, row.prompt, row.format);
    const path = await saveImage(row.id, image.bytes, image.mimeType);
    const [done] = await db.update(farmImages).set({
      status: "completed", objectPath: path, mimeType: image.mimeType, description: image.description,
    }).where(and(own(row.id, uid), eq(farmImages.status, "processing"))).returning();
    if (!done) throw new ServiceError(500, "Не удалось сохранить результат. Проверьте галерею.");
    res.json(GenerateImageResponse.parse(output(done)));
  } catch (e) {
    if (reserved) {
      const message = e instanceof ServiceError ? e.message : "Запрос был прерван или хранилище недоступно. Повторная отправка заблокирована; создайте новое творение.";
      await db.update(farmImages).set({ status: "failed", error: message })
        .where(and(own(parsed.data.id, uid), eq(farmImages.status, "processing"))).catch(err => req.log.error({ err }, "Could not mark image failure"));
    }
    fail(req, res, e);
  }
});
router.get("/farm/images/:id/file", async (req, res): Promise<void> => {
  const parsed = GenerateImageParams.safeParse(req.params);
  if (!parsed.success) { res.sendStatus(404); return; }
  try {
    const [row] = await db.select().from(farmImages).where(own(parsed.data.id, user(req)!));
    if (!row || row.status !== "completed" || !row.objectPath) { res.sendStatus(404); return; }
    // Storage key is derived from the owner-scoped DB record ID; no arbitrary paths accepted.
    res.setHeader("Content-Type", row.mimeType || "application/octet-stream");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", `inline; filename="image-${row.id}.${row.mimeType === "image/jpeg" ? "jpg" : row.mimeType === "image/webp" ? "webp" : "png"}"`);
    getImageFile(row.id).createReadStream().on("error", err => {
      req.log.error({ err, imageId: row.id }, "Image storage read failed");
      if (!res.headersSent) res.status(502).json({ error: "Не удалось получить изображение из хранилища." });
      else res.destroy(err);
    }).pipe(res);
  } catch (e) { fail(req, res, e); }
});

export default router;