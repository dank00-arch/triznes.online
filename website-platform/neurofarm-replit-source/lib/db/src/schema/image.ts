import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const farmImages = pgTable("farm_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  format: text("format", { enum: ["1:1", "16:9", "9:16"] }).notNull(),
  model: text("model", { enum: ["gemini-3.1-flash-image", "gemini-3-pro-image"] }).notNull(),
  status: text("status", { enum: ["draft", "processing", "completed", "failed", "interrupted"] }).notNull().default("draft"),
  objectPath: text("object_path"),
  mimeType: text("mime_type"),
  description: text("description"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});