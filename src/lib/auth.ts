/**
 * PEMZX — Authentication core
 * ============================================================
 * Everything credential-shaped in this file is either:
 *   (a) a value read from process.env at runtime, or
 *   (b) a value generated randomly (session tokens), or
 *   (c) a one-way hash.
 * No email, password, or admin secret is ever written literally
 * in this file or anywhere else in the source tree.
 */

import "server-only";
import argon2 from "argon2";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE_NAME = "pemzx_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// ---------------------------------------------------------------
// Password hashing (Argon2id — memory-hard, resistant to GPU/ASIC
// cracking, the algorithm the OWASP password storage guide
// currently recommends as first choice).
// ---------------------------------------------------------------

export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 19456, // ~19 MB, OWASP-recommended minimum for argon2id
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(
  hash: string,
  plainPassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    // Malformed hash, mismatched params, etc. — treat as invalid,
    // never throw into the caller's control flow.
    return false;
  }
}

// ---------------------------------------------------------------
// Session tokens
// ---------------------------------------------------------------
// The cookie holds a random opaque token. The database stores only
// a SHA-256 hash of that token, never the token itself — this
// mirrors how you'd store a password, so that reading the database
// does not hand out valid sessions.

function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  meta: { userAgent?: string | null; ipAddress?: string | null }
): Promise<string> {
  const token = generateSessionToken();
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      userAgent: meta.userAgent ?? undefined,
      ipAddress: meta.ipAddress ?? undefined,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return token;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    // Expired — clean up lazily and report as logged out.
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (session.user.status !== "ACTIVE") return null;

  return session.user;
}

/** Server-side authorization check. Never trust a client-supplied role. */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});
  }
}

/** Invalidate every session for a user — used after a password change. */
export async function destroyAllSessionsForUser(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
