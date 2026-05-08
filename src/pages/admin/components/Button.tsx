import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:   "bg-white text-black hover:bg-white/90 active:bg-white/80",
  secondary: "bg-admin-surface2 text-white border border-admin-border hover:bg-[#222]",
  ghost:     "bg-transparent text-admin-muted hover:text-white hover:bg-white/5",
  danger:    "bg-transparent text-admin-danger border border-admin-danger/30 hover:bg-admin-danger/10",
  outline:   "bg-transparent text-white border border-admin-border hover:border-white/40",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className = "", ...rest }, ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
});
