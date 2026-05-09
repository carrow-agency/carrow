import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className = "", ...rest }, ref
) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-admin-muted">{label}</span>}
      <input
        ref={ref}
        className={`h-10 w-full rounded-lg border border-admin-border bg-admin-surface2 px-3.5 text-sm text-white outline-none placeholder:text-admin-muted/60 transition-colors focus:border-white/30 focus:bg-admin-surface2 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
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
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-admin-muted">{label}</span>}
      <textarea
        ref={ref}
        className={`min-h-[100px] w-full rounded-lg border border-admin-border bg-admin-surface2 px-3.5 py-3 text-sm text-white outline-none placeholder:text-admin-muted/60 transition-colors focus:border-white/30 resize-none ${className}`}
        {...rest}
      />
    </label>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, children, className = "", ...rest }: SelectProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-admin-muted">{label}</span>}
      <select
        className={`h-10 w-full appearance-none rounded-lg border border-admin-border bg-admin-surface2 px-3.5 text-sm text-white outline-none transition-colors focus:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}
