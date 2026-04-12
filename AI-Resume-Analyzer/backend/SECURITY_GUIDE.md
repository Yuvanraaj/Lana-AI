# 🔐 Security Implementation Guide - Phase 0

## Overview
This document describes the security features implemented in Phase 0 and how to use them.

## 1. CORS Security ✅ Implemented

### What was fixed:
- **Before**: CORS allowed all origins (`allow_origins=["*"]`)
- **After**: CORS whitelists specific frontend URLs

### Configuration:
```env
# .env file
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

### How it works:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Only specific URLs allowed
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

### Production Checklist:
- [ ] Update `ALLOWED_ORIGINS` to include your production frontend URL
- [ ] Remove localhost URLs
- [ ] Test CORS with `curl -H "Origin: https://your-domain.com" http://api.yourapi.com/health`

---

## 2. Security Headers ✅ Implemented

### Headers Added:

| Header | Purpose | Value |
|--------|---------|-------|
| `X-Content-Type-Options` | Prevent MIME type sniffing | `nosniff` |
| `X-Frame-Options` | Prevent clickjacking | `DENY` |
| `X-XSS-Protection` | Enable browser XSS filtering | `1; mode=block` |
| `Strict-Transport-Security` | Force HTTPS | `max-age=31536000` |
| `Content-Security-Policy` | Control resource loading | Restricted |
| `Referrer-Policy` | Control referrer info | `strict-origin` |
| `Permissions-Policy` | Disable permissions | Camera, microphone, etc. |

### Verification:
```bash
# Check headers are present
curl -I http://localhost:8000/health

# Should see all security headers in response
```

---

## 3. Rate Limiting ✅ Implemented

### Configuration:
```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
```

### How it works:
- Tracks requests per IP address
- Allows 100 requests per 60 seconds
- Returns 429 (Too Many Requests) when exceeded

### Limitations (for production):
- **Current**: In-memory tracking (not shared across servers)
- **Recommendation**: Use Redis for distributed rate limiting

### Testing:
```bash
# Run rapid requests
for i in {1..150}; do curl http://localhost:8000/health & done
# Should start getting 429 errors after 100 requests
```

---

## 4. Input Validation ✅ Implemented

### Protected Endpoints:
- `/upload-resume`: Validates file, email, phone, name
- `/admin/*`: Validates JWT tokens
- All endpoints: Validates against common attack patterns

### Validation Rules:

#### Email
- Format: `user@domain.com`
- Length: <= 254 characters
- Pattern validated against RFC 5322

#### Phone
- Format: 7-15 digits (international)
- Allows: +1, spaces, hyphens, parentheses
- Example: `+1 (555) 123-4567`

#### Name
- Length: 1-200 characters
- Allowed characters: Letters, spaces, hyphens, apostrophes, periods
- Example: `John O'Brien-Smith`

#### File
- Allowed extensions: `.pdf`, `.docx`
- Max size: 10MB
- Sanitized filename to prevent path traversal

### Example Validation Response:
```bash
curl -X POST http://localhost:8000/upload-resume \
  -F "user_name=J" \
  -F "email=invalid" \
  -F "phone=123" \
  -F "file=@resume.pdf"

# Response 400:
# {
#   "detail": "Validation failed: Name must be at least 2 characters, 
#              Invalid email format, Invalid phone format"
# }
```

---

## 5. JWT Authentication ✅ Implemented

### Features:
- **Access Token**: Valid for 30 minutes
- **Refresh Token**: Valid for 7 days
- **Standard Claims**: email, user_id, role, permissions
- **Algorithms**: HS256

### Login Endpoint:
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# Response:
# {
#   "access_token": "eyJhbGc...",
#   "refresh_token": "eyJhbGc...",
#   "token_type": "bearer",
#   "expires_in": 1800
# }
```

### Using Token:
```bash
# Get current user
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:8000/auth/me

# Response:
# {
#   "email": "admin@example.com",
#   "user_id": 1,
#   "role": "admin",
#   "permissions": ["read", "write"]
# }
```

### JWT Secret Management:
```bash
# Generate secure secret (DO THIS IN PRODUCTION):
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Output example:
# p-VCJNjJh4SJSZbpZKxkL6p-VCJNjJh4SJSZbpZKxkL6p

