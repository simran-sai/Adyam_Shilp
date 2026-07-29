# Adyam Shilp — ML Service Quick Start
# Run from the project root: powershell -File start-ml.ps1

Write-Host "🚀 Starting Adyam Shilp ML Service..." -ForegroundColor Cyan

# Navigate to ml-service
$mlDir = Join-Path $PSScriptRoot "ml-service"

# Install dependencies if needed
Write-Host "📦 Checking Python dependencies..." -ForegroundColor Yellow
pip install -r "$mlDir\requirements.txt" --quiet

# Start FastAPI server
Write-Host "⚡ Launching FastAPI ML server on http://localhost:8000" -ForegroundColor Green
Write-Host "   → Health check: http://localhost:8000/health" -ForegroundColor Gray
Write-Host "   → API docs:     http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload --app-dir "$mlDir"
