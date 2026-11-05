import { createHmac } from "node:crypto";
import { ReplitConnectors } from "@replit/connectors-sdk";

export class ServiceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const timeout = () => AbortSignal.timeout(45000);

export async function generateScript(title: string, brief: string, kind: string, format: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ServiceError(503, "Gemini не настроен: добавьте GEMINI_API_KEY.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-pro";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    signal: timeout(),
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `Напиши оригинальный сценарий на русском для ${kind === "video" ? "видео" : "текста"} формата ${format}. Заголовок: ${title}\nЗадание: ${brief}\nВерни только готовый сценарий.` }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });
  if (!response.ok) throw new ServiceError(502, `Gemini вернул ошибку (${response.status}). Проверьте ключ, квоту и модель.`);
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const script = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n").trim();
  if (!script) throw new ServiceError(502, "Gemini не вернул текст сценария.");
  return script;
}

export function klingReady(): boolean {
  return !!(process.env.KLING_API_KEY || (process.env.KLING_ACCESS_KEY && process.env.KLING_SECRET_KEY));
}

function klingToken(): string {
  if (process.env.KLING_API_KEY) return process.env.KLING_API_KEY;
  const access = process.env.KLING_ACCESS_KEY;
  const secret = process.env.KLING_SECRET_KEY;
  if (!access || !secret) throw new ServiceError(503, "Kling не настроен: добавьте KLING_API_KEY или KLING_ACCESS_KEY и KLING_SECRET_KEY.");
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const data = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ iss: access, exp: now + 1800, nbf: now - 5 })}`;
  return `${data}.${createHmac("sha256", secret).update(data).digest("base64url")}`;
}

type KlingData = { code?: number; data?: { task_id?: string; task_status?: string; task_status_msg?: string; task_result?: { videos?: Array<{ url?: string }> } } };
async function klingRequest(path: string, method: "POST" | "GET", body?: object): Promise<KlingData["data"]> {
  const response = await fetch(`https://api-singapore.klingai.com${path}`, {
    method, signal: timeout(),
    headers: { Authorization: `Bearer ${klingToken()}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new ServiceError(502, `Kling вернул ошибку (${response.status}); проверьте доступ и квоту.`);
  const result = await response.json() as KlingData;
  if (result.code !== 0 || !result.data) throw new ServiceError(502, "Kling отклонил запрос; проверьте настройки и квоту.");
  return result.data;
}

export async function submitVideo(id: string, script: string, format: string): Promise<string> {
  const data = await klingRequest("/v1/videos/text2video", "POST", {
    model_name: "kling-v2-5-turbo", prompt: script.slice(0, 2500),
    duration: "5", mode: "pro", aspect_ratio: format, external_task_id: id,
  });
  if (!data?.task_id) throw new ServiceError(502, "Kling не вернул идентификатор задачи; повторять отправку небезопасно.");
  return data.task_id;
}

export async function checkVideo(taskId: string) {
  const data = await klingRequest(`/v1/videos/text2video/${encodeURIComponent(taskId)}`, "GET");
  return { status: data?.task_status, url: data?.task_result?.videos?.[0]?.url };
}

const connectors = new ReplitConnectors();
export async function driveConnected(): Promise<boolean> {
  const connections = await connectors.listConnections({ connector_names: "google-drive" });
  return connections.some(c => c.connector_name === "google-drive" && (c.status === "active" || c.status === "connected"));
}

export async function exportScript(title: string, script: string, videoUrl: string | null): Promise<string> {
  if (!await driveConnected()) throw new ServiceError(503, "Google Drive не подключён к проекту.");
  const boundary = `farm-${crypto.randomUUID()}`;
  const filename = `${title.replace(/[\\/\r\n]/g, " ").slice(0, 100) || "Сценарий"}.txt`;
  const text = videoUrl ? `${script}\n\nСсылка на видео (временная, Kling хранит до 30 дней): ${videoUrl}\n` : script;
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: filename, mimeType: "text/plain" })}\r\n--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${text}\r\n--${boundary}--\r\n`;
  const response = await connectors.proxy("google-drive", "/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", {
    method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body,
  });
  if (!response.ok) throw new ServiceError(502, `Google Drive не сохранил файл (${response.status}).`);
  const data = await response.json() as { id?: string; webViewLink?: string };
  if (!data.id) throw new ServiceError(502, "Google Drive не вернул идентификатор файла.");
  return data.webViewLink || `https://drive.google.com/file/d/${encodeURIComponent(data.id)}/view`;
}