# Paste into .env:
# JWT_SECRET_KEY=p-VCJNjJh4SJSZbpZKxkL6p-VCJNjJh4SJSZbpZKxkL6p
```

### Production Checklist:
- [ ] Change JWT_SECRET_KEY to a secure value
- [ ] Use HTTPS to prevent token interception
- [ ] Implement token refresh logic on frontend
- [ ] Store refresh token securely (httpOnly cookie)
- [ ] Store access token in memory (not localStorage)

---

## 6. Role-Based Access Control (RBAC) ✅ Implemented

### Roles:
- **user**: Regular users (read-only access)
- **admin**: Administrative users (full access)

### Role Assignment:
```python
# Automatic based on email
ADMIN_EMAILS=admin@example.com,ajith@example.com
```

If user email is in `ADMIN_EMAILS`, they get `admin` role, otherwise `user` role.

### Checking Role:
```python
from fastapi import Depends
from auth import get_admin_user, TokenData

@app.get("/admin/data")
async def admin_only(current_user: TokenData = Depends(get_admin_user)):
    # This endpoint requires admin role
    return {"role": current_user.role}
```

---

## 7. Protected Admin Endpoints ✅ Implemented

### Admin Endpoints (Require Authentication):

#### 1. Get All Resumes
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/admin/resumes

# Response:
# {
#   "resumes": [...],
#   "count": 42,
#   "requested_by": "admin@example.com"
# }
```

#### 2. Get Analytics
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/admin/analytics
```

#### 3. Export CSV
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/admin/export-csv > resumes.csv
```

### What happens without authentication:
```bash
# Missing token
curl http://localhost:8000/admin/resumes
# Response 401: Invalid authentication credentials

# Invalid token
curl -H "Authorization: Bearer invalid" \
  http://localhost:8000/admin/resumes
# Response 401: Invalid or expired token

# Non-admin user
curl -H "Authorization: Bearer <user_token>" \
  http://localhost:8000/admin/resumes
# Response 403: Admin access required
```

---

## 8. Security Logging ✅ Implemented

### What's Logged:

#### All Requests:
```
REQUEST | Method: POST | Path: /upload-resume | Client: 127.0.0.1 | User-Agent: curl/7.68.0
RESPONSE | Method: POST | Path: /upload-resume | Status: 200 | Duration: 2.345s
```

#### Sensitive Operations:
```
AUDIT | Operation: GET /admin/resumes | Client: 127.0.0.1 | Timestamp: 2026-04-04T10:30:45
AUDIT | Result: 200 | Path: /admin/resumes
```

#### Security Events:
```
WARNING | Rate limit exceeded for IP: 192.168.1.100
WARNING | Non-admin user admin@example.com attempted admin action
WARNING | Suspicious input pattern detected from 192.168.1.1: union select...
WARNING | Failed login attempt for hacker@evil.com
ERROR | JWT verification failed
```

### View Logs:
```bash
# Run server and view logs in terminal/console
python main.py

# Or write to file:
python main.py > server.log 2>&1
```

### Log Levels:
- **DEBUG**: Detailed debugging information
- **INFO**: Important events (logins, uploads)
- **WARNING**: Security events, suspicious activity
- **ERROR**: Errors that may need attention

---

## 9. Environment Variable Management ✅ Implemented

### Best Practices:

#### Development (.env):
```env
JWT_SECRET_KEY=dev-key-change-in-production-xxx
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
REQUIRE_HTTPS=false
```

#### Template (.env.template):
```env
JWT_SECRET_KEY=CHANGE_ME_IN_PRODUCTION
ALLOWED_ORIGINS=your-frontend-url.com
REQUIRE_HTTPS=true
```

#### Production (CI/CD only):
```bash
# Use GitHub Secrets or deployment platform's secret management
# Set in deployment configuration, NOT in .env file
```

### Git Configuration:
```bash
# .gitignore already configured to prevent commits
.env          # Never committed
.env.local    # Never committed
.env.template # Committed (no secrets)
```

---

## 10. HTTPS Enforcement ✅ Implemented

### Configuration:
```env
# Development: false
REQUIRE_HTTPS=false

# Production: true
REQUIRE_HTTPS=true
```

