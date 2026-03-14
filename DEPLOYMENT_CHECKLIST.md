# Virtual_Agent1 Deployment Checklist (Quick Reference)

## ✅ Pre-Deploy (Do Once)

### Vercel Setup
- [ ] GitHub repo linked: `Ajithrock18/Virtual_Agent1` → Vercel project
- [ ] Branch: `development`
- [ ] Framework: Vite (auto-detected)
- [ ] Root: `Virtual_Agent/frontend`
- [ ] Build: `npm run build`
- [ ] Output: `dist`

### Environment Variables (Vercel Project Settings)
```
VITE_API_BASE_URL=https://interview-bot-backend.onrender.com
```

### Render Backend
- [ ] Root directory: `Virtual_Agent/backend` (forward slash `/`)
- [ ] Build: `npm install`
- [ ] Start: `npm start`
- [ ] Env vars set: `OPENAI_API_KEY`, `ANAM_AVATAR_ID`, `FRONTEND_URL`, `NODE_ENV`

---

## 📋 Before Each Deployment

### 1. Local Verification (2 min)
```bash
cd Virtual_Agent/frontend
npm ci
npm run build
# ✅ Expected: "✓ 72 modules transformed [time]"

npm run preview
# ✅ Test at http://localhost:4173
```

### 2. Code Check
- [ ] No hardcoded localhost/port in code
- [ ] No uncommitted files that are imported
- [ ] All env vars use `VITE_` prefix

### 3. Git Push
```bash
cd c:\Users\Ajith Kumar T\OneDrive\Desktop\Project1
git add Virtual_Agent/frontend/
git commit -m "fix/feature: [description]"
git push origin development
```

---

## 🚀 During Deployment (Auto)

Vercel auto-builds when you push to `development` branch.

**Monitor at:** https://vercel.com → Deployments

**Expected:**
```
Running "npm ci"
✓ 18s

Running "npm run build"
vite v5.4.21 building for production...
✓ 72 modules transformed.
dist/index.html              0.72 kB
dist/assets/index-*.js       392.37 kB
dist/assets/index-*.css      41.47 kB
✓ built in ~2s

Deployment complete
Status: Ready to view ✅
```

---

## ✔️ Post-Deploy Tests (5 min)

### 1. Frontend Loads
- [ ] Open Vercel URL → No 404
- [ ] Dark theme renders
- [ ] F12 Console → No red errors

### 2. Test Sign Up
```
1. Click "Get Started" / "Sign Up"
2. Fill email, password
3. Submit
✅ Expected: Account created or login page
```

### 3. Test Login
```
1. Enter existing email + password
2. Click Login
✅ Expected: Redirect to /start or profile
```

### 4. Test Practice Interview
```
1. Click "Start Practice Interview"
2. Select role from dropdown
3. Click "Start"
✅ Expected: Anam avatar loads, interview begins
```

### 5. Check API Calls (DevTools)
```
1. F12 → Network tab
2. Start any action (login, interview)
3. Look for requests to: https://interview-bot-backend.onrender.com/api/...
✅ Expected:
   - Status: 200 OK
   - No CORS errors
   - No 404/500
```

### 6. Verify Backend Health
```bash
curl https://interview-bot-backend.onrender.com/health
✅ Expected: {"status":"ok"} or similar
```

---

## 🔧 If Build Fails

### Step 1: Check Vercel Logs
- Go to Vercel Deployments → Failed build → View Logs
- Scroll past "transforming..." to find actual error

### Step 2: Fix Locally
```bash
cd Virtual_Agent/frontend
npm run build
# ← Fix errors locally first
```

### Step 3: Redeploy
```bash
git add .
git commit -m "fix: [error description]"
git push origin development
```

### Step 4: Common Errors Quick Links

| Error | Fix |
|-------|-----|
| `Cannot find module` | `git add [file]` |
| `case sensitivity ENOENT` | Use correct case + forward slashes |
| `import.meta.env.X undefined` | Add `VITE_` prefix & set in Vercel |
| `window is not defined` | Wrap in `if (typeof window !== 'undefined')` |

---

## 📊 Current Status

| Item | Status | Details |
|------|--------|---------|
| Frontend Build | ✅ | Commit `316ff94`, local: 1.97s |
| Git Repo | ✅ | All 78 files tracked |
| Vercel Project | ✅ | Connected, ready |
| Render Backend | ✅ | Health endpoint working |
| Env Variables | ⚠️ | Set `VITE_API_BASE_URL` in Vercel Settings |

---

## 🎯 Success = All Green
- ✅ Vercel: "Ready to view"
- ✅ Frontend URL loads
- ✅ Sign up works
- ✅ Login works
- ✅ Interview starts
- ✅ API calls succeed (Network tab)
- ✅ No console errors (except CJS deprecation ok)

---

**Docs:** See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
