import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AccessDenied } from "@/components/admin/access-denied";
import { ToastProvider } from "@/components/admin/toast";
import { getSessionUser } from "@/lib/auth";
import "@/components/admin/admin-sidebar.css";
import "@/components/admin/status-page.css";
import "@/components/admin/toast.css";
import "./admin-shell.css";

export const metadata = {
  robots: { index: false, follow: false }, // BD. Admin SEO — never indexed
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full server-side check: valid session AND role === "ADMIN",
  // verified against the database on every request. This is the
  // real authorization boundary (middleware.ts is only a fast-path
  // redirect for the common case of "no cookie at all").
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (sessionUser.role !== "ADMIN") {
    return <AccessDenied />;
  }

  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  return (
    <ToastProvider>
      <div className="admin-shell">
        <AdminSidebar adminName={admin.name} />
        <div className="admin-shell__main">{children}</div>
      </div>
    </ToastProvider>
  );
}
