import { NextResponse } from "next/server";
import { destroySession, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  await destroySession();

  const response = NextResponse.json({ ok: true });
  const cookieOpts = sessionCookieOptions();
  // Overwrite with an already-expired cookie to clear it client-side too.
  response.cookies.set(cookieOpts.name, "", { ...cookieOpts, maxAge: 0 });

  return response;
}
