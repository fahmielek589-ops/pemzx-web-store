import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      thumbnailUrl: true,
      category: true,
      featured: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items });
}
