import { Storage } from "@google-cloud/storage";

// Replit App Storage sidecar credentials, as specified by the object-storage integration.
const storage = new Storage({
  credentials: {
    audience: "replit", subject_token_type: "access_token",
    token_url: "http://127.0.0.1:1106/token", type: "external_account",
    credential_source: { url: "http://127.0.0.1:1106/credential", format: { type: "json", subject_token_field_name: "access_token" } },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function privateFile(id: string) {
  const dir = process.env.PRIVATE_OBJECT_DIR;
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!dir || !bucket) throw new Error("App Storage не настроен: PRIVATE_OBJECT_DIR / DEFAULT_OBJECT_STORAGE_BUCKET_ID.");
  // PRIVATE_OBJECT_DIR is /bucket/private-prefix, not a public URL.
  const fullPath = `${dir.replace(/\/$/, "")}/generated-images/${id}`;
  const [bucketName, ...segments] = fullPath.replace(/^\/+/, "").split("/");
  if (bucketName !== bucket || !segments.length) throw new Error("PRIVATE_OBJECT_DIR не соответствует App Storage bucket.");
  return { path: `/${bucketName}/${segments.join("/")}`, file: storage.bucket(bucketName).file(segments.join("/")) };
}

export async function saveImage(id: string, bytes: Buffer, mimeType: string) {
  const { path, file } = privateFile(id);
  await file.save(bytes, { resumable: false, contentType: mimeType, validation: "crc32c" });
  return path;
}

export function getImageFile(id: string) {
  return privateFile(id).file;
}