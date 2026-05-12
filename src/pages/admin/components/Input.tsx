import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

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

import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label?: string;
  value?: string;
  onChange?: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ label, value, onChange, options, placeholder = "Select...", className = "", disabled }: CustomSelectProps) {
  return (
    <div className="block">
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-admin-muted">{label}</span>}
      <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
        <RadixSelect.Trigger className={`flex h-10 w-full items-center justify-between rounded-lg border border-admin-border bg-admin-surface2 px-3.5 text-sm text-white outline-none transition-colors hover:bg-admin-surface focus:border-white/30 data-[state=open]:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown size={14} className="text-admin-muted" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content position="popper" sideOffset={4} className="z-[100] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-admin-border bg-admin-surface2 shadow-xl backdrop-blur-xl animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm text-admin-muted outline-none hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white data-[state=checked]:text-white data-[state=checked]:font-medium transition-colors"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <RadixSelect.ItemIndicator>
                      <Check size={14} />
                    </RadixSelect.ItemIndicator>
                  </span>
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
