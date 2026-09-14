import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      technologies: true,
      githubUrl: true,
      liveUrl: true,
      featured: true,
    },
  });

  return NextResponse.json({ items });
}
