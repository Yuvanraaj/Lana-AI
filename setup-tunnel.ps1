# Cloudflare Tunnel Quick Setup Script for Windows PowerShell
# This script automates Cloudflare tunnel setup and verification

param(
    [string]$TunnelName = "virtual-agent",
    [string]$Domain = "",
    [string]$Action = "create"  # create, run, or stop
)

$ErrorActionPreference = "Stop"

# Color output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

function Check-CloudflaredInstalled {
    Write-Info "Checking if cloudflared is installed..."
    try {
        $version = & cloudflared --version 2>&1
        Write-Success "✓ cloudflared is installed: $version"
        return $true
    } catch {
        Write-Error "✗ cloudflared not found. Please install it first:"
        Write-Error "  Windows: Use Scoop (scoop install cloudflare-warp) or download from:"
        Write-Error "  https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
        return $false
    }
}

function Create-Tunnel {
    Write-Info "Creating Cloudflare tunnel: $TunnelName"
    & cloudflared tunnel create $TunnelName
    
    $tunnelId = & cloudflared tunnel list | Select-String $TunnelName | ForEach-Object { $_.ToString().Split()[0] }
    Write-Success "✓ Tunnel created with ID: $tunnelId"
}

function Run-Tunnel {
    Write-Info "Starting Cloudflare tunnel: $TunnelName"
    Write-Info "Frontend will be available on tunnel for port 5173"
    Write-Info "Backend API will be available on tunnel for port 8001"
    
    & cloudflared tunnel run $TunnelName
}

function Stop-Tunnel {
    Write-Info "Stopping Cloudflare tunnel..."
    $tunnelProcess = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($tunnelProcess) {
        Stop-Process -InputObject $tunnelProcess -Force
        Write-Success "✓ Tunnel stopped"
    } else {
        Write-Error "✗ No tunnels running"
    }
}

function Setup-Config {
    Write-Info "Setting up configuration..."
    
    $cloudflareDir = "$env:USERPROFILE\.cloudflared"
    $configPath = "$cloudflareDir\config.yml"
    
    if (Test-Path $configPath) {
        Write-Error "Config already exists at: $configPath"
        Write-Info "Backing up to: $configPath.backup"
        Copy-Item $configPath "$configPath.backup"
    }
    
    # Find the credentials file
    $credFiles = Get-ChildItem "$cloudflareDir\*.json" -ErrorAction SilentlyContinue
    if ($credFiles.Count -eq 0) {
        Write-Error "✗ No credentials found. Run: cloudflared tunnel login"
        return
    }
    
    $credFile = $credFiles[0]
    $tunnelUUID = [io.path]::GetFileNameWithoutExtension($credFile)
    
    Write-Info "Found tunnel credentials: $tunnelUUID"
    
    # Create config with absolute path
    $configContent = @"
tunnel: $TunnelName
credentials-file: $(($credFile.FullName -replace '\\', '/'))

ingress:
  - hostname: frontend.yourdomain.com
    service: http://localhost:5173
    originRequest:
      connectTimeout: 30s
      tlsTimeout: 30s
  
  - hostname: api.yourdomain.com
    service: http://localhost:8001
    originRequest:
      connectTimeout: 30s
      tlsTimeout: 30s
      http2Origin: true
  
  - service: http://localhost:5173
"@
    
    Set-Content -Path $configPath -Value $configContent
    Write-Success "✓ Config file created at: $configPath"
    Write-Info "⚠  IMPORTANT: Edit $configPath"
    Write-Info "   Replace 'yourdomain.com' with your actual domain"
}

function List-Tunnels {
    Write-Info "Available tunnels:"
    & cloudflared tunnel list
}

# Main script
Write-Info "╔════════════════════════════════════════════════════════════╗"
Write-Info "║     Cloudflare Tunnel Setup for Virtual Agent Project    ║"
Write-Info "╚════════════════════════════════════════════════════════════╝"

if (-not (Check-CloudflaredInstalled)) {
    exit 1
}

switch ($Action.ToLower()) {
    "create" {
        Setup-Config
        List-Tunnels
        Write-Info ""
        Write-Info "Next steps:"
        Write-Info "1. Edit the config file: $env:USERPROFILE\.cloudflared\config.yml"
        Write-Info "2. Replace 'yourdomain.com' with your actual Cloudflare domain"
        Write-Info "3. Set up DNS records in Cloudflare Dashboard:"
        Write-Info "   - frontend CNAME → $TunnelName.cfargotunnel.com"
        Write-Info "   - api CNAME → $TunnelName.cfargotunnel.com"
        Write-Info "4. Run: .\setup-tunnel.ps1 -Action run"
    }
    "run" {
        Run-Tunnel
    }
    "stop" {
        Stop-Tunnel
    }
    "list" {
        List-Tunnels
    }
    default {
        Write-Error "Unknown action: $Action"
        Write-Info "Valid actions: create, run, stop, list"
    }
}
