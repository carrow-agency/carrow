import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:   "bg-white text-admin-bg hover:bg-white/90",
  secondary: "bg-admin-surface2 text-white border border-admin-border hover:bg-white/10 hover:border-white/20",
  ghost:     "bg-transparent text-admin-muted hover:text-white hover:bg-white/5",
  outline:   "bg-transparent text-white border border-admin-border hover:border-white/40 hover:bg-white/5",
  danger:    "bg-admin-danger/10 text-admin-danger border border-admin-danger/20 hover:bg-admin-danger/20",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className = "", ...rest }, ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
});