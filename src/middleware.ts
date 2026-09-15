import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

/**
 * Edge middleware: fast-path redirect for unauthenticated visitors
 * hitting /admin/*. This is a UX convenience, NOT the security
 * boundary — middleware can only cheaply check "does a session
 * cookie exist", not "is it valid and does this user have the
 * ADMIN role". That full check (requireAdmin(), which hits the
 * database) runs again in every admin layout/page/API route, which
 * is the actual authorization boundary. Never rely on middleware
 * alone to gate access.
 */
export function middleware(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
