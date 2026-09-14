import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { videoSchema } from "@/lib/validation";
import { withAdminAuth, handleZodError, notFound } from "@/lib/api-helpers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) return notFound("Video");

  return NextResponse.json({ item: video });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = videoSchema.partial().safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) return notFound("Video");

  const video = await prisma.video.update({
    where: { id },
    data: {
      ...parsed.data,
      thumbnailUrl:
        parsed.data.thumbnailUrl !== undefined
          ? parsed.data.thumbnailUrl || null
          : undefined,
    },
  });

  return NextResponse.json({ item: video });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) return notFound("Video");

  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
