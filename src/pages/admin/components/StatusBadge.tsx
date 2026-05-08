type Status = "Active" | "Pending" | "Cancelled" | "None";

const map: Record<Status, { bg: string; text: string; label: string }> = {
  Active:    { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  Pending:   { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  Cancelled: { bg: "bg-red-100",  text: "text-red-700",  label: "Cancelled" },
  None:      { bg: "bg-gray-100",  text: "text-gray-600",  label: "No plan" },
};

export function StatusBadge({ status }: { status: Status }) {
  const v = map[status] ?? map.None;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>
      {v.label}
    </span>
  );
}