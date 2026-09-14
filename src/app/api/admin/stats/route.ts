import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdminAuth } from "@/lib/api-helpers";

export async function GET() {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const [totalVideos, totalProducts, totalProjects, totalMessages, unreadMessages] =
    await Promise.all([
      prisma.video.count(),
      prisma.product.count(),
      prisma.project.count(),
      prisma.message.count(),
      prisma.message.count({ where: { status: "UNREAD" } }),
    ]);

  return NextResponse.json({
    totalVideos,
    totalProducts,
    totalProjects,
    totalMessages,
    unreadMessages,
  });
}
