import { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="flex flex-col gap-2 pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-admin-muted">{eyebrow}</span>
        )}
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">{title}</h1>
        {description && <p className="text-sm text-admin-muted mt-1 max-w-xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}