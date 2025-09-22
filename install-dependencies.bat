@echo off
echo ========================================
echo    IoT Hub - Dependencies Installation
echo ========================================
echo.

echo [1/4] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing TypeScript globally...
call npm install -g typescript
if %errorlevel% neq 0 (
    echo WARNING: Failed to install TypeScript globally
    echo You can still run the project with local TypeScript
)

echo.
echo [3/4] Installing Vite globally...
call npm install -g vite
if %errorlevel% neq 0 (
    echo WARNING: Failed to install Vite globally
    echo You can still run the project with local Vite
)

echo.
echo [4/4] Verifying installation...
call npm list --depth=0
if %errorlevel% neq 0 (
    echo WARNING: Some dependencies might not be installed correctly
)

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy .env.example to .env and configure your environment variables
echo 2. Run the database setup scripts in Supabase
echo 3. Run: npm run dev
echo.
echo For detailed setup instructions, see README.md
echo.
pause
