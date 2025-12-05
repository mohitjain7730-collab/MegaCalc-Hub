# Firebase Deployment Fix - Missing package-lock.json

## Problem
Firebase App Hosting build fails with:
```
"Missing dependency lock file at path '/workspace'. Please run your package manager's install command and redeploy."
```

## Root Cause
The `package-lock.json` file is missing from the repository. Firebase App Hosting requires this file for reproducible builds.

## Permanent Solution

### Option 1: Generate Locally (Recommended)
Run this command in your project root:
```bash
npm install
```

Or use the provided script:
```bash
npm run generate-lockfile
```

Or use the PowerShell script:
```powershell
.\fix-package-lock.ps1
```

### Option 2: Automatic Fix via GitHub Actions
A GitHub Actions workflow (`.github/workflows/ensure-lockfile.yml`) has been added that will:
- Automatically detect if `package-lock.json` is missing
- Generate it during CI/CD
- Commit it to the repository

This ensures the lock file is always present for Firebase deployments.

### Option 3: Manual Generation
1. Ensure Node.js and npm are installed
2. Navigate to project root
3. Remove `node_modules` if it exists: `rm -rf node_modules` (or `Remove-Item -Recurse -Force node_modules` on Windows)
4. Run: `npm install`
5. Verify: `ls package-lock.json` (or `Test-Path package-lock.json` on Windows)
6. Commit: `git add package-lock.json && git commit -m "Add package-lock.json" && git push`

## Verification
After generating `package-lock.json`:
1. ✅ File exists in project root
2. ✅ File is valid JSON (can be parsed)
3. ✅ File is committed to git
4. ✅ Firebase deployment succeeds

## Prevention
- Always commit `package-lock.json` when adding/updating dependencies
- The GitHub Actions workflow will catch missing lock files automatically
- Use `npm ci` instead of `npm install` in CI/CD for faster, more reliable installs

## Files Created
- `scripts/generate-lockfile.mjs` - Node.js script to generate lock file
- `.github/workflows/ensure-lockfile.yml` - GitHub Actions workflow
- `package.json` - Added `generate-lockfile` and `fix-dependencies` scripts

## Next Steps
1. Run `npm install` locally to generate `package-lock.json`
2. Commit and push the file
3. Redeploy to Firebase
4. The GitHub Actions workflow will prevent this issue in the future
