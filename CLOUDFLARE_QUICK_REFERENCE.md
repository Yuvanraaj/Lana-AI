# Cloudflare Tunnel - Quick Reference

## ⚡ Super Quick Start (1-2 minutes)

### Step 1: Install cloudflared
```powershell
# Windows - using Scoop (recommended)
scoop install cloudflare-warp

# Or download: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

### Step 2: Authenticate
```powershell
cloudflared tunnel login
# Opens browser, authorize, done ✓
```

### Step 3: Create tunnel & config
```powershell
cd d:\Final year Project _ Virtual Agent - Copy\Virtual_Agent
.\setup-tunnel.ps1 -Action create
```

### Step 4: Edit config
```powershell
# Open and edit:
# C:\Users\YourUsername\.cloudflared\config.yml

# Replace "yourdomain.com" with your actual Cloudflare domain
```

### Step 5: Add DNS records in Cloudflare Dashboard
Create two CNAME records:
- **Name**: `frontend` → **Target**: `virtual-agent.cfargotunnel.com` (Proxied)
- **Name**: `api` → **Target**: `virtual-agent.cfargotunnel.com` (Proxied)

### Step 6: Start everything
```powershell
# Option A: Individual terminals
# Terminal 1:
cd Virtual_Agent1\backend && npm run dev

# Terminal 2:
cd Virtual_Agent1\frontend && npm run dev

# Terminal 3:
cloudflared tunnel run virtual-agent

# Option B: Batch file (all-in-one)
.\start-all-services.bat
```

---

## 📋 Full Checklist

- [ ] cloudflared installed and working
- [ ] Ran `cloudflared tunnel login`
- [ ] Ran setup script: `.\setup-tunnel.ps1 -Action create`
- [ ] Added domain to Cloudflare
- [ ] Edited `config.yml` with your domain
- [ ] Added DNS CNAME records
- [ ] Backend running on :8001
- [ ] Frontend running on :5173
- [ ] Tunnel running
- [ ] Access at: `https://frontend.yourdomain.com` & `https://api.yourdomain.com`

---

## 🔗 Access Your Apps

| Service | Local | Public |
|---------|-------|--------|
| **Frontend** | http://localhost:5173 | https://frontend.yourdomain.com |
| **Backend** | http://localhost:8001 | https://api.yourdomain.com |
| **Health Check** | http://localhost:8001/health | https://api.yourdomain.com/health |

---

## 🛠️ Common Commands

```powershell
# List all tunnels
cloudflared tunnel list

# Run tunnel
cloudflared tunnel run virtual-agent

# Stop tunnel (Ctrl+C in the terminal)

# Check tunnel status
cloudflared tunnel info virtual-agent

# Delete tunnel (if needed)
cloudflared tunnel delete virtual-agent

# View logs
cloudflared tunnel logs virtual-agent
```

---

## ⚠️ Common Issues & Fixes

### "Port already in use"
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill it
taskkill /PID <PID> /F
```

### "DNS not resolving"
- Wait 5-10 minutes for DNS propagation
- Clear browser cache (Ctrl+Shift+Delete)
- Verify CNAME records in Cloudflare Dashboard

### "Connection refused"
- Check backend is running: `curl http://localhost:8001/health`
- Check frontend is running: `curl http://localhost:5173`
- Check tunnel is running and showing successful ingress

### "SSL/TLS Certificate Error"
- In Cloudflare Dashboard, go to SSL/TLS → Configuration
- Set to "Full" or "Full (strict)"
- Restart tunnel

### Frontend can't reach backend
Update in `Virtual_Agent1/frontend/.env.local`:
```
VITE_API_URL=https://api.yourdomain.com
```

---

## 📚 Documentation Links

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Named Tunnels Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/tunnel-guide/)
- [Ingress Rules](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/ingress/)
- [Cloudflare Zero Trust](https://developers.cloudflare.com/cloudflare-one/)

---

## 🔐 Security Notes

✓ Cloudflare tunnel automatically provides SSL/TLS encryption  
✓ Your backend credentials are never exposed directly  
✓ All traffic is routed through Cloudflare's network  
✓ Configure WAF rules in Cloudflare Dashboard for extra protection  

---

## 💡 Pro Tips

1. **Use environment files**: Create `.env.local` in frontend folder to switch API URLs easily
2. **Monitor logs**: Keep tunnel terminal visible to debug connection issues
3. **Use named tunnels**: More reliable than temporary `--url` tunnels
4. **Set up alerts**: Cloudflare Dashboard has monitoring tools
5. **Test locally first**: Before publicizing URL, test at localhost

---

## 🚀 Next Steps

After tunnel is working:
1. Test all API endpoints: `https://api.yourdomain.com/health`
2. Test frontend connectivity: `https://frontend.yourdomain.com`
3. Test file uploads and resume parsing
4. Monitor Cloudflare Analytics dashboard
5. Set up monitoring and alerts
