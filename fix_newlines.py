with open("src/pages/admin/SettingsPanel.tsx", "r") as f:
    text = f.read()

text = text.replace("\\n", "\n")

with open("src/pages/admin/SettingsPanel.tsx", "w") as f:
    f.write(text)
