# Environment Variables Configuration

## Backend Environment Variables (.env)

Required for production deployment on Render:

```
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Anam Avatar Configuration
ANAM_AVATAR_ID=your-avatar-id
ANAM_SIGNALLING_URL=https://connect-eu.anam.ai/v1/webrtc/engines/anm/ws

# Server Configuration
PORT=10000
NODE_ENV=production

# Optional: Session/Security
DEBUG_WS=false
SESSION_SECRET=your-session-secret-here
```

### Getting API Keys:

**OpenAI API Key**:
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and add to Render environment variables

**Anam Configuration**:
1. Log in to https://anam.ai/dashboard
2. Navigate to Avatar settings
3. Copy Avatar ID and Signalling URL
4. Add to Render environment variables

---

## Frontend Environment Variables (Vercel)

Add these in Vercel Project Settings → Environment Variables:

```
VITE_BACKEND_URL=https://interview-bot-backend.onrender.com
NODE_ENV=production
VITE_APP_NAME=Interview Platform
```

### For Local Development:

Create `.env.local` in `frontend/` directory:
```
VITE_BACKEND_URL=http://localhost:8001
```

This file is automatically ignored by git and only used locally.

---

## Deployment Steps

### 1. Create .env File Locally (Development Only)
```bash
cd Virtual_Agent/backend
cat > .env << EOF
OPENAI_API_KEY=sk-...
ANAM_AVATAR_ID=...
ANAM_SIGNALLING_URL=...
NODE_ENV=development
EOF
```

### 2. Don't Commit .env to Git
Your `.gitignore` already excludes `.env`:
```
.env
```

### 3. Set Variables on Render Dashboard
- Go to your Render service
- Settings → Environment
- Add each variable individually

### 4. Set Variables on Vercel Dashboard
- Go to your Vercel project
- Settings → Environment Variables
- Add `VITE_BACKEND_URL` pointing to your Render URL

---

## Verifying Deployment

### Check Backend is Running
```bash
curl https://interview-bot-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "Backend is running ✓",
  "timestamp": "2026-03-14T14:23:43.973Z"
}
```

### Check Frontend is Running
Visit: `https://your-project.vercel.app`

Should load without 404 errors.

### Check API Connection
1. Open browser DevTools
2. Go to Network tab
3. Log in to your application
4. Watch for successful API calls to `/api/interview/*` endpoints
5. No CORS errors should appear in console

---

## Troubleshooting

### CORS Errors
**Problem**: `Access to XMLHttpRequest blocked by CORS`

**Solution**: 
1. Verify `FRONTEND_URL` environment variable is set on Render
2. Update `ALLOWED_ORIGINS` in `backend/server.js`
3. Redeploy backend after changes

### API 502 Bad Gateway
**Problem**: Backend returns 502 error

**Solution**:
1. Check Render logs for errors
2. May be cold start (free tier takes 30+ seconds)
3. Upgrade to Starter plan for consistent performance

### Environment Variables Not Working
**Problem**: Variables defined on Render/Vercel but not used

**Solution**:
1. Restart the service after adding variables
2. Force redeploy in Render dashboard
3. For Vercel: variables are applied on next deployment

---

## Production Checklist

Before going live:
- [ ] All environment variables set on Render
- [ ] All environment variables set on Vercel  
- [ ] Backend CORS configured for your Vercel URL
- [ ] Database seeded with initial data
- [ ] SSL certificates active (automatic on both platforms)
- [ ] Health endpoints responding
- [ ] API calls working end-to-end
- [ ] Error monitoring configured (optional: Sentry)
