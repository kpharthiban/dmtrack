# start-bridge.ps1
# Convenience script to install deps (first run) and start the WhatsApp bridge.
# Run from the invisible-crm/ directory:
#   .\start-bridge.ps1

$BridgeDir = Join-Path $PSScriptRoot "whatsapp-bridge"

if (-not (Test-Path -LiteralPath $BridgeDir)) {
    Write-Error "whatsapp-bridge/ directory not found. Are you running from invisible-crm/?"
    exit 1
}

$NodeModules = Join-Path $BridgeDir "node_modules"
if (-not (Test-Path -LiteralPath $NodeModules)) {
    Write-Host "[bridge] node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install --prefix $BridgeDir
    if (-not $?) {
        Write-Error "npm install failed. Make sure Node.js >= 18 is installed."
        exit 1
    }
}

Write-Host "[bridge] Starting WhatsApp bridge on port 3001..." -ForegroundColor Green
Write-Host "[bridge] Scan the QR code at http://localhost:3001/qr or check the terminal output." -ForegroundColor Cyan
Write-Host "[bridge] Press Ctrl+C to stop.`n" -ForegroundColor Gray

node (Join-Path $BridgeDir "index.js")
