import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type MontageClip = { url: string; seek: number; duration: number };
export const farmMontages = pgTable("farm_montages", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  format: text("format", { enum: ["16:9", "9:16", "1:1"] }).notNull(),
  clips: jsonb("clips").$type<MontageClip[]>().notNull(),
  status: text("status", { enum: ["draft", "submitting", "processing", "completed", "failed"] }).notNull().default("draft"),
  projectId: text("project_id"),
  videoUrl: text("video_url"),
  error: text("error"),
  lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertFarmMontageSchema = createInsertSchema(farmMontages).omit({ id: true, createdAt: true });
export type InsertFarmMontage = z.infer<typeof insertFarmMontageSchema>;
export type FarmMontage = typeof farmMontages.$inferSelect;