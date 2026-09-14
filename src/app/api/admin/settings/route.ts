import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteSettingsSchema } from "@/lib/validation";
import { withAdminAuth, handleZodError } from "@/lib/api-helpers";

async function getOrCreateSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { id: "singleton" } });
}

export async function GET() {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const settings = await getOrCreateSettings();
  return NextResponse.json({ item: settings });
}

export async function PATCH(request: NextRequest) {
  const { errorResponse } = await withAdminAuth();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => null);
  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  await getOrCreateSettings();

  const settings = await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: {
      ...parsed.data,
      githubUrl: parsed.data.githubUrl || null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      instagramUrl: parsed.data.instagramUrl || null,
      xUrl: parsed.data.xUrl || null,
    },
  });

  return NextResponse.json({ item: settings });
}
