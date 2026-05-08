type Status = "Active" | "Pending" | "Cancelled" | "None";

const map: Record<Status, { dot: string; text: string; label: string }> = {
  Active:    { dot: "bg-admin-success",          text: "text-admin-success", label: "Active" },
  Pending:   { dot: "bg-admin-warning",          text: "text-admin-warning", label: "Pending" },
  Cancelled: { dot: "bg-admin-danger",           text: "text-admin-danger",  label: "Cancelled" },
  None:      { dot: "bg-admin-muted",            text: "text-admin-muted",   label: "No plan" },
};

export function StatusBadge({ status }: { status: Status }) {
  const v = map[status] ?? map.None;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-admin-border bg-admin-surface2 px-2.5 py-1 text-[11px] font-medium tracking-wide">
      <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
      <span className={v.text}>{v.label}</span>
    </span>
  );
}
