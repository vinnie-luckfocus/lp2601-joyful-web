# Issue #6 Analysis: Admin Authorization Middleware

## Overview
Implement admin authorization middleware to protect admin-only routes.

## Work Streams

### Stream A: Admin Auth Middleware (Single Stream)
**Files to Create:**
- `backend/src/middleware/admin.ts` - Admin check middleware
- `backend/src/routes/admin/index.ts` - Protected admin routes

**Implementation Details:**
1. Admin middleware (`requireAdmin`):
   - Must run after `verifyToken` middleware
   - Check if req.user exists (401 if not authenticated)
   - Check if req.user.role === 'admin' (403 if not admin)
   - Call next() if admin

2. Admin routes:
   - Create `/api/admin/*` route group
   - Apply `verifyToken` then `requireAdmin` middleware
   - Add placeholder endpoints:
     - GET /api/admin/dashboard - Admin dashboard data
     - GET /api/admin/users - List all users

3. Database query:
   - Middleware can use req.user.role from JWT
   - No need to query DB on every request (role is in token)

**Parallel Streams:** 1

## Dependencies
- Issue #4 (Express) - COMPLETED ✓
- Issue #5 (JWT Auth) - COMPLETED ✓

## Risks
- Middleware order matters (auth before admin)
- Role must be correctly stored in JWT

## Definition of Done
- [ ] Admin middleware blocks non-admin users (403)
- [ ] Admin middleware blocks unauthenticated users (401)
- [ ] Admin routes are protected
- [ ] Admin users can access routes
