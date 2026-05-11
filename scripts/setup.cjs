const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

console.log('=============================');
console.log('   Carrow Agency Setup       ');
console.log('=============================');

try {
  const nodeVersion = process.version;
  console.log(`\n[1/4] Checking Node.js version... (${nodeVersion})`);
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
  if (majorVersion < 18) {
    console.error('❌ Error: Node.js v18 or higher is required.');
    process.exit(1);
  }
  console.log('✅ Node.js version is compatible.');

  console.log('\n[2/4] Installing dependencies (this may take a few minutes)...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed.');

  console.log('\n[3/4] Creating DEPLOYMENT_GUIDE.md...');
  const guideContent = `# Carrow Deployment Guide

## Running Locally
To start the project and open the admin dashboard:
- **Windows:** Double-click \`start-admin.bat\`
- **Mac/Linux:** Run \`./start-admin.sh\` or double-click it.

Alternatively, you can run:
\`\`\`bash
node scripts/start-admin.cjs
\`\`\`

## Architecture Notes
- Built with React, Vite, and Tailwind CSS.
- Backend powered by Convex.
`;
  fs.writeFileSync(path.join(__dirname, '..', 'DEPLOYMENT_GUIDE.md'), guideContent);
  console.log('✅ DEPLOYMENT_GUIDE.md created.');

  console.log('\n[4/4] Creating desktop shortcuts / launcher scripts...');
  const startBat = `@echo off\ncd /d "%~dp0"\necho Starting Carrow Admin...\nnode scripts/start-admin.cjs\npause`;
  const startSh = `#!/bin/bash\ncd "$(dirname "$0")"\necho "Starting Carrow Admin..."\nnode scripts/start-admin.cjs`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'start-admin.bat'), startBat);
  fs.writeFileSync(path.join(__dirname, '..', 'start-admin.sh'), startSh);
  if (os.platform() !== 'win32') {
    try { execSync('chmod +x ./start-admin.sh'); } catch(e) {}
  }
  console.log('✅ Launcher scripts created (start-admin.bat / start-admin.sh).');

  console.log('\n=============================');
  console.log('   Setup Complete!           ');
  console.log('=============================');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('\nDo you want to start the admin dashboard now? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      require('./start-admin.cjs');
    } else {
      process.exit(0);
    }
    rl.close();
  });

} catch (error) {
  console.error('\n❌ An error occurred during setup:', error.message);
  process.exit(1);
}
