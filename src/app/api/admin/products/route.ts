import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validation";
import { withAdminAuth, handleZodError, jsonError } from "@/lib/api-helpers";

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
            { name: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status && status !== "ALL"
      ? { status: status as "DRAFT" | "PUBLISHED" | "OUT_OF_STOCK" }
      : {}),
    ...(featured === "true" ? { featured: true } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(request: NextRequest) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const existingSlug = await prisma.product.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existingSlug) {
    return jsonError("A product with this slug already exists.", 409);
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
      comparePrice: parsed.data.comparePrice ?? null,
    },
  });

  return NextResponse.json({ item: product }, { status: 201 });
}
