# Start the FastAPI backend
# Run from the invisible-crm/ directory
Get-Content .env | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}
Write-Host "Starting backend with GEMINI_API_KEY=$($env:GEMINI_API_KEY.Substring(0,8))..."
& ".\backend\venv\Scripts\uvicorn.exe" backend.main:app --reload --host 0.0.0.0 --port 8000
