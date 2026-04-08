# Issue #5 Analysis: JWT Authentication Middleware

## Overview
Implement JWT authentication system with token generation, verification middleware, and auth endpoints.

## Work Streams

### Stream A: JWT Auth Implementation (Single Stream)
**Files to Create:**
- `backend/src/middleware/auth.ts` - JWT verification and generation
- `backend/src/routes/auth.ts` - Auth endpoints (login, logout, me)
- `backend/src/types/express.d.ts` - TypeScript types for req.user
- `backend/src/utils/password.ts` - Password hashing utilities

**Implementation Details:**
1. JWT Configuration:
   - Secret: process.env.JWT_SECRET
   - Expires: '7d'
   - Algorithm: HS256

2. Auth Middleware (`verifyToken`):
   - Extract token from Authorization header (Bearer token)
   - Verify with jwt.verify()
   - Attach decoded user to req.user
   - Return 401 if missing or invalid

3. Token Generation (`generateToken`):
   - Input: userId, role
   - Output: JWT string
   - Include: userId, role, iat, exp

4. Endpoints:
   - POST `/api/auth/login` - { username, password } → { token, user }
   - POST `/api/auth/logout` - Requires token → { success: true }
   - GET `/api/auth/me` - Requires token → { user }

5. Password Hashing:
   - Use bcryptjs
   - Salt rounds: 10
   - Compare function for login

**Parallel Streams:** 1

## Dependencies
- Issue #2 (Database Schema) - COMPLETED ✓
- Issue #3 (Seed Data) - COMPLETED ✓
- Issue #4 (Express Setup) - COMPLETED ✓

## Risks
- JWT secret management
- Token expiration edge cases
- Password comparison performance

## Definition of Done
- [ ] Login returns valid JWT
- [ ] Token verification middleware works
- [ ] Protected routes require authentication
- [ ] Token expires correctly
- [ ] Passwords use bcrypt
