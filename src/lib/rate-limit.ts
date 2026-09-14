import "server-only";
import { prisma } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000; // 15 minute window
const MAX_ATTEMPTS = 5; // per identifier within the window

/**
 * Checks whether `identifier` (email+IP combined, see route) has
 * exceeded the failed-login threshold. Backed by the database, not
 * an in-memory map, so it survives server restarts and works
 * correctly across multiple deployed instances.
 */
export async function isRateLimited(identifier: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const recentFailures = await prisma.loginAttempt.count({
    where: { identifier, success: false, createdAt: { gte: since } },
  });
  return recentFailures >= MAX_ATTEMPTS;
}

export async function recordLoginAttempt(params: {
  identifier: string;
  success: boolean;
  ipAddress?: string | null;
  userId?: string | null;
}) {
  await prisma.loginAttempt.create({
    data: {
      identifier: params.identifier,
      success: params.success,
      ipAddress: params.ipAddress ?? undefined,
      userId: params.userId ?? undefined,
    },
  });
}

/** Combine email + IP so one field alone can't be used to lock someone else out. */
export function buildRateLimitIdentifier(email: string, ip: string): string {
  return `${email.toLowerCase().trim()}::${ip}`;
}
