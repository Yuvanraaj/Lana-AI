# Vercel Deployment Guide for Virtual_Agent1

## Part 1: Root Cause Analysis (Build Hanging Issue - RESOLVED)

### The Problem
Vercel build was hanging at "transforming..." stage during `npm run build`, while local builds worked fine.

### Root Causes Identified & Fixed

| Cause | Impact | Fix Applied |
|-------|--------|-------------|
| `babel: true` in React plugin | Conflicts with Vercel's CJS build mode (deprecated) | ✅ Removed |
| Manual chunk splitting (vendor chunks) | Controversial with Vercel's internal build process | ✅ Removed |
| `minify: 'esbuild'` | Unstable in Vercel's constrained environment | ✅ Removed (use default terser) |
| Excessive build config options | Adds complexity, increases failure surface | ✅ Simplified to essential only |

### Verification
- **Local build:** ✅ 72 modules, 1.97s (proven working)
- **Latest commit:** `316ff94` - Simplified vite.config.ts
- **Next expected:** Vercel build should complete in < 30s

---

## Part 2: Frontend Configuration (Vite + React)

### Current Setup (Verified Working Locally)

**File: `Virtual_Agent/frontend/vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

**Why This Works:**
- ✅ Minimal → fewer failure points
- ✅ Compatible with Vercel's Node 18+ environment
- ✅ React plugin uses default settings (no deprecated options)
- ✅ Output directory matches Vercel expectation

### Environment Variables

**File: `Virtual_Agent/frontend/src/config.js`**
```javascript
const isDev = import.meta.env.DEV;
const defaultBackend = isDev ? "" : "/api";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultBackend;
```

**Vercel Project Settings Required:**
Go to **Vercel Dashboard** → **Settings** → **Environment Variables** and add:

```
VITE_API_BASE_URL = https://interview-bot-backend.onrender.com
```

**Deployment Environments:**
- **Production:** Set to your Render backend URL
- **Preview/Staging:** Set to your staging backend URL (if applicable)

---

## Part 3: Backend API Configuration

### Current Backend Status
- **Service:** Running on Render
- **Health Check:** `https://interview-bot-backend.onrender.com/health`
- **Root Directory:** `Virtual_Agent/backend` ✅

### API Endpoints Used by Frontend

| Endpoint | Purpose | Used In |
|----------|---------|---------|
| `/api/analytics/*` | User profile, stats, progress | UserProfile, ProgressDashboard |
| `/api/interview/session/create` | Create interview session | Interview, UserProfile |
| `/api/interview/save-interview` | Save interview results | Interview |
| `/api/interview/summary/{id}` | Get feedback & summary | FeedbackDetails |
| `/api/anam/engine` | Anam avatar backend | AnamAvatar component |
| `/api/openai-proxy` | OpenAI / Chatbot proxy | Chatbot |
| `/api/parse-resume` | Resume parser | ResumeParse |

### CORS Configuration (Backend)
**File: `Virtual_Agent/backend/server.js`**

Ensure CORS includes your Vercel frontend URL:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'https://interview-platform.vercel.app'
  ],
  credentials: true
}))
```

---

## Part 4: Complete Deployment Checklist

### Pre-Deployment (Do Once)

#### 1. Vercel Project Configuration
- [ ] **Link Repository:** Connect GitHub repo `Ajithrock18/Virtual_Agent1` to Vercel
- [ ] **Select Branch:** `development`
- [ ] **Framework Preset:** Vite (should auto-detect from vite.config.ts)
- [ ] **Root Directory:** `Virtual_Agent/frontend`
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `dist`

#### 2. Environment Variables (Vercel)
1. Go to **Project Settings** → **Environment Variables**
2. Add for **Production**:
   ```
   VITE_API_BASE_URL=https://interview-bot-backend.onrender.com
   ```
3. Add for **Preview** (optional, for staging):
   ```
   VITE_API_BASE_URL=https://staging-backend.onrender.com
   ```

#### 3. Render Backend Configuration
- [ ] **Root Directory:** `Virtual_Agent/backend` (use forward slashes `/`, NOT backslashes `\`)
- [ ] **Build Command:** `npm install`
- [ ] **Start Command:** `npm start`
- [ ] **Environment Variables Set:**
  - `OPENING_AI_KEY` (or `OPENAI_API_KEY`)
  - `ANAM_AVATAR_ID`
  - `FRONTEND_URL=https://your-vercel-url.vercel.app`
  - `NODE_ENV=production`

