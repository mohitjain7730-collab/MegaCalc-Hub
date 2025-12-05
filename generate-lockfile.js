const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting npm install process...');
console.log('Current directory:', process.cwd());

// Remove node_modules if it exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('Removing existing node_modules...');
  fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  console.log('node_modules removed');
} else {
  console.log('No node_modules folder found');
}

// Run npm install
console.log('Running npm install...');
try {
  execSync('npm install', { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });
  console.log('npm install completed');
} catch (error) {
  console.error('npm install failed:', error.message);
  process.exit(1);
}

// Verify package-lock.json was created
const lockFilePath = path.join(process.cwd(), 'package-lock.json');
if (fs.existsSync(lockFilePath)) {
  const stats = fs.statSync(lockFilePath);
  console.log('\n✓ SUCCESS: package-lock.json created');
  console.log('  File size:', stats.size, 'bytes');
  console.log('  Created:', stats.birthtime);
} else {
  console.log('\n✗ ERROR: package-lock.json was not created');
  process.exit(1);
}

// Check for dependency issues
console.log('\nChecking for dependency issues...');
try {
  execSync('npm list --depth=0', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.log('Note: Some dependency warnings may exist, but installation completed');
}

console.log('\n✓ Process completed successfully!');
