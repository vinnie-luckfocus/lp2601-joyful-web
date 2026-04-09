---
name: 03-user-authentication
status: backlog
created: 2026-04-09T03:16:18Z
updated: 2026-04-09T04:00:00Z
progress: 0%
prd: .claude/prds/03-user-authentication.md
github: [Will be updated when synced to GitHub]
---

# Epic: 03-user-authentication

## Overview

Implement a JWT-based user authentication system for the Joyful league website. This epic covers admin-assigned account login, session management via JWT tokens, and a first-login forced password change flow. The UI follows the MLB-style design system with a polished modal-based login experience.

## Architecture Decisions

- **JWT over sessions**: Stateless auth scales simply and works well with the React + Express split. Tokens expire after 7 days.
- **bcrypt for passwords**: Industry standard, available in Node.js ecosystem, configurable cost factor.
- **Zustand for auth state**: Lightweight, no provider boilerplate, persists token in `localStorage` for session continuity.
- **Modal-based login**: Keeps user context on the current page (especially the homepage dashboard), reducing navigation friction.
- **Route-level protection**: A simple React Router guard component checks auth state and prompts login when accessing protected routes.

## Multi-Dimensional Audit

> **Scope**: This epic has **NOT** been developed through the CCPM workflow yet. The following audit compares the current codebase against the PRD (`.claude/prds/03-user-authentication.md`) to establish a reliable implementation baseline.

---

### 1. Architecture / PRD Alignment

| PRD Requirement | Current State | Gap |
|-----------------|---------------|-----|
| Login **modal** from homepage | `frontend/src/pages/Login/index.tsx` is a **full page** at `/login` | UI pattern mismatch; PRD says modal |
| JWT expires after **7 days** | `backend/src/middleware/auth.ts:12` uses `expiresIn: '2h'` | **CRITICAL**: Expiry contradicts PRD and epic decision |
| First-login **forced password change** | **Completely missing** | No DB field, no API, no UI |
| `POST /api/auth/change-password` | **Missing** | Required for first-login flow |
| Login response `{ token, user: { id, name, team_id, role } }` | `backend/src/routes/auth.ts:69-76` returns `{ id, name, role }` | Missing `team_id` |
| `GET /api/auth/me` response | `backend/src/routes/auth.ts:110-118` returns full profile | Matches PRD |
| Auth state management (Zustand) | `frontend/src/stores/auth.ts` has `login/logout/checkAuth` | Missing `changePassword` and `is_first_login` handling |
| Logout functionality | backend + frontend exist | Matches PRD |
| Route protection | `frontend/src/components/ProtectedRoute/index.tsx` exists | Has UX bug (see Security section) |
| Navbar auth integration | `Navbar` has props (`isLoggedIn`, `userName`, `onLoginClick`) but `HomePage` does **not** wire them to `useAuthStore` | Navbar always shows "登录" even if user is authenticated |
| Admin Header auth integration | `frontend/src/components/Layout/Header.tsx` uses `useAuthStore` for logout | Works correctly |

**Verdict**: ~55% aligned. The core backend scaffold and frontend state exist, but the first-login flow (a P0 requirement) is entirely absent, and the JWT expiry is wrong.

---

### 2. Security Audit

| Item | Status | Evidence | Risk |
|------|--------|----------|------|
| Password hashing | ✅ Pass | `backend/src/utils/password.ts` uses `bcryptjs` with salt rounds 10 | — |
| Login rate limiting | ✅ Pass | `backend/src/routes/auth.ts:11-18` limits to 5 attempts / 15 min | — |
| JWT expiry mismatch | ❌ **CRITICAL** | `backend/src/middleware/auth.ts:12` → `2h` vs PRD `7d` | Users logged out unexpectedly; violates requirements |
| `change-password` endpoint | ❌ Missing | No endpoint means first-login security flow cannot be enforced | Account security compromised for admin-assigned passwords |
| Seed script leaks credentials | ⚠️ High | `database/seeds/seed.js:333-338` prints plaintext `admin123` and player passwords to stdout | Credential exposure in CI/build logs |
| Security headers | ⚠️ Medium | `backend/src/app.ts` has no `helmet` | Missing CSP, X-Frame-Options, etc. |
| ProtectedRoute flash-of-login | ⚠️ Medium | `ProtectedRoute` redirects before `checkAuth()` resolves | Brief exposure of redirect; poor UX at auth boundary |
| Axios 401 redirect loop | ⚠️ Medium | `frontend/src/utils/axios.ts:22` sets `window.location.href = '/login'` unconditionally on 401 | If `/login` itself triggers 401, causes hard reload loop |
| CORS allows no wildcard validation | ⚠️ Low | `backend/src/app.ts:8-21` reads `ALLOWED_ORIGINS` without rejecting `*` | Misconfiguration risk |
| Hardcoded JWT secret in `.env` | ⚠️ Low | `backend/.env` contains a committed concrete secret | Rotation recommended before production |
| Input validation | ✅ Pass | `backend/src/routes/auth.ts:21-24` uses Zod for username/password | — |

