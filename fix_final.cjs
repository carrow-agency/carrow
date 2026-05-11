const fs = require('fs');

let text = fs.readFileSync('src/pages/admin/SettingsPanel.tsx', 'utf8');

// 1. In MemberCard, remove motion.div layot for dragging
text = text.replace(/<motion\.div\n\s*layout/g, "<div");
text = text.replace(/exit=\{\{ opacity: 0, y: -8 \}\}/g, "");
text = text.replace(/className="group flex items-center/g, 'className="group flex items-center w-full');
text = text.replace(/<\/motion\.div>/g, "</div>");

// 2. Remove default "team" tag fallback which forces it on edit
text = text.replace(/tag: member\.tag \|\| "team"/g, 'tag: member.tag || ""');
text = text.replace(/tag: m\.tag \|\| "team"/g, 'tag: m.tag || ""');

// 3. Make Reorder.Item have the styling
text = text.replace(/<Reorder\.Item key=\{member\._id\} value=\{member\}>/g, '<Reorder.Item key={member._id!} value={member} className="w-full relative select-none">');

fs.writeFileSync('src/pages/admin/SettingsPanel.tsx', text);
