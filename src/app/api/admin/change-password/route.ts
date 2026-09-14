import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, verifyPassword, hashPassword, destroyAllSessionsForUser, createSession, sessionCookieOptions } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation";
import { handleZodError, jsonError } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Unauthorized.", 401);

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const isCurrentValid = await verifyPassword(admin.passwordHash, parsed.data.currentPassword);
  if (!isCurrentValid) {
    return jsonError("Current password is incorrect.", 401);
  }

  const newHash = await hashPassword(parsed.data.newPassword);

  await prisma.user.update({
    where: { id: admin.id },
    data: { passwordHash: newHash },
  });

  // AR. Invalidate old sessions after a password change.
  await destroyAllSessionsForUser(admin.id);

  // Issue a fresh session for the current device so the admin isn't
  // immediately logged out of the request they just made from.
  const token = await createSession(admin.id, {
    userAgent: request.headers.get("user-agent"),
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  const response = NextResponse.json({ ok: true });
  const cookieOpts = sessionCookieOptions();
  response.cookies.set(cookieOpts.name, token, cookieOpts);
  return response;
}
