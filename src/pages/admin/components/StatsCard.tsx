import { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  iconColor?: string;
  className?: string;
}

export function StatsCard({ label, value, hint, icon, iconColor = "text-white/30", className }: Props) {
  return (
    <div className={`rounded-xl border border-admin-border bg-admin-surface p-5 ${className || ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-admin-muted">{label}</span>
        {icon && <span className={iconColor}>{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      {hint && <p className="text-xs text-admin-muted mt-1">{hint}</p>}
    </div>
  );
}