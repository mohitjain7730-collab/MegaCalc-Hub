#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const { platform } = require('os');

const port = 9002;

// Kill process on port 9002
function killPort() {
  console.log(`Checking for process on port ${port}...`);
  try {
    if (platform() === 'win32') {
      // Windows command using taskkill (more reliable than PowerShell)
      console.log('Running taskkill logic...');
      let portFree = false;
      const startTime = Date.now();

      while (!portFree && (Date.now() - startTime < 5000)) {
        try {
          // Find PID occupying the port
          const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
          const lines = output.trim().split(/[\r\n]+/);
          let killedAny = false;

          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && /^\d+$/.test(pid) && pid !== '0') {
              console.log(`Found process ${pid} on port ${port}. Killing...`);
              try {
                execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
                killedAny = true;
              } catch (e) {
                // Ignore
              }
            }
          });

          if (!killedAny) {
            // No valid PIDs found to kill, but findstr matched something? 
            // Wait a bit.
          }
          // Wait a bit before checking again
          execSync('ping 127.0.0.1 -n 1 -w 500 > NUL 2>&1');
        } catch (error) {
          // findstr returns error => No process found on port w/ that pattern.
          portFree = true;
          console.log('Port 9002 is free.');
        }
      }

      if (!portFree) {
        console.error('Warning: Could not free port 9002 after 5 seconds.');
      }
    } else {
      // Unix/Linux/Mac command
      console.log('Running lsof command...');
      execSync(
        `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`,
        {
          stdio: 'ignore',
          timeout: 5000
        }
      );
    }
    console.log('Port cleanup completed (or no process found).');
  } catch (error) {
    if (error.code === 'ETIMEDOUT') {
      console.error('Warning: Port kill command timed out. Proceeding...');
    } else {
      console.log('Note: No process found on port or error ignored.');
    }
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



