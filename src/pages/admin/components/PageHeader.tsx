import { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}
export function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="flex flex-col gap-6 border-b border-admin-border pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="mb-3 inline-block text-[11px] font-medium uppercase tracking-[0.22em] text-admin-muted">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-admin-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
