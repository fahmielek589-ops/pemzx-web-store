import { ReactNode } from "react";

interface AdminHeaderProps {
  adminName?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// S. The personalized greeting ("Good evening, Pemzx.") is reserved
// for the main dashboard — sub-pages (Videos, Products, …) pass only
// a title/subtitle/actions so the header doesn't repeat the greeting
// on every screen (spec S: "Jangan membuat dashboard terlalu ramai").
export function AdminHeader({ adminName, title, subtitle, actions }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <h1 className="admin-header__title">{title}</h1>
        {subtitle && <p className="admin-header__subtitle">{subtitle}</p>}
      </div>
      {actions ? (
        <div className="admin-header__actions">{actions}</div>
      ) : adminName ? (
        <div className="admin-header__greeting">
          {getGreeting()}, {adminName}.
        </div>
      ) : null}
    </header>
  );
}
