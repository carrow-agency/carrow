import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
