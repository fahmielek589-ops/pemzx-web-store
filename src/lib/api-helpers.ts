import "server-only";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ZodError } from "zod";

/**
 * Every admin API route calls this first. It is the server-side
 * enforcement point (spec AN: "Admin endpoint harus protected. Jangan
 * mengandalkan frontend hiding") — independent of whatever the UI
 * shows or hides, an unauthenticated or non-admin request is rejected
 * here before touching any data.
 */
export async function withAdminAuth() {
  const admin = await requireAdmin();
  if (!admin) {
    return {
      admin: null,
      errorResponse: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }
  return { admin, errorResponse: null };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleZodError(error: ZodError) {
  return jsonError(error.issues[0]?.message ?? "Invalid input.", 400);
}

export function notFound(what = "Resource") {
  return jsonError(`${what} not found.`, 404);
}
