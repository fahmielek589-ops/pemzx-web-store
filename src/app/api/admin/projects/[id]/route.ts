import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { projectSchema } from "@/lib/validation";
import { withAdminAuth, handleZodError, notFound } from "@/lib/api-helpers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFound("Project");

  return NextResponse.json({ item: project });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return notFound("Project");

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...parsed.data,
      imageUrl:
        parsed.data.imageUrl !== undefined ? parsed.data.imageUrl || null : undefined,
      githubUrl:
        parsed.data.githubUrl !== undefined ? parsed.data.githubUrl || null : undefined,
      liveUrl:
        parsed.data.liveUrl !== undefined ? parsed.data.liveUrl || null : undefined,
    },
  });

  return NextResponse.json({ item: project });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return notFound("Project");

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
