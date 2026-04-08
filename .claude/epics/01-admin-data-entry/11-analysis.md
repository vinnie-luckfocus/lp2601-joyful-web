# Issue #11 Analysis: Frontend-Backend Integration

## Overview
Connect frontend to backend, implement end-to-end data flow, verify seed data displays correctly.

## Work Streams

### Stream A: Integration (Single Stream)
**Files to Create/Update:**
- `frontend/src/utils/axios.ts` - Axios instance with interceptors
- `frontend/src/stores/auth.ts` - Zustand auth store
- `frontend/src/pages/Login/index.tsx` - Login page
- `frontend/src/components/ProtectedRoute/index.tsx` - Route guard
- `frontend/src/routes.tsx` - Add protected routes
- Update `frontend/src/components/Layout/Header.tsx` - Connect logout

**Implementation Details:**
1. Axios configuration:
   - Base URL from env (VITE_API_URL)
   - Request interceptor: add Authorization header with token
   - Response interceptor: handle 401 (redirect to login)

2. Auth store (Zustand):
   ```typescript
   interface AuthState {
     user: User | null;
     isAuthenticated: boolean;
     login: (username, password) => Promise<void>;
     logout: () => void;
   }
   ```
   - Persist token in localStorage
   - Login calls POST /api/auth/login
   - Logout clears token and state

3. Login page:
   - Username/password form
   - Call authStore.login
   - Redirect to /admin on success
   - Show error on failure

4. ProtectedRoute:
   - Check isAuthenticated
   - Redirect to /login if not
   - Render children if authenticated

5. Header updates:
   - Show user name from auth store
   - Logout button calls authStore.logout

**Parallel Streams:** 1

## Dependencies
- All previous issues COMPLETED ✓

## Definition of Done
- [ ] Login form submits to backend
- [ ] JWT stored in localStorage
- [ ] Requests include Authorization header
- [ ] Protected routes require auth
- [ ] Token expiry redirects to login
- [ ] Logout clears token
- [ ] Admin routes show seed data
