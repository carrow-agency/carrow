const fs = require('fs');

let text = fs.readFileSync('src/pages/admin/SettingsPanel.tsx', 'utf8');

// 1. In MemberCard, we want to remove framer motion logic safely.
const cardStart = `function MemberCard({ member, onEdit, onDelete }: {
  member: TeamMember & { _id: string }; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group flex items-center gap-4 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors"
    >`;

const cardReplacement = `function MemberCard({ member, onEdit, onDelete }: {
  member: TeamMember & { _id: string }; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div
      className="group flex w-full items-center gap-4 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors"
    >`;

text = text.replace(cardStart, cardReplacement);

// Fix the exact closing div for MemberCard
if (text.includes("</motion.div>\n  );\n}\n\n// ─── Member Drawer")) {
    text = text.replace("</motion.div>\n  );\n}\n\n// ─── Member Drawer", "</div>\n  );\n}\n\n// ─── Member Drawer");
}

// 2. Remove default "team" tag fallback which forces it on edit
text = text.replace(/tag: member\.tag \|\| "team"/g, 'tag: member.tag || ""');

// 3. Make Reorder.Item have the styling
text = text.replace(/<Reorder\.Item key=\{member\._id\} value=\{member\}>/g, '<Reorder.Item key={member._id!} value={member} className="w-full relative select-none">');

fs.writeFileSync('src/pages/admin/SettingsPanel.tsx', text);

