# Script to fix package-lock.json sync issue
# Run this script to regenerate package-lock.json to match package.json

Write-Host "Fixing package-lock.json sync issue..." -ForegroundColor Yellow

# Check if package-lock.json exists
if (Test-Path "package-lock.json") {
    Write-Host "Backing up existing package-lock.json..." -ForegroundColor Yellow
    Copy-Item "package-lock.json" "package-lock.json.backup"
    Remove-Item "package-lock.json"
    Write-Host "Old package-lock.json backed up and removed." -ForegroundColor Green
} else {
    Write-Host "No existing package-lock.json found." -ForegroundColor Yellow
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules for clean install..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

Write-Host "Installing dependencies and regenerating package-lock.json..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully regenerated package-lock.json" -ForegroundColor Green
    Write-Host "✓ All dependencies installed" -ForegroundColor Green
    
    if (Test-Path "package-lock.json") {
        Write-Host "`nNext steps:" -ForegroundColor Cyan
        Write-Host "1. Review the new package-lock.json" -ForegroundColor White
        Write-Host "2. Test your build locally: npm run build" -ForegroundColor White
        Write-Host "3. Commit the changes: git add package-lock.json" -ForegroundColor White
        Write-Host "4. Push to trigger a new build: git commit -m 'Fix: Regenerate package-lock.json'" -ForegroundColor White
    } else {
        Write-Host "✗ ERROR: package-lock.json was not created!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ ERROR: npm install failed!" -ForegroundColor Red
    if (Test-Path "package-lock.json.backup") {
        Write-Host "Restoring backup..." -ForegroundColor Yellow
        Copy-Item "package-lock.json.backup" "package-lock.json"
    }
    exit 1
}
