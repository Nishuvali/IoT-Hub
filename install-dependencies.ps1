# IoT Hub - Dependencies Installation Script
# PowerShell version for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   IoT Hub - Dependencies Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Installing Node.js dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Node.js dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to install Node.js dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Installing TypeScript globally..." -ForegroundColor Yellow
try {
    npm install -g typescript
    Write-Host "✅ TypeScript installed globally" -ForegroundColor Green
} catch {
    Write-Host "⚠️  WARNING: Failed to install TypeScript globally" -ForegroundColor Yellow
    Write-Host "You can still run the project with local TypeScript" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/4] Installing Vite globally..." -ForegroundColor Yellow
try {
    npm install -g vite
    Write-Host "✅ Vite installed globally" -ForegroundColor Green
} catch {
    Write-Host "⚠️  WARNING: Failed to install Vite globally" -ForegroundColor Yellow
    Write-Host "You can still run the project with local Vite" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/4] Verifying installation..." -ForegroundColor Yellow
try {
    npm list --depth=0
    Write-Host "✅ Installation verification complete" -ForegroundColor Green
} catch {
    Write-Host "⚠️  WARNING: Some dependencies might not be installed correctly" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Copy .env.example to .env and configure your environment variables" -ForegroundColor Gray
Write-Host "2. Run the database setup scripts in Supabase" -ForegroundColor Gray
Write-Host "3. Run: npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed setup instructions, see README.md" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to continue"
