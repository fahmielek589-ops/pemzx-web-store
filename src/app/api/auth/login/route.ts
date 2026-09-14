import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, sessionCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { isRateLimited, recordLoginAttempt, buildRateLimitIdentifier } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const identifier = buildRateLimitIdentifier(email, ip);

  if (await isRateLimited(identifier)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always run a verify call even when no user exists, using a
  // precomputed dummy hash, so response timing does not reveal
  // whether the email is registered.
  const DUMMY_HASH =
    "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$XvKh1234567890abcdefghijklmnopqrstuvwxyz";
  const hashToCheck = user?.passwordHash ?? DUMMY_HASH;
  const passwordValid = await verifyPassword(hashToCheck, password);

  const isValidLogin = Boolean(user) && passwordValid && user!.status === "ACTIVE";

  await recordLoginAttempt({
    identifier,
    success: isValidLogin,
    ipAddress: ip,
    userId: user?.id,
  });

  if (!isValidLogin) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const token = await createSession(user!.id, {
    userAgent: request.headers.get("user-agent"),
    ipAddress: ip,
  });

  await prisma.user.update({
    where: { id: user!.id },
    data: { lastLoginAt: new Date() },
  });

  const response = NextResponse.json({
    ok: true,
    user: { id: user!.id, email: user!.email, name: user!.name, role: user!.role },
  });

  const cookieOpts = sessionCookieOptions();
  response.cookies.set(cookieOpts.name, token, cookieOpts);

  return response;
}
