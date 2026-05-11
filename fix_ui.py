with open("src/pages/admin/SettingsPanel.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "{/* ── ABOUT PAGE TAB ─────────────────────────────────────────── */}" in line:
        skip = True
    if "{/* ── TEAM TAB ─────────────────────────────────────────────── */}" in line:
        skip = False
    
    if not skip:
        new_lines.append(line)

with open("src/pages/admin/SettingsPanel.tsx", "w") as f:
    f.writelines(new_lines)
