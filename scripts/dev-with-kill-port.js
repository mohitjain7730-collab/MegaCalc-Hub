#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const { platform } = require('os');

const port = 9002;

// Kill process on port 9002
function killPort() {
  try {
    if (platform() === 'win32') {
      // Windows PowerShell command
      execSync(
        `powershell -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"`,
        { stdio: 'ignore' }
      );
    } else {
      // Unix/Linux/Mac command
      execSync(
        `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`,
        { stdio: 'ignore' }
      );
    }
  } catch (error) {
    // Ignore errors if port is not in use
  }
}

// Kill the port first
killPort();

// Start the dev server (spawn to keep it running)
console.log('Starting Next.js dev server...');
const isWindows = platform() === 'win32';
const child = spawn(
  isWindows ? 'npx.cmd' : 'npx',
  ['next', 'dev', '-p', '9002'],
  {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_OPTIONS: '--max_old_space_size=8192',
    },
  }
);

// Handle process termination
process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit();
});

child.on('exit', (code) => {
  process.exit(code);
});


