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
  empty?: string;
}

export function DataTable<T>({ columns, data, empty = "No records." }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
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
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  {empty}
                </td>
              </tr>
            )}
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 text-sm text-gray-700 ${
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