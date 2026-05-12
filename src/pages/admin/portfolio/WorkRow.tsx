import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Layout, Pencil, Trash2 } from "lucide-react";
import { Toggle } from "../components/Toggle";
import { WorkMediaStrip } from "./WorkMediaStrip";

import { Work } from "../../../types";

export function WorkRow({
  work,
  onEdit,
  onDelete,
  onTogglePublish,
  showUser,
}: {
  work: Work;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: (v: boolean) => void;
  showUser?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-[#141414] hover:bg-[#0e0e0e] transition-colors group">
        <td className="p-3 w-14">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#222] flex-shrink-0">
            {work.url ? (
              <img src={work.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#333]">
                <ImageIcon size={14} />
              </div>
            )}
          </div>
        </td>
        <td className="p-3">
          <p className="text-sm font-medium text-white leading-tight">{work.title}</p>
          <p className="text-xs text-[#444] mt-0.5">{work.category}</p>
        </td>
        {showUser && (
          <td className="p-3">
            <p className="text-xs text-[#666]">{work.client || "—"}</p>
          </td>
        )}
        <td className="p-3">
          <Toggle checked={work.published ?? false} onChange={onTogglePublish} label={work.published ? "Live" : "Draft"} />
        </td>
        <td className="p-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[#444] hover:text-white transition-colors flex items-center gap-1"
          >
            <Layout size={12} />
            Media
          </button>
        </td>
        <td className="p-3">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={showUser ? 6 : 5} className="bg-[#0a0a0a] px-4 py-3 border-b border-[#141414]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#333] mb-2">Additional media</p>
              <WorkMediaStrip workId={work.id} />
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
