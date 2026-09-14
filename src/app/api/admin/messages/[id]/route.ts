import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAdminAuth, handleZodError, notFound } from "@/lib/api-helpers";

interface Params {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  status: z.enum(["UNREAD", "READ", "ARCHIVED"]),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) return notFound("Message");

  const message = await prisma.message.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ item: message });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) return notFound("Message");

  await prisma.message.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
