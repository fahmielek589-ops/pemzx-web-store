import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from "@/lib/validation";

/**
 * Storage abstraction
 * ============================================================
 * This default implementation writes to /public/uploads on local
 * disk, which works for a single-instance deployment but is NOT
 * durable on serverless platforms (Vercel's filesystem is
 * ephemeral/read-only outside /tmp at runtime).
 *
 * For a real Vercel/Netlify deployment, swap the body of
 * `saveFile()` for a call to your object storage provider
 * (Vercel Blob, Supabase Storage, S3, Cloudinary, etc.) — the
 * function signature and validation logic above it stay the same,
 * so nothing else in the codebase needs to change.
 */

type UploadKind = "image" | "video";

interface ValidatedFile {
  buffer: Buffer;
  extension: string;
  mimeType: string;
}

class UploadError extends Error {}

/**
 * Sniffs the real file type from its magic bytes instead of trusting
 * the client-supplied extension or Content-Type header, both of
 * which are trivial to spoof.
 */
function detectMimeType(buffer: Buffer): string | null {
  const bytes = buffer.subarray(0, 12);

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp") {
    const brand = bytes.toString("ascii", 8, 12);
    if (brand.startsWith("avif") || brand.startsWith("avis")) return "image/avif";
    return "video/mp4"; // mp4/mov family
  }
  if (bytes.length >= 4 && bytes.toString("ascii", 0, 4) === "\x1aE\xdf\xa3".slice(0, 4)) {
    return "video/webm";
  }
  // WebM/Matroska EBML header: 0x1A 0x45 0xDF 0xA3
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "video/webm";
  }
  return null;
}

const extensionByMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

async function validateUpload(file: File, kind: UploadKind): Promise<ValidatedFile> {
  const maxSize = kind === "image" ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
  const allowed = kind === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;

  if (file.size <= 0) throw new UploadError("The uploaded file is empty.");
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    throw new UploadError(`File is too large. Maximum size is ${mb}MB.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedMime = detectMimeType(buffer);

  if (!detectedMime || !allowed.includes(detectedMime as never)) {
    throw new UploadError(
      "Unsupported or unrecognized file type. The file's actual contents did not match an allowed format."
    );
  }

  return {
    buffer,
    extension: extensionByMime[detectedMime] ?? "bin",
    mimeType: detectedMime,
  };
}

/**
 * Validates and persists an uploaded file. Returns the public URL
 * path to store on the owning record (Video.videoUrl,
 * Product.imageUrl, etc.).
 */
export async function saveUpload(file: File, kind: UploadKind): Promise<string> {
  const validated = await validateUpload(file, kind);

  // Random UUID filename — never trust or reuse the client-supplied
  // filename, which could contain path traversal sequences.
  const filename = `${randomUUID()}.${validated.extension}`;
  const subdir = kind === "image" ? "images" : "videos";
  const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), validated.buffer);

  return `/uploads/${subdir}/${filename}`;
}

export { UploadError };
