# Deployment Guide: Vercel (Frontend) & Render (Backend)

## Overview
This guide walks you through deploying your Interview Platform with:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Express.js + SQLite)

---

## Part 1: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Vercel

Your `vercel.json` is already configured correctly:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Set Up Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub
3. Authorize Vercel to access your GitHub repositories

### Step 3: Deploy Frontend to Vercel
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: `Ajithrock18/Virtual_Agent1`
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `Virtual_Agent/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   ```
   VITE_BACKEND_URL=https://your-backend-url.onrender.com
   ```
   (Replace with your actual Render backend URL from Part 2)
5. Click **Deploy**

### Step 4: Get Your Vercel URL
After deployment completes:
- Your frontend will be live at: `https://your-project.vercel.app`
- Copy this URL for Step 7 (CORS configuration)

---

## Part 2: Backend Deployment (Render)

### Step 1: Prepare Backend Repository
Backend is already configured in `render.yaml`:
```yaml
services:
  - type: web
    name: interview-bot-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
```

### Step 2: Set Up Render Account
1. Go to [render.com](https://render.com)
2. Sign up or log in with GitHub
3. Authorize Render to access your GitHub repositories

### Step 3: Deploy Backend to Render
1. Click **"New +"** → **"Web Service"**
2. Select: **"Deploy an existing repo"** → Choose `Virtual_Agent1`
3. Configure service:
   - **Name**: `interview-bot-backend`
   - **Root Directory**: `Virtual_Agent/backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter for production)
4. Click **Create Web Service**

### Step 4: Configure Environment Variables
After service creation, go to **Environment** tab and add:

```
OPENAI_API_KEY=sk-...your-key...
ANAM_AVATAR_ID=your-avatar-id
ANAM_SIGNALLING_URL=your-signalling-url
NODE_ENV=production
PORT=10000
```

**Important**: Get your API keys from:
- OpenAI Dashboard: https://platform.openai.com/api-keys
- Anam Dashboard: https://anam.ai/dashboard

### Step 5: Get Your Render Backend URL
After deployment completes:
- Your backend will be live at: `https://interview-bot-backend.onrender.com`
- Note this URL for Step 4 (Frontend environment setup)

### Step 6: Setup Database on Render
Your SQLite database auto-initializes via `initializeDatabase()` in `server.js`

---

## Part 3: Connect Frontend to Backend

### Step 1: Update Frontend Environment Variables
1. Go to your Vercel Project Settings → **Environment Variables**
2. Update `VITE_BACKEND_URL`:
   ```
   VITE_BACKEND_URL=https://interview-bot-backend.onrender.com
   ```
3. Redeploy frontend (Vercel auto-redeploys on variable changes)

### Step 2: Update Backend CORS
In `backend/server.js` (line ~24), update CORS configuration:
```javascript
app.use(cors({
  origin: 'https://your-project.vercel.app', // Replace with your Vercel URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Then push to GitHub:
```bash
git add backend/server.js
git commit -m "chore: Update CORS for production"
git push origin development
```

Render will auto-redeploy when changes are pushed.

---

## Part 4: Verification Checklist

### Frontend (Vercel)
- [ ] Application loads at `https://your-project.vercel.app`
- [ ] Navigation works (Home, Profile, Chatbot)
- [ ] User registration/login possible
- [ ] Forms submit correctly

### Backend (Render)
- [ ] Health endpoint responds: `https://interview-bot-backend.onrender.com/health`
- [ ] Can create interview sessions: `POST /api/interview/session/create`
- [ ] Can fetch analytics: `GET /api/analytics/user-stats`
- [ ] WebSocket connects for chat: `wss://interview-bot-backend.onrender.com/api/anam/ws-proxy`

### Full Integration
- [ ] Login works end-to-end
- [ ] Practice interview starts successfully
- [ ] Feedback data persists
- [ ] Analytics display in dashboard
- [ ] No CORS errors in console

---

## Troubleshooting

### Issue: "Cannot GET /" on Frontend
**Solution**: Vercel routing is misconfigured
```
Check vercel.json has the rewrite rule:
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue: API calls fail with CORS error
**Solution**: Update backend CORS to match your Vercel domain
```javascript
origin: 'https://your-project.vercel.app'
```

### Issue: Backend times out on Render
**Solution**: 
- Cold starts on free tier take 30+ seconds
- Use Starter plan for production
- Check logs in Render dashboard

### Issue: Database not persisting on Render
**Solution**: 
- SQLite works on Render but is ephemeral on free tier
- Migrate to PostgreSQL for persistent data:
  ```bash
  # Render provides free PostgreSQL
  # Update backend to use PostgreSQL connection string
  ```

---

## Deployment Commands Summary

### Push Code to GitHub
```bash
git add .
git commit -m "Deploy to production"
git push origin development
```

### Monitor Logs
**Vercel Logs**:
- Dashboard → Your Project → Deployments → Click deployment → Logs

**Render Logs**:
- Dashboard → Your Service → Logs

---

## Next Steps

1. **Domain Setup** (Optional)
   - Add custom domain in Vercel settings
   - Add custom domain in Render settings

2. **SSL/HTTPS** 
   - Both Vercel and Render provide free SSL

3. **Monitoring**
   - Set up error tracking with Sentry
   - Monitor database performance

4. **Scaling**
   - Upgrade Vercel to Pro ($20/month) for better performance
   - Upgrade Render to Starter tier ($7/month) for persistent database

---

## Support

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- GitHub Issues: https://github.com/Ajithrock18/Virtual_Agent1/issues
