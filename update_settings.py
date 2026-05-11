import re

with open("src/pages/admin/SettingsPanel.tsx", "r") as f:
    content = f.read()

# Remove 'about' from Tab
content = re.sub(r'type Tab = "general" \| "content" \| "about" \| "team" \| "danger";', r'type Tab = "general" | "content" | "team" | "danger";', content)

# Remove Tab from TABS
content = re.sub(r'  \{ id: "about", label: "About Page", icon: <Users size=\{15\} /> \},\n', '', content)

# useState Tab remove about
content = re.sub(r'const \[tab, setTab\] = useState<Tab \| "about">\("general"\);', r'const [tab, setTab] = useState<Tab>("general");', content)

# Remove uploadingAboutImage
content = re.sub(r'  const \[uploadingAboutImage, setUploadingAboutImage\] = useState\(false\);\n  const aboutImageRef = useRef<HTMLInputElement>\(null\);\n', '', content)

# Remove const [about, setAbout]
content = re.sub(r'  const \[about, setAbout\] = useState\(\{\n    founderName: "", founderRole: "", founderBio: "", founderImage: ""\n  \}\);\n', '', content)

# Remove about from useEffect
content = re.sub(r'    setAbout\(\{\n      founderName: settings\.aboutPage\?\.founderName \|\| "",\n      founderRole: settings\.aboutPage\?\.founderRole \|\| "",\n      founderBio: settings\.aboutPage\?\.founderBio \|\| "",\n      founderImage: settings\.aboutPage\?\.founderImage \|\| "",\n    \}\);\n', '', content)

# Remove aboutPage: about from handleSave
content = re.sub(r'await updateSettings\(\{ general, home, aboutPage: about \}\);', r'await updateSettings({ general, home });', content)

# Remove handleAboutImageUpload
content = re.sub(r'  const handleAboutImageUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{.*?\n  \};\n', '', content, flags=re.DOTALL)

# Remove a helper
content = re.sub(r'  const a = \(k: keyof typeof about\) => \(v: string\) => setAbout\(p => \(\{ \.\.\.p, \[k\]: v \}\)\);\n', '', content)

# Remove about tab UI
content = re.sub(r'              \{\/\* ── ABOUT PAGE TAB ─────────────────────────────────────────── \*\/\}.*?\{/\* ── TEAM TAB ─────────────────────────────────────────────── \*/}', r'{/* ── TEAM TAB ─────────────────────────────────────────────── */}', content, flags=re.DOTALL)

with open("src/pages/admin/SettingsPanel.tsx", "w") as f:
    f.write(content)

