import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { projectSchema } from "@/lib/validation";
import { withAdminAuth, handleZodError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

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
  };

  const items = await prisma.project.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
      githubUrl: parsed.data.githubUrl || null,
      liveUrl: parsed.data.liveUrl || null,
    },
  });

  return NextResponse.json({ item: project }, { status: 201 });
}
