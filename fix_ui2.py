import re

with open("src/pages/admin/SettingsPanel.tsx", "r") as f:
    content = f.read()

# Remove the whole About tab section
content = re.sub(r'\{/\* ── ABOUT PAGE TAB ─────────────────────────────────────────── \*/\}.*?(?=\{/\* ── TEAM TAB ─────────────────────────────────────────────── \*/\})', '', content, flags=re.DOTALL)

with open("src/pages/admin/SettingsPanel.tsx", "w") as f:
    f.write(content)
