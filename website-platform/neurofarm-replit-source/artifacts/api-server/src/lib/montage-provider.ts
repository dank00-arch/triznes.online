import type { MontageClip } from "@workspace/db";
import { ServiceError } from "./providers";

export function publicVideoUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password || url.port ||
      raw.length > 2048 || /[^\x21-\x7e]/.test(raw) || url.hostname.endsWith(".") ||
      url.hostname === "localhost" || url.hostname.endsWith(".localhost") ||
      url.hostname.endsWith(".local") || url.hostname.endsWith(".internal") ||
      url.hostname.endsWith(".test") || url.hostname.endsWith(".invalid") ||
      url.hostname.endsWith(".example") || url.hostname === "metadata.google.internal" ||
      /^\d+(\.\d+){0,3}$/.test(url.hostname) || url.hostname.includes(":") ||
      !url.hostname.includes(".") || !/^[a-z0-9.-]+$/i.test(url.hostname) ||
      url.hostname.split(".").some(part => !part || part.startsWith("-") || part.endsWith("-"))) return false;
    return true;
  } catch { return false; }
}

export function validateMontage(input: { title: string; clips: MontageClip[] }): string | null {
  if (!input.title.trim()) return "Укажите название монтажа.";
  if (!input.clips.length || input.clips.length > 12) return "Добавьте от 1 до 12 клипов.";
  let total = 0;
  for (const clip of input.clips) {
    if (!publicVideoUrl(clip.url)) return "Используйте публичные HTTPS-ссылки на видео без внутренних адресов.";
    if (!Number.isFinite(clip.seek) || clip.seek < 0 || !Number.isFinite(clip.duration) ||
      clip.duration <= 0 || clip.duration > 120) return "Смещение должно быть ≥ 0, длительность каждого клипа — от 0 до 120 секунд.";
    total += clip.duration;
  }
  return total > 300 ? "Общая длительность не должна превышать 300 секунд." : null;
}

export function moviePayload(format: string, clips: MontageClip[]) {
  const dimensions: Record<string, [number, number]> = { "16:9": [1920, 1080], "9:16": [1080, 1920], "1:1": [1080, 1080] };
  const [width, height] = dimensions[format];
  return { resolution: "custom", width, height, scenes: clips.map(clip => ({
    duration: clip.duration,
    elements: [{ type: "video", src: clip.url, seek: clip.seek, duration: clip.duration }],
  })) };
}

type ProviderResult = { success?: boolean; project?: string; message?: string; movie?: { status?: string; url?: string; message?: string }; status?: string; url?: string };
async function request(path: string, method: "GET" | "POST", body?: object): Promise<ProviderResult> {
  const key = process.env.JSON2VIDEO_API_KEY;
  if (!key) throw new ServiceError(503, "JSON2Video не настроен.");
  const response = await fetch(`https://api.json2video.com/v2/movies${path}`, {
    method, signal: AbortSignal.timeout(30000),
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new ServiceError(502, `JSON2Video вернул ошибку HTTP ${response.status}.`);
  const data = await response.json() as ProviderResult;
  if (data.success !== true) throw new ServiceError(502, "JSON2Video отклонил запрос; проверьте лимит и настройки.");
  return data;
}

export async function submitMontage(format: string, clips: MontageClip[]) {
  const result = await request("", "POST", moviePayload(format, clips));
  if (typeof result.project !== "string" || !result.project) throw new ServiceError(502, "JSON2Video не вернул project ID; повторная отправка небезопасна.");
  return result.project;
}

export function mapMovieStatus(result: ProviderResult): { status: "processing" | "completed" | "failed"; url?: string; error?: string } {
  const movie = result.movie;
  const status = (movie?.status ?? result.status)?.toLowerCase();
  if (status === "done" && typeof movie?.url === "string" && publicVideoUrl(movie.url)) return { status: "completed", url: movie.url };
  if (status === "error" || status === "failed") return { status: "failed", error: "JSON2Video не создал видео. Проверьте исходные клипы." };
  if (status === "done") return { status: "processing", error: "Провайдер сообщил о завершении, но не вернул публичную HTTPS-ссылку на видео." };
  if (!status || !["queued", "pending", "running", "rendering", "processing"].includes(status))
    return { status: "processing", error: "JSON2Video вернул неизвестный статус. Проверьте проект у провайдера." };
  return { status: "processing" };
}

export async function checkMontage(project: string) {
  return mapMovieStatus(await request(`?project=${encodeURIComponent(project)}`, "GET"));
}