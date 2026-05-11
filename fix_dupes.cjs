const fs = require('fs');

let text = fs.readFileSync('src/pages/admin/SettingsPanel.tsx', 'utf8');

text = text.replace(/getFileUrl: any; getFileUrl: any; getFileUrl: any;/g, "getFileUrl: any;");

let hookCount = 0;
text = text.replace(/const getFileUrl = useMutation\(api\.teamMembers\.getFileUrl\);/g, (match) => {
    hookCount++;
    return hookCount === 1 ? match : "";
});

fs.writeFileSync('src/pages/admin/SettingsPanel.tsx', text);

