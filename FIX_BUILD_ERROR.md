# Build Error Fix Instructions

## Problem
The Firebase App Hosting build is failing because `package-lock.json` is out of sync with `package.json`.

### Error Details:
- Lock file has `next@15.3.3` but package.json requires `next@15.3.6`
- Lock file has `react@18.3.1` but package.json requires `react@19.2.1`
- Lock file has `react-dom@18.3.1` but package.json requires `react-dom@19.2.1`
- Many other package version mismatches

## Solution

To fix this, you need to regenerate `package-lock.json` to match your `package.json`.

### Quick Fix (Recommended):

**On Windows, run the provided PowerShell script:**
```powershell
.\fix-package-lock.ps1
```

This script will:
- Backup your existing package-lock.json
- Remove node_modules for a clean install
- Regenerate package-lock.json using `npm install`
- Verify the fix was successful

### Manual Fix Steps:

1. **Delete the old lock file** (if it exists):
   ```bash
   rm package-lock.json
   ```
   Or on Windows:
   ```powershell
   Remove-Item package-lock.json
   ```

2. **Clean install** (optional but recommended):
   ```bash
   rm -rf node_modules
   ```
   Or on Windows:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   ```

3. **Regenerate the lock file**:
   ```bash
   npm install
   ```

   This will:
   - Install all dependencies according to `package.json`
   - Generate a new `package-lock.json` that matches your `package.json` exactly
   - Resolve all version conflicts

4. **Verify the lock file was created**:
   ```bash
   ls package-lock.json
   ```
   Or on Windows:
   ```powershell
   Test-Path package-lock.json
   ```

5. **Commit the new lock file**:
   ```bash
   git add package-lock.json
   git commit -m "Fix: Regenerate package-lock.json to sync with package.json"
   git push
   ```

## Additional Notes

### Peer Dependency Warnings
The build log shows peer dependency warnings for:
- `next-themes@0.3.0` expects React ^16.8 || ^17 || ^18, but you're using React 19.2.1
- `react-day-picker@8.10.1` expects React ^16.8.0 || ^17.0.0 || ^18.0.0, but you're using React 19.2.1

These are warnings and typically won't break the build, but you may want to:
- Update `next-themes` to a version that supports React 19
- Update `react-day-picker` to a version that supports React 19
- Or consider downgrading React to version 18 if compatibility is an issue

### Alternative: Use npm ci with legacy-peer-deps
If you continue to have issues, you can modify `apphosting.yaml` to use:
```yaml
- npm ci --legacy-peer-deps --no-audit --no-fund
```

However, regenerating the lock file is the recommended solution.
