import { date, integer, pgTable, text, timestamp, uuid, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const farmJobs = pgTable("farm_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  brief: text("brief").notNull(),
  kind: text("kind", { enum: ["text", "video"] }).notNull(),
  format: text("format", { enum: ["9:16", "16:9", "1:1"] }).notNull(),
  status: text("status", { enum: ["draft", "script_ready", "approved", "processing", "completed", "failed"] }).notNull().default("draft"),
  script: text("script").notNull().default(""),
  error: text("error"),
  driveUrl: text("drive_url"),
  videoUrl: text("video_url"),
  providerTaskId: text("provider_task_id"),
  processingAction: text("processing_action"),
  lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertFarmJobSchema = createInsertSchema(farmJobs).omit({ id: true, createdAt: true });
export type InsertFarmJob = z.infer<typeof insertFarmJobSchema>;
export type FarmJob = typeof farmJobs.$inferSelect;

export const farmSettings = pgTable("farm_settings", {
  ownerId: text("owner_id").primaryKey(),
  workspaceName: text("workspace_name").notNull().default("Нейроферма"),
  dailyLimit: integer("daily_limit").notNull().default(10),
});
export const insertFarmSettingsSchema = createInsertSchema(farmSettings);
export type InsertFarmSettings = z.infer<typeof insertFarmSettingsSchema>;

export const farmDailyUsage = pgTable("farm_daily_usage", {
  ownerId: text("owner_id").notNull(),
  day: date("day", { mode: "string" }).notNull(),
  count: integer("count").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.ownerId, t.day] })]);
export const insertFarmDailyUsageSchema = createInsertSchema(farmDailyUsage);
export type InsertFarmDailyUsage = z.infer<typeof insertFarmDailyUsageSchema>;