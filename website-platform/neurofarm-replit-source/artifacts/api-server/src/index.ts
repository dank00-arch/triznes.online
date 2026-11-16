import app from "./app";
import { logger } from "./lib/logger";
import { db, farmImages } from "@workspace/db";
import { eq } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// A previous process's paid in-flight call cannot safely be replayed on restart.
await db.update(farmImages).set({
  status: "interrupted",
  error: "Генерация прервана перезапуском сервера. Повторная платная отправка заблокирована; создайте новое творение.",
}).where(eq(farmImages.status, "processing"));

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
