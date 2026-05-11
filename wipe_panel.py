import re

with open("src/pages/admin/SettingsPanel.tsx", "r") as f:
    text = f.read()

# Remove duplicate imports
text = re.sub(r'  useUpdateTeamMemberOrder,\n  useUpdateTeamMemberOrder,\n  useUpdateTeamMemberOrder,', r'  useUpdateTeamMemberOrder,', text)
text = re.sub(r'  useUpdateTeamMemberOrder,\n  useUpdateTeamMemberOrder,', r'  useUpdateTeamMemberOrder,', text)

# Remove duplicate hooks
text = re.sub(r'  const updateOrder = useUpdateTeamMemberOrder\(\);\n  const getFileUrl = useMutation\(api\.teamMembers\.getFileUrl\);\n  const updateOrder = useUpdateTeamMemberOrder\(\);\n  const getFileUrl = useMutation\(api\.teamMembers\.getFileUrl\);', r'  const updateOrder = useUpdateTeamMemberOrder();\n  const getFileUrl = useMutation(api.teamMembers.getFileUrl);', text)

# Wipe About tab again
text = re.sub(r'\{\/\* ── ABOUT PAGE TAB ─────────────────────────────────────────── \*\/\}.*?(?=\{/\* ── TEAM TAB ─────────────────────────────────────────────── \*/\})', '', text, flags=re.DOTALL)

with open("src/pages/admin/SettingsPanel.tsx", "w") as f:
    f.write(text)
