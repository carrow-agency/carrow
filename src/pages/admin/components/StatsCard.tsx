import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({ label, value, delta, hint, icon, className }: Props) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={`group relative overflow-hidden rounded-xl border border-admin-border bg-admin-surface p-6 transition-colors hover:border-white/20 ${className || ''}`}>
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-admin-muted">{label}</span>
        {icon && <span className="text-admin-muted">{icon}</span>}
      </div>
      <div className="mt-6 flex items-end justify-between">
        <span className="font-display text-4xl font-semibold tracking-tight text-white">{value}</span>
        {typeof delta === "number" && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${positive ? "text-admin-success" : "text-admin-danger"}`}>
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <p className="mt-3 text-xs text-admin-muted">{hint}</p>}
    </div>
  );
}
