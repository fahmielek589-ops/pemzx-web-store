import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdminAuth } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status && status !== "ALL" ? { status: status as "UNREAD" | "READ" | "ARCHIVED" } : {};

  const items = await prisma.message.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}
