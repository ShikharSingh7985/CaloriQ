<#
  Run the CaloriQ FastAPI backend (PowerShell, Windows).

    .\run-backend.ps1
    .\run-backend.ps1 -Port 9000 -BindHost 127.0.0.1

  First run creates the venv and installs dependencies; later runs just start
  the server. Uses `python -m uvicorn` to avoid the uvicorn.exe launcher shim.
#>
[CmdletBinding()]
param(
  [int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 8000 }),
  # Note: $Host is a reserved automatic variable, so the bind address is -BindHost.
  [string]$BindHost = $(if ($env:HOST) { $env:HOST } else { '0.0.0.0' })
)

$ErrorActionPreference = 'Stop'

# Operate from backend/ relative to this script.
Set-Location (Join-Path $PSScriptRoot 'backend')

$venv = '.venv'
$py = Join-Path $venv 'Scripts\python.exe'

# 1) Create the virtual environment on first run.
if (-not (Test-Path $py)) {
  Write-Host '-> Creating virtual environment (.venv)...'
  if (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3 -m venv $venv
  } else {
    & python -m venv $venv
  }
}

# 2) Install dependencies if they're missing (fresh or partial venv).
$needInstall = $true
try {
  & $py -c 'import uvicorn, fastapi, google.genai' 2>$null
  if ($LASTEXITCODE -eq 0) { $needInstall = $false }
} catch { $needInstall = $true }

if ($needInstall) {
  Write-Host '-> Installing dependencies...'
  & $py -m pip install --quiet --upgrade pip
  & $py -m pip install --quiet -r requirements.txt
}

# 3) Ensure an .env exists (the API needs GEMINI_API_KEY for AI features).
if (-not (Test-Path '.env')) {
  Write-Host '!  backend\.env not found - creating it from .env.example'
  Copy-Item '.env.example' '.env'
  Write-Host '   Edit backend\.env and set GEMINI_API_KEY before using the AI endpoints.'
}

# 4) Start the server.
Write-Host "-> Starting CaloriQ API on http://${BindHost}:${Port}  (Swagger: http://localhost:${Port}/docs)"
& $py -m uvicorn app.main:app --reload --host $BindHost --port $Port
