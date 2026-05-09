import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: string;
  render: (row: T, idx: number) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T, idx: number) => string;
  empty?: string;
}

export function DataTable<T>({
  columns, data, rowKey, empty = "No records found."
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-admin-muted ${
                    c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-admin-muted">
                  {empty}
                </td>
              </tr>
            )}
            {data.map((row, idx) => (
              <tr
                key={rowKey ? rowKey(row, idx) : idx}
                className="border-b border-admin-border/50 last:border-b-0 hover:bg-white/[0.02] transition-colors"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3.5 text-sm text-white/90 ${
                      c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {c.render(row, idx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}