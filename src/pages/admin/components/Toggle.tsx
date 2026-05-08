interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}
export function Toggle({ checked, onChange, label }: Props) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full border transition-colors ${checked ? "bg-white border-white" : "bg-admin-surface2 border-admin-border"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${checked ? "left-[18px] bg-black" : "left-0.5 bg-admin-muted"}`}
        />
      </button>
      {label && <span className="text-sm text-white/80">{label}</span>}
    </label>
  );
}