### What it does:
- When true, rejects any non-HTTPS requests
- Returns 400 Bad Request with message "HTTPS is required"

### Production Setup:
```python
# In production, use:
REQUIRE_HTTPS=true
# And deploy with proper HTTPS certificate (Let's Encrypt recommended)
```

### Local Testing:
```bash
# Disable HTTPS check for local development
# Keep in .env: REQUIRE_HTTPS=false
```

---

## 11. Suspicious Input Detection ✅ Implemented

### Patterns Blocked:
- SQL Injection: `UNION SELECT`, `DROP TABLE`, `DELETE FROM`, etc.
- XSS Attacks: `<script>`, `javascript:`, event handlers
- Path Traversal: `../`, `..\`, null bytes

### When Detected:
- Request logged to WARNING level
- Request is NOT blocked (for flexibility)
- Recommendation: Implement WAF (Web Application Firewall) in production

### Example:
```bash
curl -X POST http://localhost:8000/upload-resume \
  -F "user_name=test' OR '1'='1" \
  -F "email=test@test.com" \
  ...

# Logs:
# WARNING | Suspicious input pattern detected from 127.0.0.1
```

---

## Security Checklist - Pre-Production

### Configuration:
- [ ] Change `JWT_SECRET_KEY` to secure random value
- [ ] Update `ALLOWED_ORIGINS` to production frontend URLs
- [ ] Set `REQUIRE_HTTPS=true`
- [ ] Set `API_RELOAD=False`
- [ ] Set `DB_PASSWORD` to strong value
- [ ] Update `ADMIN_EMAILS` to production admins

### Infrastructure:
- [ ] Enable HTTPS/TLS certificates (Let's Encrypt recommended)
- [ ] Setup proper firewall rules
- [ ] Implement Web Application Firewall (WAF)
- [ ] Setup log aggregation and monitoring
- [ ] Setup rate limiting at reverse proxy level (Nginx/HAProxy)
- [ ] Enable intrusion detection system (IDS)

### Monitoring:
- [ ] Setup log alerting for suspicious patterns
- [ ] Monitor failed login attempts
- [ ] Monitor admin action audit logs
- [ ] Setup uptime monitoring
- [ ] Setup performance monitoring

### Operations:
- [ ] Create incident response plan
- [ ] Train team on security procedures
- [ ] Document backup and recovery procedures
- [ ] Schedule regular security audits
- [ ] Review and rotate secrets regularly

### Testing:
- [ ] Test with OWASP ZAP security scanner
- [ ] Penetration testing by security professionals
- [ ] Test CORS restrictions
- [ ] Test rate limiting under load
- [ ] Test authentication flows

---

## Next Steps - Phase 1

### Week 2-3: Explainability
- [ ] Add score breakdown with evidence
- [ ] Show deduction reasons
- [ ] Create score explanation UI

### Week 4: Async Processing  
- [ ] Setup Celery for background jobs
- [ ] Implement resume analysis queue
- [ ] Add job status tracking

### Week 5-6: Scalability
- [ ] Setup Redis for rate limiting & caching
- [ ] Containerize with Docker
- [ ] Kubernetes deployment configuration

---

## Support & References

### FastAPI Security:
- https://fastapi.tiangolo.com/tutorial/security/

### OWASP:
- https://owasp.org/www-project-top-ten/

### JWT Best Practices:
- https://tools.ietf.org/html/rfc8725

### Let's Encrypt (HTTPS):
- https://letsencrypt.org/

---

## Questions & Troubleshooting

### "Invalid authentication credentials"
- Check token is included in `Authorization: Bearer <token>`
- Check token hasn't expired
- Check JWT_SECRET_KEY matches

### "Admin access required"
- Your email must be in `ADMIN_EMAILS` configuration
- Request new login token after updating ADMIN_EMAILS

### "Too many requests"
- Wait 60 seconds before making more requests
- Or increase `RATE_LIMIT_REQUESTS` in production

### "HTTPS is required"
- Set `REQUIRE_HTTPS=false` for local development
- Use HTTPS in production with valid certificates

---

**Last Updated**: April 4, 2026  
**Version**: 1.0.0  
**Status**: ✅ Phase 0 Complete
