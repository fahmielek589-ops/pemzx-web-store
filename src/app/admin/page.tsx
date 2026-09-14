import { getSessionUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { prisma } from "@/lib/db";
import { Film, ShoppingBag, FolderKanban, MessageSquare } from "lucide-react";
import "@/components/admin/admin-header.css";
import "@/components/admin/stat-card.css";

export const metadata = {
  title: "Dashboard — PEMZX",
};

export default async function AdminDashboardPage() {
  const admin = await getSessionUser();

  const [totalVideos, totalProducts, totalProjects, totalMessages] = await Promise.all([
    prisma.video.count(),
    prisma.product.count(),
    prisma.project.count(),
    prisma.message.count(),
  ]);

  return (
    <div>
      <AdminHeader
        adminName={admin?.name ?? "Pemzx"}
        title="Dashboard"
        subtitle="Manage your website content from one place."
      />

      <div className="admin-card-grid">
        <StatCard label="Total Videos" value={totalVideos} icon={Film} />
        <StatCard label="Total Products" value={totalProducts} icon={ShoppingBag} />
        <StatCard label="Total Projects" value={totalProjects} icon={FolderKanban} />
        <StatCard label="Total Messages" value={totalMessages} icon={MessageSquare} />
      </div>
    </div>
  );
}
