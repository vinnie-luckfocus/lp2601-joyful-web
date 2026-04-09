---
name: 04-game-schedule
status: backlog
created: 2026-04-09T09:09:32Z
progress: 0%
prd: .claude/prds/04-game-schedule.md
github: [Will be updated when synced to GitHub]
updated: 2026-04-09T09:30:00Z
---

# Epic: Game Schedule

## Overview

Build a game schedule management system that displays all season games publicly and allows authenticated players to sign up for matches with real-time attendance tracking. The implementation leverages the existing authentication system (Epic 03), public API patterns, and UI components like `GameCard` and `Skeleton` to minimize net-new code.

## Architecture Decisions

- **Reuse existing auth middleware** — JWT-based `authMiddleware` already protects routes; reuse it for attendance endpoints.
- **Extend existing public API** — `backend/src/routes/public.ts` and `backend/src/services/publicApi.ts` already serve homepage data; extend them rather than creating new services.
- **Refactor `GameCard` into shared sub-components** — The existing `GameCard` is homepage-optimized. Extract `GameCardTeams`, `GameCardMeta`, and `GameCardFooter` so both homepage and schedule views can share internals without bloating the component.
- **PostgreSQL with simple schema** — Two tables: `games` (match info) and `game_attendance` (player signup status), avoiding unnecessary complexity.
- **Optimistic UI for attendance** — Clicking attend/decline updates local state immediately for the acting user while syncing in the background. Other users see updates on next page load (acceptable for MVP; no WebSockets required).
- **Atomic attendance writes** — Wrap signup validation (including 2-hour cutoff) and the UPSERT in a single database transaction to eliminate race conditions.
- **Rate limiting on state-mutating endpoints** — Apply `express-rate-limit` to `POST /api/games/:id/attend` (e.g., 10 req/min per user) per project security guidelines.

## Technical Approach

### Frontend Components

- **`GameSchedulePage`** — Main schedule view with month filter and timeline layout (left time, right card). On month switch, cards animate with a 50ms stagger slide-in.
- **`GameDetailPage`** — Single match view showing full info, attendance list split into "已确认" / "未回复" / "不参加" sections, and action buttons with checkmark pop + subtle shake on success.
- **`ScheduleGameCard`** — Timeline-optimized wrapper that composes `GameCard` sub-components. Adds signup status badge, attendee count, and a 4px MLB Red (`#BF0D3E`) left border when the current user is confirmed.
- **`AttendanceButtons`** — Reusable component for "参加" / "不参加". Uses Tailwind `active:scale-95` for scale feedback and triggers a green checkmark pop animation on successful signup.
- **`AttendeeList`** — Horizontal avatar row with `+N` overflow. Falls back to initials if `avatar_url` is missing.
- **Month filter** — Simple state-driven filter on the already-fetched full list (no extra API call per month).
- **Custom hooks** — `useGames()` for fetching and caching schedule data; `useAttendance(gameId)` for managing optimistic local state and mutations.

### Backend Services

- **Extend `public.ts` route** — Add `GET /api/public/games` returning the full season schedule (not limited to 10) with standard response envelope.
- **Add `games.ts` route** — Protected routes:
  - `GET /api/games` → full schedule + `my_status` per game
  - `GET /api/games/:id` → match details + attendance + `my_status`
- **Add `attendance.ts` route** —
  - `POST /api/games/:id/attend` with rate limiting
  - `GET /api/games/:id/attendance`
- **Zod validation** — Validate `status` enum (`confirmed` | `declined`) on attendance requests.
- **SQL queries** — Parameterized queries via existing `pg.Pool` in `backend/src/config/database.ts`.
- **Standard API envelope** — All endpoints return `{ success, data, error, meta }` per repository-pattern guidelines.

### Infrastructure

- No new infrastructure needed. Runs on existing Vite + Express + PostgreSQL stack.
- Add lightweight DB indexes on `games.scheduled_at` and `game_attendance(game_id, user_id)` for <1s list load.
- Add `Cache-Control: public, max-age=60` to `GET /api/public/games` to reduce read load.

## Implementation Strategy

1. **Schema first** — Create migrations and seed data; test rollback.
2. **Public API next** — Extend `public.ts` with full schedule endpoint + tests.
3. **Protected API next** — Build `games.ts` and `attendance.ts` routes with TDD (tests first).
4. **Hooks and components** — Build `useGames`, `useAttendance`, and page components.
5. **Polish and E2E** — Add MLB-style animations, skeletons, and critical-path E2E tests.

## Task Breakdown Preview

- [ ] **Task 1:** Create `games` and `game_attendance` database tables with seed data and migration rollback tests.
- [ ] **Task 2:** Extend public API (`GET /api/public/games`) with tests and `Cache-Control` headers.
- [ ] **Task 3:** Implement protected game list/detail endpoints (`GET /api/games`, `GET /api/games/:id`) with tests.
- [ ] **Task 4:** Implement attendance API (`POST /api/games/:id/attend`, `GET /api/games/:id/attendance`) with 2-hour cutoff validation, rate limiting, and atomic transactions. Include tests.
- [ ] **Task 5:** Register new routes (`/api/games`, `/api/games/:id/attend`) in `backend/src/app.ts` or equivalent router index.
- [ ] **Task 6:** Build frontend hooks (`useGames`, `useAttendance`) and `GameSchedulePage` with month filter and 50ms stagger card animations.
- [ ] **Task 7:** Build `GameDetailPage` with confirmed/pending/declined sections, `AttendeeList`, `AttendanceButtons`, and checkmark pop + shake feedback.
- [ ] **Task 8:** Refactor `GameCard` into shared sub-components and build `ScheduleGameCard` with signup badge, attendee count, and MLB Red highlight border.
- [ ] **Task 9:** Write frontend unit/component tests for hooks, `ScheduleGameCard`, `AttendanceButtons`, month filter, and optimistic UI rollback.
- [ ] **Task 10:** Write E2E tests for viewing schedule, filtering by month, clicking a game, signing up, and verifying attendee count updates.

## Dependencies

- **Epic 03 (User Authentication)** — Completed; required for authenticated attendance endpoints.
- **Existing `GameCard` / `RecentGames` components** — Reuse and extend via sub-component extraction.
- **Existing public API service** — Extend rather than rebuild.
- **`games` and `game_attendance` tables** — Created in Task 1.

## Success Criteria (Technical)

- Schedule list page loads in < 1 second for 50 games.
- Attendance API handles 10 concurrent signups without race conditions via atomic transaction + `INSERT ... ON CONFLICT UPDATE`.
- All user inputs validated with Zod; no raw SQL concatenation.
- Rate limiting active on `POST /api/games/:id/attend`.
- 80%+ test coverage for new backend routes and frontend components.
- E2E tests cover: view schedule → filter month → click game → sign up → verify attendee count updates.

## Estimated Effort

- **Timeline:** 5–7 days
- **Critical path:** Database schema → protected API (games + attendance) → hooks and pages → E2E tests
- **Resource needs:** 1 full-stack developer; no new infrastructure required.
