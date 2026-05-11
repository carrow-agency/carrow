const { execSync, spawn } = require('child_process');
const os = require('os');
const path = require('path');

console.log('--- Starting Carrow Admin ---');

const isWin = os.platform() === 'win32';

// Always kill whatever is on port 3000 first
console.log('Killing any process on port 3000...');
try {
  if (isWin) {
    execSync('powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"', { stdio: 'ignore' });
  } else {
    execSync('fuser -k 3000/tcp 2>/dev/null || lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
  }
} catch (e) {
  // Ignore if already clear
}

// Small pause to let port fully release
execSync('sleep 0.5 2>/dev/null || timeout 1 cmd 2>/dev/null || true', { stdio: 'ignore' });

console.log('Starting Vite on port 3000...');
const child = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, VITE_PORT: '3000' },
});

setTimeout(() => {
  const url = 'http://localhost:3000/admin';
  console.log(`\n=> Opening ${url} ...`);
  let openCmd;
  if (isWin) {
    openCmd = `start chrome ${url}`;
  } else if (os.platform() === 'darwin') {
    openCmd = `open ${url}`;
  } else {
    // Linux: try xdg-open (default browser), fallback to firefox/chromium
    openCmd = `xdg-open ${url} 2>/dev/null || firefox ${url} 2>/dev/null || chromium-browser ${url} 2>/dev/null || google-chrome ${url} 2>/dev/null || true`;
  }
  try {
    execSync(openCmd, { stdio: 'ignore' });
  } catch (e) {
    console.log(`Could not open browser automatically. Please visit: ${url}`);
  }
}, 4000);

process.on('SIGINT', () => { child.kill('SIGINT'); process.exit(); });
process.on('SIGTERM', () => { child.kill('SIGTERM'); process.exit(); });
