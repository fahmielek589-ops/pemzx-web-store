import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, jsonError } from "@/lib/api-helpers";
import { saveUpload, UploadError } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const formData = await request.formData().catch(() => null);
  if (!formData) return jsonError("Invalid form data.");

  const file = formData.get("file");
  const kind = formData.get("kind"); // "image" | "video"

  if (!(file instanceof File)) return jsonError("No file provided.");
  if (kind !== "image" && kind !== "video") {
    return jsonError("Invalid upload kind.");
  }

  try {
    const url = await saveUpload(file, kind);
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof UploadError) {
      return jsonError(err.message, 422);
    }
    return jsonError("Upload failed. Please try again.", 500);
  }
}