---

### 3. Code Quality Audit

| Item | Status | Evidence | Recommendation |
|------|--------|----------|----------------|
| Tests mock the database | ⚠️ Warning | `backend/src/__tests__/routes/auth.test.ts:11-16` mocks `pool.query` entirely | Per project rules, integration tests should hit real DB when possible; at minimum add a real-DB auth integration test |
| Mutable test fixture | ⚠️ Warning | `backend/src/__tests__/routes/auth.test.ts:35` mutates `mockUser.password_hash` in `beforeAll` | Violates immutability rule; use spread or compute hash at declaration |
| Console logs in production | ⚠️ Warning | `backend/src/routes/auth.ts:78,120`, `frontend/src/stores/auth.ts:61`, `frontend/src/pages/Login/index.tsx:32` | Remove or replace with proper logger per `CLAUDE.md` |
| Missing `/me` happy-path test | ⚠️ Warning | `backend/src/__tests__/routes/auth.test.ts:131-144` only tests 401 cases | Add valid-token test for `/me` |
| Password max length > bcrypt limit | ⚠️ Info | `backend/src/routes/auth.ts:23` uses `.max(128)`; bcrypt truncates at 72 bytes | Document or reduce max to 72 |
| Type safety | ✅ Pass | TypeScript interfaces are clean; no significant `any` abuse | — |
| File size | ✅ Pass | Auth files are small and focused (< 200 lines) | — |

---

### 4. UI/UX Audit vs PRD

| PRD Spec | Current State | Gap |
|----------|---------------|-----|
| Modal overlay `rgba(4, 30, 66, 0.7)` | Login is a standalone page with gray background | No modal, no overlay |
| Red login button `#BF0D3E` → `#A00B34` | Button uses `bg-mlb-navy` | Color scheme mismatch |
| Input focus border `#E2E8F0` → `#BF0D3E` | Focus ring uses `focus:ring-mlb-navy` | No red accent transitions |
| Slide-in + fade animation (200ms) | No animations on login page | Missing modal open/close animations |
| Shake-on-error | No shake animation | Error only shows a red text box |
| Logo height 48px centered | Trophy icon inside 64px navy circle | Size and styling differ from spec |

---

## Implementation Strategy

1. **Database**: Add `is_first_login` boolean to `users` table via migration; update seed script to set `is_first_login = true` for seeded users and remove plaintext password logs.
2. **Backend Auth APIs**:
   - Fix JWT expiry to `7d` in `middleware/auth.ts`.
   - Update `/login` response to include `team_id` and `is_first_login`.
   - Implement `POST /api/auth/change-password` with Zod validation and bcrypt.
3. **Frontend State**: Extend `useAuthStore` with `changePassword` action and `is_first_login` awareness.
4. **Login UI**:
   - Decide: refactor `/login` into a modal triggered from homepage, OR keep `/login` as deep-link fallback and add modal overlay on homepage.
   - Implement MLB red styling, focus transitions, and error shake animation.
   - Add inline first-login password change form (or `ChangePasswordModal`).
5. **Route Guards**:
   - Add `isLoading` guard to `ProtectedRoute` to prevent flash-of-login.
   - Add pathname guard to axios 401 interceptor.
6. **Header Integration**: Wire `Navbar` props (`isLoggedIn`, `userName`) to `useAuthStore` in `HomePage`.
7. **Tests**:
   - Add backend integration test for `/me` happy path and `/change-password`.
   - Add frontend tests for `ProtectedRoute` loading state and first-login UI.
   - Add E2E test for login → password change → access protected route flow.

## Task Breakdown

- [ ] Database: Create migration `002_add_is_first_login.sql`; update `seed.js`
- [ ] Backend: Fix JWT expiry (`7d`)
- [ ] Backend: Update `/login` response to include `team_id`
- [ ] Backend: Implement `POST /api/auth/change-password`
- [ ] Frontend State: Add `changePassword` and `is_first_login` to `useAuthStore`
- [ ] Frontend UI: Implement MLB-style login modal + first-login password change
- [ ] Frontend Routing: Fix `ProtectedRoute` loading flash and axios 401 loop
- [ ] Frontend Integration: Wire `Navbar` to `useAuthStore` in `HomePage`
- [ ] Tests: Backend auth integration coverage
- [ ] Tests: Frontend auth component + E2E coverage

## Dependencies

- `users` table schema must exist (admin data entry PRD)
- `jsonwebtoken` and `bcrypt` packages in backend
- Existing React Router and Zustand setup in frontend

## Success Criteria (Technical)

- Login API responds in < 500ms under normal load
- JWT tokens expire after 7 days and are validated on every protected request
- Passwords are bcrypt-hashed; plaintext is never stored or logged
- 100% of protected routes block unauthenticated access
- First-login password change is enforced before protected access
- E2E tests pass for login, failed login, and forced password-change flows

## Estimated Effort

- **Timeline**: 2–3 days for a single developer
- **Critical path**: Backend auth APIs → frontend state → login UI/animation → route guards → tests
