# Clean and Start Script for Next.js
Write-Host "🧹 Cleaning up Next.js build files..." -ForegroundColor Yellow

# Stop any running processes
Write-Host "🛑 Stopping any running processes..." -ForegroundColor Red
taskkill /f /im node.exe 2>$null

# Wait a moment
Start-Sleep -Seconds 2

# Try to remove .next directory
Write-Host "🗑️ Removing .next directory..." -ForegroundColor Yellow
if (Test-Path ".next") {
    try {
        Remove-Item -Recurse -Force ".next" -ErrorAction Stop
        Write-Host "✅ .next directory removed successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Could not remove .next directory. Please close all applications and try again." -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "✅ .next directory not found" -ForegroundColor Green
}

# Clear npm cache
Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Start development server with telemetry disabled
Write-Host "🚀 Starting development server..." -ForegroundColor Green
$env:NEXT_TELEMETRY_DISABLED = "1"
npm run dev 