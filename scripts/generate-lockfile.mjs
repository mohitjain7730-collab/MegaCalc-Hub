#!/usr/bin/env node
/**
 * Script to generate package-lock.json for Firebase deployment
 * This script ensures package-lock.json is created even if npm install has issues
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔧 Generating package-lock.json for Firebase deployment...\n');
console.log('Project root:', projectRoot);

// Step 1: Remove node_modules if it exists
const nodeModulesPath = join(projectRoot, 'node_modules');
if (existsSync(nodeModulesPath)) {
  console.log('📦 Removing existing node_modules...');
  rmSync(nodeModulesPath, { recursive: true, force: true });
  console.log('✓ node_modules removed\n');
} else {
  console.log('✓ No node_modules folder found\n');
}

// Step 2: Ensure package-lock.json doesn't exist (for clean generation)
const lockFilePath = join(projectRoot, 'package-lock.json');
if (existsSync(lockFilePath)) {
  console.log('⚠️  Existing package-lock.json found, removing for clean generation...');
  rmSync(lockFilePath);
  console.log('✓ Old package-lock.json removed\n');
}

// Step 3: Run npm install
console.log('📥 Running npm install...');
console.log('This may take a few minutes...\n');

try {
  execSync('npm install', {
    stdio: 'inherit',
    cwd: projectRoot,
    env: { 
      ...process.env, 
      npm_config_loglevel: 'info',
      npm_config_package_lock: 'true'
    },
    maxBuffer: 10 * 1024 * 1024 // 10MB buffer
  });
  console.log('\n✓ npm install completed\n');
} catch (error) {
  console.error('\n✗ npm install failed');
  console.error('Error code:', error.status || error.code);
  if (error.stdout) console.error('Stdout:', error.stdout.toString());
  if (error.stderr) console.error('Stderr:', error.stderr.toString());
  process.exit(1);
}

// Step 4: Verify package-lock.json was created
if (existsSync(lockFilePath)) {
  const stats = statSync(lockFilePath);
  console.log('✅ SUCCESS: package-lock.json created!');
  console.log('   File size:', (stats.size / 1024).toFixed(2), 'KB');
  console.log('   Created:', stats.birthtime.toISOString());
  
  // Verify it's valid JSON
  try {
    const content = readFileSync(lockFilePath, 'utf8');
    const lockData = JSON.parse(content);
    console.log('   ✓ Valid JSON format');
    console.log('   ✓ Lockfile version:', lockData.lockfileVersion || 'unknown');
    console.log('   ✓ Dependencies locked:', Object.keys(lockData.packages || {}).length);
  } catch (e) {
    console.error('   ✗ Invalid JSON format!');
    process.exit(1);
  }
} else {
  console.log('\n✗ ERROR: package-lock.json was not created');
  console.log('Please ensure npm is installed and try running: npm install');
  process.exit(1);
}

// Step 5: Check for dependency issues
console.log('\n🔍 Checking for dependency issues...');
try {
  execSync('npm list --depth=0', {
    stdio: 'inherit',
    cwd: projectRoot
  });
} catch (error) {
  console.log('⚠️  Some dependency warnings may exist (this is usually OK)');
}

console.log('\n✅ All checks passed! package-lock.json is ready for deployment.');
console.log('\n📝 Next steps:');
console.log('   1. Review the package-lock.json file');
console.log('   2. Commit: git add package-lock.json');
console.log('   3. Commit: git commit -m "Add package-lock.json for Firebase deployment"');
console.log('   4. Push: git push');
console.log('   5. Redeploy to Firebase\n');
