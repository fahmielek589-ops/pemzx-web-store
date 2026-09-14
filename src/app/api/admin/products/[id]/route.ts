import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validation";
import { withAdminAuth, handleZodError, notFound, jsonError } from "@/lib/api-helpers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return notFound("Product");

  return NextResponse.json({ item: product });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return notFound("Product");

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.product.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (slugTaken) return jsonError("A product with this slug already exists.", 409);
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...parsed.data,
      imageUrl:
        parsed.data.imageUrl !== undefined ? parsed.data.imageUrl || null : undefined,
    },
  });

  return NextResponse.json({ item: product });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return notFound("Product");

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
