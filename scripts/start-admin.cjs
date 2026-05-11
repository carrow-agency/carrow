const { execSync, spawn } = require('child_process');
const os = require('os');
const path = require('path');

console.log('--- Starting Carrow Admin ---');

const isWin = os.platform() === 'win32';

try {
  console.log('Checking port 3000...');
  if (isWin) {
    // Windows: Use powershell to find and kill process on port 3000
    execSync('powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"', { stdio: 'ignore' });
  } else {
    // Mac/Linux: kill -9 $(lsof -t -i:3000)
    execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
  }
} catch (e) {
  // Ignore errors if port is not in use
}

console.log('Starting Vite server...');
// Run 'npm run dev'
const child = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], { 
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

setTimeout(() => {
  const url = 'http://localhost:3000/admin';
  console.log(`\n=> Opening ${url} ...`);
  const openCmd = isWin ? `start ${url}` : os.platform() === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  try {
    execSync(openCmd, { stdio: 'ignore' });
  } catch (e) {
    console.log(`Please open ${url} in your browser.`);
  }
}, 3500);

// Handle graceful exit
process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit();
});
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit();
});
