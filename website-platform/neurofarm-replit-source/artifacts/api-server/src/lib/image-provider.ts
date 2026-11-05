import { ServiceError } from "./providers";

export type ImageModel = "gemini-3.1-flash-image" | "gemini-3-pro-image";
export type ImageFormat = "1:1" | "16:9" | "9:16";

export function imagePayload(prompt: string, format: ImageFormat) {
  return {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: format } },
  };
}

export function parseImage(result: unknown): { bytes: Buffer; mimeType: string; description: string | null } {
  const data = result as { promptFeedback?: { blockReason?: string }; candidates?: Array<{
    finishReason?: string; content?: { parts?: Array<{ text?: string; inlineData?: { mimeType?: string; data?: string } }> };
  }> };
  if (data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason === "SAFETY")
    throw new ServiceError(422, "Gemini заблокировал запрос по правилам безопасности. Измените описание и создайте новое творение.");
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const image = parts.find(part => part.inlineData?.data && /^image\/(png|jpeg|webp)$/.test(part.inlineData.mimeType || ""))?.inlineData;
  if (!image?.data || !image.mimeType) throw new ServiceError(502, "Gemini не вернул изображение. Проверьте описание и создайте новое творение.");
  if (image.data.length > 28_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data))
    throw new ServiceError(502, "Gemini вернул повреждённое или слишком большое изображение.");
  const bytes = Buffer.from(image.data, "base64");
  if (!bytes.length || bytes.length > 20_000_000) throw new ServiceError(502, "Изображение слишком большое или пустое.");
  const description = parts.map(part => part.text || "").join("\n").trim().slice(0, 2000) || null;
  return { bytes, mimeType: image.mimeType, description };
}

export async function generateGeminiImage(model: ImageModel, prompt: string, format: ImageFormat) {
  const key = process.env.GEMINI_IMAGE_API_KEY;
  if (!key) throw new ServiceError(503, "Ключ Gemini для изображений не настроен.");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST", signal: AbortSignal.timeout(90000),
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(imagePayload(prompt, format)),
  });
  if (!response.ok) {
    if (response.status === 429) throw new ServiceError(429, "Квота Gemini исчерпана или превышена частота запросов. Создайте новое творение позже.");
    if (response.status === 400) throw new ServiceError(422, "Gemini отклонил описание или параметры. Создайте новое творение.");
    throw new ServiceError(502, `Gemini не создал изображение (код ${response.status}). Проверьте доступ к модели и квоту.`);
  }
  return parseImage(await response.json());
}