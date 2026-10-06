import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { imagePayload, parseImage } from "./image-provider";

describe("Gemini text-to-image", () => {
  it("sends one text prompt and requested image aspect ratio", () => {
    assert.deepEqual(imagePayload("Ночной город", "16:9"), {
      contents: [{ role: "user", parts: [{ text: "Ночной город" }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: "16:9" } },
    });
  });
  it("extracts image bytes and optional text from mixed parts", () => {
    const result = parseImage({ candidates: [{ content: { parts: [
      { text: "Готово" }, { inlineData: { mimeType: "image/png", data: Buffer.from("picture").toString("base64") } },
    ] } }] });
    assert.equal(result.bytes.toString(), "picture");
    assert.equal(result.description, "Готово");
  });
  it("distinguishes safety blocks and missing image", () => {
    assert.throws(() => parseImage({ promptFeedback: { blockReason: "SAFETY" } }), /заблокировал/);
    assert.throws(() => parseImage({ candidates: [{ content: { parts: [{ text: "nothing" }] } }] }), /не вернул изображение/);
  });
});