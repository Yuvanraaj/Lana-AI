# Cloudflare Tunnel Status Verification Script
# Run this to test if everything is working

param(
    [string]$Domain = "",
    [string]$BackendPort = 8001,
    [string]$FrontendPort = 5173
)

# Color output
function Write-Success { Write-Host "✓ " -ForegroundColor Green -NoNewline; Write-Host $args }
function Write-Error { Write-Host "✗ " -ForegroundColor Red -NoNewline; Write-Host $args }
function Write-Info { Write-Host "ℹ " -ForegroundColor Cyan -NoNewline; Write-Host $args }
function Write-Warning { Write-Host "⚠ " -ForegroundColor Yellow -NoNewline; Write-Host $args }

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║   Cloudflare Tunnel Status Verification Tool              ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# 1. Check cloudflared installation
Write-Info "Checking cloudflared installation..."
try {
    $version = & cloudflared --version 2>&1
    Write-Success "cloudflared is installed: $version"
} catch {
    Write-Error "cloudflared is not installed!"
    Write-Info "Install from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
}

# 2. Check credential files
Write-Host ""
Write-Info "Checking Cloudflare credentials..."
$cloudflareDir = "$env:USERPROFILE\.cloudflared"
if (Test-Path $cloudflareDir) {
    $certFile = "$cloudflareDir\cert.pem"
    $jsonFiles = @(Get-ChildItem "$cloudflareDir\*.json" -ErrorAction SilentlyContinue)
    
    if (Test-Path $certFile) {
        Write-Success "Found cert.pem"
    } else {
        Write-Error "cert.pem not found - run: cloudflared tunnel login"
    }
    
    if ($jsonFiles.Count -gt 0) {
        Write-Success "Found $($jsonFiles.Count) tunnel credential file(s)"
        foreach ($file in $jsonFiles) {
            $tunnelName = [io.path]::GetFileNameWithoutExtension($file.Name)
            Write-Info "  - $tunnelName"
        }
    } else {
        Write-Error "No tunnel credentials found - run: cloudflared tunnel login"
    }
} else {
    Write-Error "Cloudflare directory not found: $cloudflareDir"
}

# 3. Check config file
Write-Host ""
Write-Info "Checking tunnel configuration..."
$configFile = "$cloudflareDir\config.yml"
if (Test-Path $configFile) {
    Write-Success "Found config.yml"
    $config = Get-Content $configFile
    if ($config -match 'yourdomain\.com') {
        Write-Warning "Config still has 'yourdomain.com' - update with your actual domain!"
    } else {
        Write-Success "Config appears to have domain configured"
    }
} else {
    Write-Warning "config.yml not found"
    Write-Info "Run: .\setup-tunnel.ps1 -Action create"
}

# 4. Check local services
Write-Host ""
Write-Info "Checking local services..."

# Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$BackendPort/health" -ErrorAction SilentlyContinue -TimeoutSec 2
    Write-Success "Backend is running on :$BackendPort"
} catch {
    Write-Error "Backend is NOT running on :$BackendPort"
    Write-Info "  Start backend with: cd Virtual_Agent1\backend && npm run dev"
}

# Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -ErrorAction SilentlyContinue -TimeoutSec 2
    Write-Success "Frontend is running on :$FrontendPort"
} catch {
    Write-Error "Frontend is NOT running on :$FrontendPort"
    Write-Info "  Start frontend with: cd Virtual_Agent1\frontend && npm run dev"
}

# 5. Check tunnel process
Write-Host ""
Write-Info "Checking tunnel process..."
$tunnelProcess = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcess) {
    Write-Success "Cloudflare tunnel is running (PID: $($tunnelProcess.Id))"
} else {
    Write-Warning "Cloudflare tunnel is NOT running"
    Write-Info "  Start tunnel with: cloudflared tunnel run virtual-agent"
}

# 6. Check DNS (if domain provided)
if ($Domain) {
    Write-Host ""
    Write-Info "Checking DNS resolution for: $Domain"
    
    try {
        $frontendIP = Resolve-DnsName -Name "frontend.$Domain" -ErrorAction SilentlyContinue
        $apiIP = Resolve-DnsName -Name "api.$Domain" -ErrorAction SilentlyContinue
        
        if ($frontendIP) {
            Write-Success "frontend.$Domain resolves to: $($frontendIP.IPAddress)"
        } else {
            Write-Error "frontend.$Domain does not resolve"
            Write-Info "  Add CNAME: frontend → virtual-agent.cfargotunnel.com"
        }
        
        if ($apiIP) {
            Write-Success "api.$Domain resolves to: $($apiIP.IPAddress)"
        } else {
            Write-Error "api.$Domain does not resolve"
            Write-Info "  Add CNAME: api → virtual-agent.cfargotunnel.com"
        }
    } catch {
        Write-Warning "Could not resolve DNS: $_"
    }
}

# 7. Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                        Summary                             ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow

$checklist = @{
    "cloudflared installed" = $null
    "Credentials configured" = $null
    "config.yml exists" = $null
    "Backend running" = $null
    "Frontend running" = $null
    "Tunnel running" = $null
}

$allGood = $true
foreach ($item in $checklist.Keys) {
    Write-Host "  $item" -NoNewline
    # You can add more detailed checks here
}

Write-Host ""
Write-Host ""
Write-Info "For detailed setup instructions, see: CLOUDFLARE_TUNNEL_SETUP.md"
Write-Info "For quick reference, see: CLOUDFLARE_QUICK_REFERENCE.md"
