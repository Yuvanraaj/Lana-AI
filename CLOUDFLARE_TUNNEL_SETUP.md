# Cloudflare Tunnel Setup Guide for Virtual Agent

This guide will help you use Cloudflare tunnel to expose your localhost applications to the internet.

## Prerequisites

1. **Cloudflare Account**: Create free account at [cloudflare.com](https://cloudflare.com)
2. **Domain**: Add your domain to Cloudflare (or use Cloudflare Pages domain)
3. **Cloudflared CLI**: Download from [developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

## Step 1: Install Cloudflared

### Windows:
```powershell
# Option A: Using Scoop
scoop install cloudflare-warp

# Option B: Direct Download
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
# Add to PATH environment variable
```

### Verify Installation:
```powershell
cloudflared --version
```

## Step 2: Authenticate with Cloudflare

```powershell
cloudflared tunnel login
```

This will:
- Open your browser
- Ask you to authorize Cloudflare
- Save credentials to `%USERPROFILE%\.cloudflared\cert.pem`

## Step 3: Create Named Tunnel (Option A - Recommended)

### Create Tunnel:
```powershell
cloudflared tunnel create virtual-agent
```

You'll see output like:
```
Tunnel credentials written to C:\Users\YourUsername\.cloudflared\<uuid>.json
Tunnel virtual-agent's arbitrary remote config ID is <uuid>
```

### Create Configuration File

Create `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: virtual-agent
credentials-file: C:/Users/YourUsername/.cloudflared/<uuid>.json

ingress:
  # Frontend (Vite)
  - hostname: frontend.yourdomain.com
    service: http://localhost:5173
    
  # Backend API
  - hostname: api.yourdomain.com
    service: http://localhost:8001
    
  # Catch-all for frontend
  - service: http://localhost:5173
```

**Replace:**
- `<uuid>` with your actual UUID from tunnel creation
- `yourdomain.com` with your actual domain
- `YourUsername` with your Windows username

### Run Tunnel:
```powershell
cloudflared tunnel run virtual-agent
```

## Step 4: Configure DNS Records

In Cloudflare Dashboard → DNS:

1. Add CNAME record for frontend:
   - Type: CNAME
   - Name: frontend
   - Target: virtual-agent.cfargotunnel.com
   - Proxy: Proxied

2. Add CNAME record for API:
   - Type: CNAME
   - Name: api
   - Target: virtual-agent.cfargotunnel.com
   - Proxy: Proxied

## Step 5: Test Connections

After DNS propagates (5-10 minutes):

```powershell
# Test frontend
curl https://frontend.yourdomain.com

# Test backend
curl https://api.yourdomain.com/health
```

## Running Everything

### Terminal 1 - Backend:
```powershell
cd Virtual_Agent\Virtual_Agent1\backend
npm install
npm run dev
```

### Terminal 2 - Frontend:
```powershell
cd Virtual_Agent\Virtual_Agent1\frontend
npm install
npm run dev
```

### Terminal 3 - Cloudflare Tunnel:
```powershell
cloudflared tunnel run virtual-agent
```

You should see all three running and accessible at:
- `https://frontend.yourdomain.com`
- `https://api.yourdomain.com`

## Quick Start Alternative (Temporary Tunnel)

For testing without setting up DNS:

```powershell
# Frontend tunnel
cloudflared tunnel --url http://localhost:5173

# Backend tunnel (in another terminal)
cloudflared tunnel --url http://localhost:8001
```

This creates temporary tunnels with unique URLs that expire when cloudflared stops.

## Updating Frontend Config

Your frontend needs to know about the new backend URL. Update:

**Virtual_Agent1/frontend/src/config.js:**
```javascript
export const API_BASE_URL = 
  process.env.VITE_API_URL || 'https://api.yourdomain.com';
```

Or update in **Virtual_Agent1/frontend/.env.local:**
```
VITE_API_URL=https://api.yourdomain.com
```

## Troubleshooting

### Cloudflared won't start
- Check that ports 5173 and 8001 are accessible
- Verify backend and frontend are running
- Check Windows Firewall

### DNS not resolving
- Wait 5-10 minutes for DNS propagation
- Clear browser cache
- Verify CNAME records in Cloudflare Dashboard

### SSL/TLS errors
- Cloudflare automatically provides SSL
- Set SSL/TLS mode to "Full" or "Full (strict)" in Cloudflare Dashboard

### CORS issues
- Backend already has CORS enabled
- If problems persist, check firewall/proxy settings

## Advanced: Auto-start Tunnel

Create batch file `start-tunnel.bat`:
```batch
@echo off
cd %USERPROFILE%\.cloudflared
cloudflared tunnel run virtual-agent
```

Add to Windows Task Scheduler to auto-start on login.

## Resources

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Named Tunnels Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/tunnel-guide/)
- [Ingress Configuration](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/ingress/)
