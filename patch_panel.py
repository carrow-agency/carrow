import re

with open("src/pages/admin/SettingsPanel.tsx", "r") as f:
    content = f.read()

# 1. Imports
content = re.sub(r'import \{ motion \} from \'framer-motion\';', r'import { motion, Reorder } from \'framer-motion\';', content)

# 2. Add useUpdateTeamMemberOrder hook
content = re.sub(
    r'useDeleteTeamMember,\n  useClearSettings,',
    r'useDeleteTeamMember,\n  useClearSettings,\n  useUpdateTeamMemberOrder,',
    content
)

# 3. Add getFileUrl to MemberDrawer
content = re.sub(
    r'const generateUploadUrl = useMutation\(api\.files\.generateUploadUrl\);',
    r'const generateUploadUrl = useMutation(api.files.generateUploadUrl);\n  const getFileUrl = useMutation(api.teamMembers.getFileUrl);',
    content
)

# 4. HandleFileChange inside MemberDrawer
content = re.sub(
    r'const convexUrl = uploadUrl\.split\("/api/storage/"\)\[0\];\n      const previewUrl = `\$\{convexUrl\}/api/storage/\$\{storageId\}`;\n      setForm\(prev => \(\{ \.\.\.prev, image: previewUrl \}\)\);',
    r'const fileUrl = await getFileUrl({ storageId });\n      if (fileUrl) setForm(prev => ({ ...prev, image: fileUrl }));',
    content
)

# 5. Insert local state for reorder inside SettingsPanel
local_members_state = """  const updateOrder = useUpdateTeamMemberOrder();
  const [localMembers, setLocalMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    setLocalMembers(teamMembers);
  }, [teamMembers]);

  const handleReorder = async (newOrder: TeamMember[]) => {
    setLocalMembers(newOrder);
    const updates = newOrder.map((m, i) => ({ id: m._id as Id<"teamMembers">, order: i }));
    await updateOrder({ updates });
  };
"""
content = re.sub(
    r'const deleteMember = useDeleteTeamMember\(\);',
    r'const deleteMember = useDeleteTeamMember();\n' + local_members_state,
    content
)

# 6. Replace team members mapping with Reorder group
reorder_code = """<Reorder.Group axis="y" values={localMembers} onReorder={handleReorder} className="space-y-2">
                      {localMembers.map((member) => (
                        <Reorder.Item key={member._id} value={member}>
                          <MemberCard
                            member={member as any}
                            onEdit={() => setDrawerMember(member)}
                            onDelete={() => handleDeleteMember(member._id!)}
                          />
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>"""

content = re.sub(
    r'<div className="space-y-2">\s*\{teamMembers\.map\(\(member\) => \(\s*<MemberCard\s*key=\{member\._id\}[\s\S]*?/>\s*\)\)\}\s*</div>',
    reorder_code,
    content
)

with open("src/pages/admin/SettingsPanel.tsx", "w") as f:
    f.write(content)
