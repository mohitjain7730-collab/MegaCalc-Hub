#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const { platform } = require('os');

const port = 9002;

// Kill process on port 9002
// Kill process on port 9002
function killPort() {
  console.log(`Checking for process on port ${port}...`);
  try {
    if (platform() === 'win32') {
      // Windows command using taskkill (more reliable than PowerShell)
      console.log('Running taskkill logic...');
      const timeout = 10000;
      const startTime = Date.now();
      let portFree = false;

      while (Date.now() - startTime < timeout) {
        try {
          // Find PID occupying the port
          const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
          const lines = output.trim().split(/[\r\n]+/);
          let pidsFound = [];

          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && /^\d+$/.test(pid) && pid !== '0') {
              if (!pidsFound.includes(pid)) pidsFound.push(pid);
            }
          });

          if (pidsFound.length === 0) {
            portFree = true;
            console.log('Port 9002 is free.');
            break;
          }

          console.log(`Found processes ${pidsFound.join(', ')} on port ${port}. Killing...`);
          pidsFound.forEach(pid => {
            try {
              execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            } catch (e) { /* ignore */ }
          });

          // Wait a bit before checking again
          const stop = Date.now() + 500;
          while (Date.now() < stop) { }

        } catch (error) {
          // findstr returns error => No process found on port w/ that pattern.
          portFree = true;
          console.log('Port 9002 is free (no netstat match).');
          break;
        }
      }

      if (!portFree) {
        console.error('Warning: Could not free port 9002 after 10 seconds.');
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
    console.log('Port cleanup completed.');
  } catch (error) {
    console.error('Error during port cleanup:', error.message);
  }
}

// Kill the port first
killPort();

// Generate static registries to ensure latest calculators are mapped
try {
  console.log('Generating calculator registries...');
  execSync('node scripts/generate-registries.js', { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to generate registries:', err.message);
}

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
      NODE_OPTIONS: '--max_old_space_size=14336',
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