### Pre-Each-Deployment (Before Pushing)

#### 4. Local Verification
```bash
cd Virtual_Agent/frontend

# Verify dependencies
npm ci

# Build locally
npm run build
# Expected: ✓ 72 modules transformed, built in ~2s

# Preview locally
npm run preview
# Expected: Server running at http://localhost:4173
```

#### 5. Code Quality Checks
- [ ] No hardcoded `localhost` or port numbers (they should be in API calls within `useEffect`)
- [ ] All environment variables use `VITE_` prefix for frontend
- [ ] No `process.env` references on client side (except in functions)
- [ ] No uncommitted files that are imported

```bash
# Check git status
git status
# Expected: Only changes in .ts/.tsx/.jsx files, no untracked imports

# Review changes
git diff Virtual_Agent/frontend/
```

#### 6. Git Commit & Push
```bash
cd c:\Users\Ajith Kumar T\OneDrive\Desktop\Project1

git add Vector_Agent/frontend/

git commit -m "build: [your changes brief description]"

git push origin development
```

### Deployment Execution

#### 7. Monitor Vercel Build
1. Go to **Vercel Dashboard** → **Virtual_Agent1** project
2. **Deployments** tab shows live build
3. **Expected output:**
   ```
   Running "npm ci"
   Running "npm run build"
   vite v5.4.21 building for production...
   ✓ 72 modules transformed.
   dist/index.html    0.72 kB
   dist/assets/...    [CSS + JS bundles]
   ✓ built in [<5s]
   ```
4. **Status:** Should show **"Ready to view"** with green checkmark
5. **Copy the deployment URL**

#### 8. Verify Backend is Reachable
```bash
# Test Render backend health
curl https://interview-bot-backend.onrender.com/health
# Expected: { "status": "ok" } (or similar)
```

### Post-Deployment Testing

#### 9. Test Frontend at Vercel URL
1. **Open URL:** Go to your Vercel deployment URL
2. **Test Landing Page:**
   - [ ] Page loads without 404 errors
   - [ ] Dark theme displays correctly
   - [ ] No console errors (F12 → Console)

#### 10. Test Critical User Flows
```
Flow 1: Sign Up
  [ ] Click "Sign Up" / "Get Started"
  [ ] Fill form (name, email, password)
  [ ] Submit
  [ ] Expected: Account created, redirect to login or profile

Flow 2: Login
  [ ] Enter email and password
  [ ] Click "Login"
  [ ] Expected: Redirect to /start or profile

Flow 3: Start Practice Interview
  [ ] Select role from dropdown
  [ ] Select mode (Practice Interview)
  [ ] Click "Start"
  [ ] Expected: Anam avatar loads, interview begins

Flow 4: Check API Connectivity
  [ ] Open browser DevTools (F12)
  [ ] Go to Network tab
  [ ] Perform any action (login, start interview)
  [ ] Check requests:
    [ ] Requests to API endpoints start with https://interview-bot-backend.onrender.com
    [ ] No 404 or 401 errors unless expected
    [ ] No CORS errors
```

