import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${size === "lg" ? "max-w-3xl" : "max-w-xl"} overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-2xl`}
      >
        <header className="flex items-start justify-between border-b border-admin-border px-7 py-5">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-admin-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-admin-muted hover:bg-white/5 hover:text-white">
            <X size={18} />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-7 py-6">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-3 border-t border-admin-border px-7 py-4">{footer}</footer>}
      </div>
    </div>
  );
}
