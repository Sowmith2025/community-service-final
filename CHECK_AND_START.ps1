# 🔍 Check Services and Start Backend
# Run this script with: powershell -ExecutionPolicy Bypass -File CHECK_AND_START.ps1

Write-Host "🔍 Checking Services..." -ForegroundColor Cyan

# Check MongoDB
Write-Host "`n📊 MongoDB Status:" -ForegroundColor Yellow
$mongod = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongod) {
    Write-Host "✅ MongoDB is running (PID: $($mongod.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB is NOT running" -ForegroundColor Red
    Write-Host "   To start MongoDB: mongod" -ForegroundColor Yellow
}

# Check Node.js processes
Write-Host "`n🟢 Node.js Backend Status:" -ForegroundColor Yellow
$node = Get-Process node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "✅ Node.js process is running (PID: $($node.Id))" -ForegroundColor Green
    
    # Try to reach health endpoint
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -ErrorAction Stop
        Write-Host "✅ Backend is responding at http://localhost:5000" -ForegroundColor Green
        Write-Host "   Message: $($health.message)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Node process exists but not responding on port 5000" -ForegroundColor Yellow
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Node.js backend is NOT running" -ForegroundColor Red
    
    # Ask to start it
    $response = Read-Host "`n🚀 Would you like to start the backend now? (yes/no)"
    if ($response -eq "yes" -or $response -eq "y") {
        Write-Host "`n🚀 Starting backend..." -ForegroundColor Cyan
        $backendPath = "c:\Users\sowmi\OneDrive\Desktop\src\Boosting student Engagement in Community service\backend"
        
        # Check if npm is installed
        if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
            Write-Host "❌ npm is not installed or not in PATH" -ForegroundColor Red
            Write-Host "   Please install Node.js first" -ForegroundColor Yellow
            exit
        }
        
        # Navigate and start
        Push-Location $backendPath
        Write-Host "📁 Backend directory: $backendPath" -ForegroundColor Cyan
        Write-Host "📦 Starting with: npm run dev" -ForegroundColor Cyan
        Write-Host "⏱️  This will start in the background. Backend should be ready in a few seconds." -ForegroundColor Yellow
        
        Start-Process powershell -ArgumentList "-NoExit -Command npm run dev" -WorkingDirectory $backendPath
        
        Pop-Location
        
        Write-Host "`n⏳ Waiting 3 seconds for backend to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        # Verify it started
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -ErrorAction Stop
            Write-Host "✅ Backend started successfully!" -ForegroundColor Green
            Write-Host "✅ Status: $($health.message)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Backend may still be starting... Check the new window." -ForegroundColor Yellow
            Write-Host "   Try refreshing your browser in a few seconds." -ForegroundColor Yellow
        }
    }
}

# Check port 5000
Write-Host "`n🔌 Port 5000 Status:" -ForegroundColor Yellow
try {
    $connection = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "✅ Port 5000 is in use" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Port 5000 is not listening" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Could not check port 5000" -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ Diagnostics Complete" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""