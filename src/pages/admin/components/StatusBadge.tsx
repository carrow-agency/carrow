type Status = "Active" | "Pending" | "Cancelled" | "None";

const map: Record<Status, { dot: string; bg: string; text: string; label: string }> = {
  Active:    { dot: "bg-green-400",  bg: "bg-green-500/10",  text: "text-green-400",  label: "Active" },
  Pending:   { dot: "bg-amber-400",  bg: "bg-amber-500/10",  text: "text-amber-400",  label: "Pending" },
  Cancelled: { dot: "bg-red-400",    bg: "bg-red-500/10",    text: "text-red-400",    label: "Cancelled" },
  None:      { dot: "bg-white/20",   bg: "bg-white/5",       text: "text-white/40",   label: "No plan" },
};

export function StatusBadge({ status }: { status: Status }) {
  const v = map[status] ?? map.None;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
      {v.label}
    </span>
  );
}