# Security Audit Report - Epic 01

**Project:** Joyful Baseball League Web Application
**Audit Date:** 2026-04-08
**Auditor:** Claude Code Security Review
**Scope:** Backend (Node.js/Express/TypeScript) + Frontend (React/TypeScript)

---

## Executive Summary

This security audit covers the authentication and authorization systems for the Joyful Baseball League admin panel. The codebase shows a generally solid foundation with proper use of parameterized queries, bcrypt for password hashing, and JWT-based authentication. However, several security issues were identified ranging from CRITICAL to LOW severity.

**Overall Security Rating:** MODERATE - Requires fixes before production deployment

---

## CRITICAL Issues

### 1. Weak JWT Secret in Production

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/.env`

**Issue Description:**
The `.env` file contains a hardcoded JWT secret that appears to be a randomly generated string but is committed to the repository. While the secret is long (64 characters), having it in a committed `.env` file means all developers share the same secret, and it may be exposed in git history.

**Current Code:**
```
JWT_SECRET=a7f3c9d2e8b5014f6a2d9c7e3b8f1a5d0e4c6b2a9f7d3e1c5a8b4f2d0e6c9a3b7f1d5e2c8a4a6b3d9f0e7c1a5b8d2f4e6a9c3b7d0f1e5a8b4c6
```

**Potential Impact:**
- If the repository is public or compromised, attackers can forge JWT tokens
- Shared secret across all environments makes token forgery possible
- No secret rotation mechanism

**Recommended Fix:**
1. Immediately remove `.env` from git tracking: `git rm --cached backend/.env`
2. Add `.env` to `.gitignore`
3. Generate a new, cryptographically secure secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
4. Use environment-specific secrets (different for dev/staging/prod)
5. Consider using a secrets manager for production

---

### 2. Permissive CORS Configuration

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/app.ts` (Line 7)

**Issue Description:**
The Express app uses `app.use(cors())` without any configuration, which allows requests from ANY origin. This is dangerous for an admin panel that handles sensitive operations.

**Current Code:**
```typescript
app.use(cors());  // Allows all origins
```

**Potential Impact:**
- Cross-origin attacks from malicious websites
- CSRF attacks (though JWT in header mitigates this partially)
- Unauthorized API access from unexpected domains

**Recommended Fix:**
```typescript
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### 3. No Rate Limiting on Authentication Endpoints

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/routes/auth.ts` (Lines 25-66)

**Issue Description:**
The login endpoint has no rate limiting, making it vulnerable to brute force attacks. Attackers can attempt unlimited password guesses without any throttling.

**Potential Impact:**
- Brute force password attacks
- Credential stuffing attacks
- Denial of service through resource exhaustion

**Recommended Fix:**
Install and configure `express-rate-limit`:

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  // ... existing code
});
```

---

## HIGH Issues

### 4. Long JWT Token Expiration

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/middleware/auth.ts` (Line 12)

**Issue Description:**
JWT tokens expire after 7 days, which is too long for an admin panel. If a token is compromised, the attacker has a week of access.

**Current Code:**
```typescript
return jwt.sign({ userId, role }, JWT_SECRET!, { expiresIn: '7d' });
```

**Potential Impact:**
- Extended window of opportunity for attackers with stolen tokens
- No token revocation mechanism (logout is client-side only)

**Recommended Fix:**
1. Reduce token expiration to 1-2 hours for admin users
2. Implement refresh token mechanism for longer sessions
3. Consider adding a token blacklist for immediate revocation on logout

```typescript
// Short-lived access token
const accessToken = jwt.sign({ userId, role }, JWT_SECRET!, { expiresIn: '2h' });

// Separate refresh token (stored in httpOnly cookie)
const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET!, { expiresIn: '7d' });
```

---

### 5. No Input Validation/Sanitization

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/routes/auth.ts` (Lines 26, 35)

**Issue Description:**
The login endpoint only checks if username and password exist, but does not validate their format, length, or sanitize the input. This could lead to various injection attacks or application errors.

**Current Code:**
```typescript
const { username, password } = req.body as LoginRequest;

if (!username || !password) {
  res.status(400).json({ error: 'Username and password are required' });
  return;
}
```

**Potential Impact:**
- NoSQL injection (if database changes to MongoDB in future)
- Log injection attacks
- Unexpected behavior with special characters

**Recommended Fix:**
Use a validation library like Zod or Joi:

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid input format' });
    return;
  }
  const { username, password } = parseResult.data;
  // ... rest of the code
});
```

---

### 6. Client-Side Token Storage (XSS Risk)

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/frontend/src/stores/auth.ts` (Line 31)

**Issue Description:**
The JWT token is stored in `localStorage`, which is vulnerable to XSS attacks. If an attacker can inject JavaScript into the application, they can steal the token.

**Current Code:**
```typescript
localStorage.setItem('token', data.token);
```

**Potential Impact:**
- Token theft via XSS attacks
- Session hijacking

**Recommended Fix:**
While there's no perfect solution for SPAs, consider:
1. Using `httpOnly` cookies (requires server changes)
2. Implementing CSP headers to mitigate XSS
3. Short token expiration to limit damage
4. Storing in memory only (requires re-login on refresh)

Best practice for SPAs with JWT:
```typescript
// Store in memory only (lost on page refresh)
let token: string | null = null;