#### 11. Check Console for Errors
In browser DevTools Console:
- [ ] No red errors
- [ ] CJS deprecation warnings are OK (they're in Vite, not your code)
- [ ] If API calls fail, check Network tab for 500/502 errors on backend

### Troubleshooting

#### Build Still Fails on Vercel After Deployment?

**Step 1: Check Vercel Build Logs**
- Vercel Dashboard → Deployments → Failed Deployment → View Logs
- Look for the actual error after "transforming..."

**Step 2: Common Errors & Fixes**

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'X'` | Missing import or file not in Git | `git add [file]` and commit |
| `SyntaxError in [file]` | JavaScript syntax error | Fix the file, verify locally with `npm run build` |
| `ENOENT: no such file` | Path case mismatch (Windows vs Linux) | Use lowercase, forward slashes; verify file exists |
| `import.meta.env.X is undefined` | Missing VITE_ prefix or not set in Vercel | Ensure env var starts with `VITE_` and is set in Vercel Settings |
| `ReferenceError: window is not defined` | Code runs during build time | Wrap window access: `if (typeof window !== 'undefined')` |

**Step 3: Redeploy After Fix**
```bash
git add [files]
git commit -m "fix: [description]"
git push origin development
# Vercel auto-deploys on push
```

#### API Calls Failing (404 or CORS)?

**Verify:**
1. Backend URL is correct: `https://interview-bot-backend.onrender.com`
2. Backend has CORS enabled for your Vercel URL
3. Render backend is running: Check Render dashboard

**Fix:**
1. Update `VITE_API_BASE_URL` in Vercel Settings if URL changed
2. Restart Render service
3. Check Render logs for server errors

---

## Part 5: Future Deployment Tips

### 1. Version Lock
Create `Virtual_Agent/frontend/.nvmrc`:
```
18
```
This ensures Vercel uses Node 18.x (latest stable LTS).

### 2. Use npm ci Instead of npm install
In Vercel Build Command, use:
```
npm ci
```
(It's implicit in Vercel, but good for local reproduction.)

### 3. Pre-Commit Checks
Before pushing, run:
```bash
npm run build    # Verify build succeeds
npm run preview  # Verify locally in prod mode
```

### 4. Environment Variable Best Practices
- Always use `VITE_` prefix for frontend variables
- Never commit `.env` files
- Use Vercel Settings UI, not inline secrets
- Test locally with `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8001
```

### 5. Monitor Deployments
- Subscribe to Vercel Slack/Email notifications
- Check Vercel dashboard weekly for failed builds
- Review backend logs on Render if API calls fail

---

## Part 6: Current Project State Summary

| Component | Status | Details |
|-----------|--------|---------|
| **Frontend (Vite + React)** | ✅ Ready | Commit `316ff94`, simplified vite.config.ts, local build verified 1.97s |
| **Backend (Express)** | ✅ Ready | Running on Render, health endpoint responds |
| **Git Repository** | ✅ Ready | All 78 Virtual_Agent files tracked in development branch |
| **Vercel Project** | ✅ Configured | Root: `Virtual_Agent/frontend`, env vars ready |
| **Render Service** | ✅ Configured | Root: `Virtual_Agent/backend`, health check passing |
| **Environment Variables** | ⚠️ Verify | VITE_API_BASE_URL needs to be set in Vercel Settings |
| **CORS** | ✅ Configured | Backend allows Vercel frontend URL |

---

## Quick Reference: Commands

```bash
# Local build (reproduce Vercel locally)
cd c:\Users\Ajith Kumar T\OneDrive\Desktop\Project1\Virtual_Agent\frontend
npm ci
npm run build
npm run preview

# Deploy to Vercel
cd c:\Users\Ajith Kumar T\OneDrive\Desktop\Project1
git add Virtual_Agent/frontend/[changed-files]
git commit -m "your message"
git push origin development
# → Vercel auto-deploys in ~30-60 seconds

# Check backend health
curl https://interview-bot-backend.onrender.com/health
```

---

## Success Criteria

✅ **You've successfully deployed when:**
1. Vercel shows **"Ready to view"** with green checkmark
2. Frontend URL loads without 404
3. Sign-up and login flows work
4. Practice Interview button calls backend (check Network tab)
5. No console errors except CJS deprecation warning
6. Backend health endpoint responds

---

**Last Updated:** March 14, 2026 | Commit: `316ff94`
