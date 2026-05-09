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
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative flex flex-col w-full ${size === "lg" ? "max-w-3xl" : "max-w-xl"} max-h-[90vh] overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-2xl`}
      >
        <header className="flex items-start justify-between border-b border-admin-border px-7 py-5 shrink-0">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-admin-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-admin-muted hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-admin-border px-7 py-4 shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
