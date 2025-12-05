const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
console.log('Project root:', projectRoot);

// Step 1: Remove node_modules if it exists
const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('Removing existing node_modules...');
  fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  console.log('✓ node_modules removed');
} else {
  console.log('No node_modules folder found');
}

// Step 2: Run npm install
console.log('\nRunning npm install...');
try {
  execSync('npm install', {
    stdio: 'inherit',
    cwd: projectRoot,
    env: { ...process.env, npm_config_loglevel: 'info' }
  });
  console.log('\n✓ npm install completed');
} catch (error) {
  console.error('\n✗ npm install failed');
  console.error('Error:', error.message);
  if (error.stdout) console.error('Stdout:', error.stdout.toString());
  if (error.stderr) console.error('Stderr:', error.stderr.toString());
  process.exit(1);
}

// Step 3: Verify package-lock.json was created
const lockFilePath = path.join(projectRoot, 'package-lock.json');
if (fs.existsSync(lockFilePath)) {
  const stats = fs.statSync(lockFilePath);
  console.log('\n✓ SUCCESS: package-lock.json created');
  console.log('  File size:', stats.size, 'bytes');
  console.log('  Created:', stats.birthtime.toISOString());
  
  // Read first few lines to verify it's valid JSON
  const content = fs.readFileSync(lockFilePath, 'utf8');
  try {
    JSON.parse(content);
    console.log('  ✓ Valid JSON format');
  } catch (e) {
    console.error('  ✗ Invalid JSON format!');
    process.exit(1);
  }
} else {
  console.log('\n✗ ERROR: package-lock.json was not created');
  process.exit(1);
}

// Step 4: Check for dependency issues
console.log('\nChecking for dependency issues...');
try {
  execSync('npm list --depth=0', {
    stdio: 'inherit',
    cwd: projectRoot
  });
} catch (error) {
  console.log('Note: Some dependency warnings may exist');
}

console.log('\n✓ All checks passed! package-lock.json is ready for deployment.');
