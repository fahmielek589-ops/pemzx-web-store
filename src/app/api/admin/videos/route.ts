import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { videoSchema } from "@/lib/validation";
import { withAdminAuth, handleZodError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const featured = searchParams.get("featured");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "12")));

  const where = {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status && status !== "ALL" ? { status: status as "DRAFT" | "PUBLISHED" } : {}),
    ...(featured === "true" ? { featured: true } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.video.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(request: NextRequest) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => null);
  const parsed = videoSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const video = await prisma.video.create({
    data: {
      ...parsed.data,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
    },
  });

  return NextResponse.json({ item: video }, { status: 201 });
}
