const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/SettingsPanel.tsx', 'utf8');

// The error is that "about" is remaining in the JSX inside the "about" tab check: tab === "about"
// Let's find exactly the block starting with `{tab === "about" && (` and remove it until `{tab === "team" && (`
startIdx = content.indexOf('{tab === "about" && (');
endIdx = content.indexOf('{tab === "team" && (');
if (startIdx !== -1 && endIdx !== -1) {
    content = content.slice(0, startIdx) + content.slice(endIdx);
} else {
    // If it's a comment `/* ── ABOUT PAGE TAB `
    startIdx = content.indexOf('{/* ── ABOUT PAGE TAB');
    endIdx = content.indexOf('{/* ── TEAM TAB');
    if (startIdx !== -1 && endIdx !== -1) {
        content = content.slice(0, startIdx) + content.slice(endIdx);
    }
}

fs.writeFileSync('src/pages/admin/SettingsPanel.tsx', content);
