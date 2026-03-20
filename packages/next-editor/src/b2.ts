import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

export type B2Config = {
  endpoint: string;
  region: string;
  bucketName: string;
  applicationKeyId: string;
  applicationKey: string;
  publicBaseUrl: string;
};

let cachedClient: S3Client | null = null;

export async function uploadImageToB2(file: File, config?: B2Config) {
  if (!IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error("Only common web image formats can be uploaded.");
  }

  const resolvedConfig = config ?? getB2Config();
  const key = buildObjectKey(file.name);
  const body = Buffer.from(await file.arrayBuffer());
  const client = getB2Client(resolvedConfig);

  await client.send(
    new PutObjectCommand({
      Bucket: resolvedConfig.bucketName,
      Key: key,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: `${resolvedConfig.publicBaseUrl}/${key}`,
  };
}

export function hasB2Config(env = process.env) {
  try {
    getB2Config(env);
    return true;
  } catch {
    return false;
  }
}

export function getB2Config(env = process.env): B2Config {
  const endpoint = env.B2_ENDPOINT;
  const region = env.B2_REGION;
  const bucketName = env.B2_BUCKET_NAME;
  const applicationKeyId = env.B2_APPLICATION_KEY_ID;
  const applicationKey = env.B2_APPLICATION_KEY;
  const publicBaseUrl = env.B2_PUBLIC_BASE_URL ?? env.B2_BUCKET_PUBLIC_URL;

  if (
    !endpoint ||
    !region ||
    !bucketName ||
    !applicationKeyId ||
    !applicationKey ||
    !publicBaseUrl
  ) {
    throw new Error(
      "Missing Backblaze B2 configuration. Set B2_ENDPOINT, B2_REGION, B2_BUCKET_NAME, B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, and B2_PUBLIC_BASE_URL.",
    );
  }

  return {
    endpoint,
    region,
    bucketName,
    applicationKeyId,
    applicationKey,
    publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
  };
}

function getB2Client(config: B2Config) {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.applicationKeyId,
        secretAccessKey: config.applicationKey,
      },
    });
  }

  return cachedClient;
}

function buildObjectKey(fileName: string) {
  const today = new Date().toISOString().slice(0, 10);
  const safeName = sanitizeFileName(fileName);

  return `editor-images/${today}/${randomUUID()}-${safeName}`;
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
