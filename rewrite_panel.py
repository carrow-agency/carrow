import re

with open("src/pages/admin/SettingsPanel.tsx", "r") as f:
    content = f.read()

# 1. Add imports
content = content.replace("import { motion } from 'framer-motion';", "import { motion, Reorder } from 'framer-motion';")
if "useUpdateTeamMemberOrder" not in content:
    content = content.replace("useDeleteTeamMember,", "useDeleteTeamMember,\\n  useUpdateTeamMemberOrder,")

# 2. Fix handleFileChange to use getFileUrl
# We can just construct the url with getFileUrl in the handler. But since handleFileChange is inside SettingsPanel or MemberDrawer...
# Wait, let's look at handleFileChange. 
