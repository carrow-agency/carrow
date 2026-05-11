import re

with open("src/pages/admin/SettingsPanel.tsx", "r") as f:
    text = f.read()

# Make all imports and edits cleanly.

# 1. Imports
text = text.replace("import { motion } from 'framer-motion';", "import { motion, Reorder } from 'framer-motion';")
text = text.replace(
    "useDeleteTeamMember,",
    "useDeleteTeamMember,\\n  useUpdateTeamMemberOrder,"
)

# 2. Add mutations and hooks
text = text.replace(
    "const deleteMember = useDeleteTeamMember();",
    "const deleteMember = useDeleteTeamMember();\\n  const updateOrder = useUpdateTeamMemberOrder();\\n  const getFileUrl = useMutation(api.teamMembers.getFileUrl);"
)

# 3. Add local member state
local_state = """
  const [localMembers, setLocalMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    setLocalMembers(teamMembers);
  }, [teamMembers]);

  const handleReorder = async (newOrder: TeamMember[]) => {
    setLocalMembers(newOrder); // optimistic
    // Map with new indexing
    const updates = newOrder.map((m, idx) => ({ id: m._id!, order: idx }));
    await updateOrder({ updates });
  };
"""
text = text.replace("const [tab, setTab] = useState(", local_state  + "\\n  const [tab, setTab] = useState(")

# 4. Use Reorder in team logic
old_map = """<div className="space-y-2">
                      {teamMembers.map((member) => (
                        <MemberCard
                          key={member._id}
                          member={member as any}
                          onEdit={() => setDrawerMember(member)}
                          onDelete={() => handleDeleteMember(member._id!)}
                        />
                      ))}
                    </div>"""

new_map = """<Reorder.Group axis="y" values={localMembers} onReorder={handleReorder} className="space-y-2">
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

text = text.replace(old_map, new_map)

# 5. Fix handleFileChange inside MemberDrawer to query right URL
old_file_change = """      const { storageId } = await res.json();
      // Build a direct storage URL for preview
      const convexUrl = uploadUrl.split("/api/storage/")[0];
      const previewUrl = `${convexUrl}/api/storage/${storageId}`;
      setForm(prev => ({ ...prev, image: previewUrl }));"""

new_file_change = """      const { storageId } = await res.json();
      const directUrl = uploadUrl.split("/api/storage/")[0] + "/api/storage/" + storageId;
      setForm(prev => ({ ...prev, image: directUrl, _rawStorageId: storageId }));"""
# Wait! Instead of adding the mutation inside the Drawer (which we didn't inject nicely), let's just make sure when saving we construct it! 
# Actually, the user's uploaded images were failing because Convex storage URLs must be resolved but since there's no `http.ts`, it just fails. Wait... if there's no http router, `imageUrl` from Convex actually returns a cdn URL! Yes! `ctx.storage.getUrl(storageId)` returns a cloud CDN URL.

with open("src/pages/admin/SettingsPanel.tsx", "w") as f:
    f.write(text)
