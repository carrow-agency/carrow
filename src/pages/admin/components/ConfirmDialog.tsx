import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  scope?: string[];          // list of things that will be deleted
  confirmLabel?: string;
  loading?: boolean;
  requireTypedConfirmation?: string;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, description, scope, confirmLabel = "Delete", loading = false, requireTypedConfirmation
}: Props) {
  const [typedValue, setTypedValue] = useState("");

  useEffect(() => {
    if (open) setTypedValue("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const isConfirmed = !requireTypedConfirmation || typedValue === requireTypedConfirmation;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-admin-border bg-admin-surface shadow-2xl">
        <div className="flex items-start justify-between border-b border-admin-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-danger/10 text-admin-danger">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-admin-muted hover:text-white hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-admin-muted">{description}</p>
          {scope && scope.length > 0 && (
            <div className="rounded-lg border border-admin-danger/20 bg-admin-danger/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-danger">
                This will permanently delete:
              </p>
              <ul className="space-y-1">
                {scope.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-admin-muted">
                    <span className="h-1 w-1 rounded-full bg-admin-danger/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {requireTypedConfirmation && (
            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium text-admin-muted block">
                Type <span className="font-mono text-white bg-white/10 px-1 py-0.5 rounded select-all">{requireTypedConfirmation}</span> to confirm
              </label>
              <input 
                type="text"
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                className="w-full bg-admin-surface2 border border-admin-border rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-admin-danger/50 focus:ring-1 focus:ring-admin-danger/50 font-mono transition-all"
                placeholder={requireTypedConfirmation}
                autoComplete="off"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-admin-border px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading || !isConfirmed}>
            {loading ? "Confirming..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