// Or use httpOnly cookies (server must set them)
// Server sets cookie with: res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
```

---

### 7. Hardcoded Default Credentials in UI

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/frontend/src/pages/Login/index.tsx` (Lines 88-90)

**Issue Description:**
The login page displays default credentials in the UI, which is a security risk even for development.

**Current Code:**
```tsx
<p className="text-sm text-gray-500">
  Default credentials: admin / admin123
</p>
```

**Potential Impact:**
- Attackers know valid credentials exist
- May forget to remove before production
- Information disclosure

**Recommended Fix:**
Remove this from the UI entirely. For development, document credentials in a separate README or use environment-specific configuration.

---

## MEDIUM Issues

### 8. No Security Headers

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/app.ts`

**Issue Description:**
The Express application does not set security headers like Helmet would provide (X-Content-Type-Options, X-Frame-Options, Content-Security-Policy, etc.).

**Potential Impact:**
- Clickjacking attacks
- MIME-type sniffing attacks
- XSS vulnerabilities

**Recommended Fix:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Required for some CSS-in-JS
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

### 9. Generic Error Messages Could Be More Specific

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/routes/auth.ts` (Lines 40, 48)

**Issue Description:**
While using generic "Invalid credentials" is good for security, the current implementation uses the same message for both "user not found" and "wrong password". This is actually good practice, but there's no logging to help administrators detect attack patterns.

**Potential Impact:**
- Difficult to detect brute force attempts
- No audit trail for security events

**Recommended Fix:**
Add security logging (but keep generic messages to client):

```typescript
import { logSecurityEvent } from '../utils/security';

if (result.rows.length === 0) {
  logSecurityEvent('login_failed_user_not_found', { username, ip: req.ip });
  res.status(401).json({ error: 'Invalid credentials' });
  return;
}

if (!isPasswordValid) {
  logSecurityEvent('login_failed_wrong_password', { username, ip: req.ip, userId: user.id });
  res.status(401).json({ error: 'Invalid credentials' });
  return;
}

logSecurityEvent('login_success', { username, userId: user.id, ip: req.ip });
```

---

### 10. No HTTPS Enforcement

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/app.ts`

**Issue Description:**
There's no middleware to enforce HTTPS in production. While this might be handled at the reverse proxy level, the application should also enforce it.

**Recommended Fix:**
```typescript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## LOW Issues

### 11. Missing Request Size Limits

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/app.ts` (Line 8)

**Issue Description:**
No limit on JSON request body size, which could lead to DoS attacks with large payloads.

**Recommended Fix:**
```typescript
app.use(express.json({ limit: '10kb' })); // Adjust based on needs
```

---

### 12. Health Endpoint Exposes Server Time

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/app.ts` (Lines 12-17)

**Issue Description:**
The health endpoint exposes the exact server timestamp, which could aid timing-based attacks.

**Current Code:**
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});
```

**Recommended Fix:**
Remove timestamp or round it:
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

---

### 13. Frontend Error Handling Could Leak Information

**File:** `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/frontend/src/stores/auth.ts` (Line 35)

**Issue Description:**
Error messages from the server are displayed directly to users, which is fine for this case but could leak sensitive info if the server error messages change.

**Recommended Fix:**
Consider sanitizing or mapping error messages:
```typescript
const errorMessages: Record<string, string> = {
  'Invalid credentials': 'Invalid username or password',
  'Internal server error': 'An error occurred. Please try again.',
};

error: errorMessages[error.response?.data?.error] || 'Login failed',
```

---

## Positive Security Findings

The following security practices are implemented correctly:

1. **Parameterized Queries** - All database queries use parameterized queries (`$1`, `$2`), preventing SQL injection
2. **Bcrypt Password Hashing** - Passwords are hashed with bcrypt using 10 salt rounds
3. **JWT Verification** - Tokens are properly verified before granting access
4. **Role-Based Access Control** - Admin routes properly check for admin role
5. **Generic Error Messages** - Login failures don't reveal whether username or password was wrong
6. **Environment Variables** - Database URL and JWT secret use environment variables (though .env is committed)
7. **Type Safety** - TypeScript provides compile-time type checking

---

## Recommendations Summary

### Immediate Actions (Before Production)

1. **CRITICAL:** Remove `.env` from git and rotate JWT secret
2. **CRITICAL:** Configure CORS with specific allowed origins
3. **CRITICAL:** Implement rate limiting on auth endpoints
4. **HIGH:** Reduce JWT expiration time
5. **HIGH:** Add input validation with Zod/Joi
6. **HIGH:** Remove default credentials from UI

### Short-term Improvements

7. Add security headers with Helmet
8. Implement security logging
9. Add HTTPS enforcement
10. Set request size limits

### Long-term Considerations

11. Consider httpOnly cookies instead of localStorage for tokens
12. Implement refresh token mechanism
13. Add audit logging for all admin actions
14. Implement account lockout after failed attempts
15. Add 2FA for admin accounts

---

## Appendix: Files Reviewed

### Backend
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/middleware/auth.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/middleware/admin.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/routes/auth.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/routes/admin/index.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/routes/index.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/config/database.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/utils/password.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/app.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/src/types/express.d.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/.env`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend/.env.example`

### Frontend
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/frontend/src/stores/auth.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/frontend/src/utils/axios.ts`
- `/Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/frontend/src/pages/Login/index.tsx`

---

*Report generated by Claude Code Security Review*
