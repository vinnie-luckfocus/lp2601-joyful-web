---
issue: 35
stream: Public API Extension
agent: backend-specialist
started: 2026-04-09T12:48:00Z
updated: 2026-04-09T12:55:06Z
status: completed
---

# Stream A: Public API Extension

## Scope
- Extend `backend/src/services/publicApi.ts` with `getAllGames(limit?: number)`
- Update `backend/src/routes/public.ts` `GET /api/public/games` to support optional `?limit` and return all games by default
- Create `tests/backend/routes/public.test.ts` with integration tests

## Progress
- Created integration tests at `tests/backend/routes/public.test.ts` (RED)
- Implemented `getAllGames(limit?: number)` in `backend/src/services/publicApi.ts`
- Updated `GET /api/public/games` route to return all games by default, support optional `limit`, set `Cache-Control: public, max-age=60`, and return `meta.total_count`
- Updated existing mocked unit tests in `backend/src/__tests__/routes/public.test.ts` to match new behavior
- Fixed test infrastructure (`tests/backend/tsconfig.json`, `tests/backend/jest.config.js`) to run integration tests correctly
- All public route tests passing (GREEN)
- Committed: `Issue #35: Extend public API for full schedule with tests`
