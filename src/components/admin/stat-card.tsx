import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">
        <Icon size={18} />
      </div>
      <span className="stat-card__value tabular-nums">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
