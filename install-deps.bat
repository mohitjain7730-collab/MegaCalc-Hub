@echo off
cd /d "%~dp0"
echo Starting npm install process...
echo Current directory: %CD%

if exist node_modules (
    echo Removing existing node_modules...
    rmdir /s /q node_modules
    echo node_modules removed
) else (
    echo No node_modules folder found
)

echo.
echo Running npm install...
call npm install

if exist package-lock.json (
    echo.
    echo SUCCESS: package-lock.json created
    dir package-lock.json
) else (
    echo.
    echo ERROR: package-lock.json was not created
    exit /b 1
)

echo.
echo Checking for dependency issues...
call npm list --depth=0

echo.
echo Process completed successfully!
pause
