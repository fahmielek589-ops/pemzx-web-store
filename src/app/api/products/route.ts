import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      comparePrice: true,
      imageUrl: true,
      category: true,
      stock: true,
      featured: true,
    },
  });

  return NextResponse.json({ items });
}
