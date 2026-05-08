import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className = "", ...rest }, ref
) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-admin-muted">{label}</span>}
      <input
        ref={ref}
        className={`h-11 w-full rounded-md border border-admin-border bg-admin-surface2 px-3.5 text-sm text-white placeholder:text-admin-muted/70 transition-colors focus:border-white/40 ${className}`}
        {...rest}
      />
      {hint && <span className="mt-1.5 block text-xs text-admin-muted">{hint}</span>}
    </label>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, className = "", ...rest }, ref
) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-admin-muted">{label}</span>}
      <textarea
        ref={ref}
        className={`min-h-[110px] w-full rounded-md border border-admin-border bg-admin-surface2 px-3.5 py-3 text-sm text-white placeholder:text-admin-muted/70 transition-colors focus:border-white/40 ${className}`}
        {...rest}
      />
    </label>
  );
});

export function Select({
  label, children, className = "", ...rest
}: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-admin-muted">{label}</span>}
      <select
        className={`h-11 w-full appearance-none rounded-md border border-admin-border bg-admin-surface2 px-3.5 text-sm text-white focus:border-white/40 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}
