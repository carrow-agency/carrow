const fs = require('fs');

let text = fs.readFileSync('src/pages/admin/SettingsPanel.tsx', 'utf8');

// 1. Add missing imports
if (!text.includes("import { motion, Reorder } from 'framer-motion';")) {
    text = text.replace("import { motion } from 'framer-motion';", "import { motion, Reorder } from 'framer-motion';");
}

if (!text.includes("useUpdateTeamMemberOrder,")) {
    text = text.replace("useDeleteTeamMember,", "useDeleteTeamMember,\n  useUpdateTeamMemberOrder,");
}

// 2. Add local state inside SettingsPanel
const localStateCode = `
  const updateOrder = useUpdateTeamMemberOrder();
  const getFileUrl = useMutation(api.teamMembers.getFileUrl);
  const [localMembers, setLocalMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    setLocalMembers(teamMembers);
  }, [teamMembers]);

  const handleReorder = async (newOrder: TeamMember[]) => {
    setLocalMembers(newOrder); // Optimistic UI
    const updates = newOrder.map((m, idx) => ({ id: m._id!, order: idx }));
    await updateOrder({ updates });
  };
`;

if (!text.includes("const handleReorder = async")) {
    text = text.replace("const deleteMember = useDeleteTeamMember();", "const deleteMember = useDeleteTeamMember();" + localStateCode);
}


// 3. Make MemberDrawer receive getFileUrl and use it
text = text.replace("function MemberDrawer({ member, onSave, onClose }: {", "function MemberDrawer({ member, onSave, onClose, getFileUrl }: {");
text = text.replace("member: TeamMember; onSave: (m: TeamMember) => void; onClose: () => void;", "member: TeamMember; onSave: (m: TeamMember) => void; onClose: () => void; getFileUrl: any;");

const replaceUploadLogic = `      const { storageId } = await res.json();
      const directUrl = await getFileUrl({ storageId });
      if (directUrl) setForm(prev => ({ ...prev, image: directUrl }));`;

const targetLogicStart = `      const { storageId } = await res.json();`;
const targetLogicEnd = `setForm(prev => ({ ...prev, image: previewUrl }));`;

if(text.includes(targetLogicEnd)) {
    const startIndex = text.indexOf(targetLogicStart);
    const endIndex = text.indexOf(targetLogicEnd) + targetLogicEnd.length;
    text = text.slice(0, startIndex) + replaceUploadLogic + text.slice(endIndex);
}

// 4. Update the render logic for the MemberCards to use Reorder.Group
const reorderMarkup = `<Reorder.Group axis="y" values={localMembers} onReorder={handleReorder} className="space-y-2">
                      {localMembers.map((member) => (
                        <Reorder.Item key={member._id} value={member}>
                          <MemberCard
                            member={member as any}
                            onEdit={() => setDrawerMember({ ...member, tag: member.tag || "team" })}
                            onDelete={() => handleDeleteMember(member._id!)}
                          />
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>`;

const oldMarkupStart = `<div className="space-y-2">
                      {(teamMembers`;
const oldMarkupEnd = `/>
                      ))}
                    </div>`;

if(text.includes(oldMarkupEnd)) {
    const s = text.indexOf('<div className="space-y-2">');
    const e = text.indexOf('</div>', s) + 6;
    const substr = text.slice(s, e);
    
    // make sure we are not replacing another space-y-2 div.
    if(substr.includes("teamMembers")) {
         text = text.slice(0, s) + reorderMarkup + text.slice(e);
    }
}

// Ensure drawer injection has getFileUrl
text = text.replace("<MemberDrawer member={drawerMember} onSave={handleSaveMember} onClose={() => setDrawerMember(null)}", "<MemberDrawer getFileUrl={getFileUrl} member={drawerMember} onSave={handleSaveMember} onClose={() => setDrawerMember(null)}");

fs.writeFileSync('src/pages/admin/SettingsPanel.tsx', text);
