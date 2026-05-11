import re

with open("src/pages/admin/SettingsPanel.tsx", "r") as f:
    text = f.read()

# Specifically locate the whole about block and nuke it
start = text.find("{/* ── ABOUT PAGE TAB")
end = text.find("{/* ── TEAM TAB")

if start != -1 and end != -1:
    text = text[:start] + text[end:]

with open("src/pages/admin/SettingsPanel.tsx", "w") as f:
    f.write(text)
