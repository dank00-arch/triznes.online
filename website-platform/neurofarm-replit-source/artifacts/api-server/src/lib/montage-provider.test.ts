import { test } from "node:test";
import assert from "node:assert/strict";
import { moviePayload, validateMontage, mapMovieStatus, submitMontage, checkMontage } from "./montage-provider";

const clips = [
  { url: "https://media.example.org/a.mp4", seek: 2.5, duration: 8 },
  { url: "https://media.example.org/b.mp4", seek: 0, duration: 12 },
];
test("payload preserves ordered scenes and trims on both scene and element", () => {
  assert.deepEqual(moviePayload("9:16", clips), {
    resolution: "custom", width: 1080, height: 1920,
    scenes: [
      { duration: 8, elements: [{ type: "video", src: clips[0].url, seek: 2.5, duration: 8 }] },
      { duration: 12, elements: [{ type: "video", src: clips[1].url, seek: 0, duration: 12 }] },
    ],
  });
});
test("rejects non-public and malformed URLs and invalid durations", () => {
  for (const url of ["http://example.org/a.mp4", "https://localhost/a", "https://127.0.0.1/a",
    "https://[::1]/a", "https://user:pass@example.org/a", "https://metadata.google.internal/a"]) {
    assert.ok(validateMontage({ title: "Test", clips: [{ ...clips[0], url }] }), url);
  }
  for (const duration of [0, -1, 121, Infinity, NaN]) assert.ok(validateMontage({ title: "Test", clips: [{ ...clips[0], duration }] }));
  assert.ok(validateMontage({ title: "Test", clips: [{ ...clips[0], seek: Infinity }] }));
  assert.ok(validateMontage({ title: "Test", clips: Array(3).fill({ ...clips[0], duration: 101 }) }));
  assert.ok(validateMontage({ title: "Test", clips: Array(13).fill(clips[0]) }));
  assert.equal(validateMontage({ title: "Test", clips }), null);
});
test("status mapping never invents completion without a public MP4 URL", () => {
  assert.deepEqual(mapMovieStatus({ movie: { status: "done", url: "https://media.example.org/out.mp4" } }), { status: "completed", url: "https://media.example.org/out.mp4" });
  assert.equal(mapMovieStatus({ movie: { status: "done", url: "http://localhost/private" } }).status, "processing");
  assert.equal(mapMovieStatus({ movie: { status: "error" } }).status, "failed");
  assert.equal(mapMovieStatus({ movie: { status: "running" } }).status, "processing");
  assert.equal(mapMovieStatus({ movie: { status: "unexpected" } }).status, "processing");
});
test("mocked provider submission uses x-api-key and status query uses project id", async () => {
  const oldFetch = globalThis.fetch;
  const oldKey = process.env.JSON2VIDEO_API_KEY;
  process.env.JSON2VIDEO_API_KEY = "test-only";
  const calls: { url: string; options: RequestInit }[] = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options: options! });
    return new Response(JSON.stringify(calls.length === 1
      ? { success: true, project: "project-123" }
      : { success: true, movie: { status: "done", url: "https://media.example.org/output.mp4" } }), { status: 200 });
  };
  try {
    assert.equal(await submitMontage("16:9", clips), "project-123");
    assert.deepEqual(await checkMontage("project-123"), { status: "completed", url: "https://media.example.org/output.mp4" });
    assert.equal(calls[0].url, "https://api.json2video.com/v2/movies");
    assert.equal(calls[0].options.method, "POST");
    assert.equal((calls[0].options.headers as Record<string, string>)["x-api-key"], "test-only");
    assert.equal(calls[1].url, "https://api.json2video.com/v2/movies?project=project-123");
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.JSON2VIDEO_API_KEY;
    else process.env.JSON2VIDEO_API_KEY = oldKey;
  }
});