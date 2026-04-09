---
issue: 36
title: Implement protected game list and detail endpoints
analyzed: 2026-04-09T12:48:00Z
estimated_hours: 4
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #36

## Overview

Create authenticated endpoints for game schedule: `GET /api/games` (list all games with current user's attendance status) and `GET /api/games/:id` (detail view with user's status). These are protected routes requiring JWT auth.

## Parallel Streams

### Stream A: Protected Game Endpoints
**Scope**: Create `backend/src/routes/games.ts`, create `backend/src/services/games.ts`, register in app router, add integration tests
**Files**:
- `backend/src/routes/games.ts` (new)
- `backend/src/services/games.ts` (new)
- `backend/src/app.ts` (register route)
- `tests/backend/routes/games.test.ts` (new)
**Agent Type**: backend-specialist
**Can Start**: immediately
**Estimated Hours**: 4
**Dependencies**: none

## Coordination Points

### Shared Files
- `backend/src/app.ts` - register new router (coordinate with Issue #38 which also registers routes)

### Sequential Requirements
1. Write tests first (TDD)
2. Create service with `getGames(userId)` and `getGameById(gameId, userId)`
3. Create route with auth middleware
4. Register in app.ts
5. Run tests

## Conflict Risk Assessment
- **Medium Risk**: `backend/src/app.ts` may be modified by Issue #38. However, since this issue CREATES the `games.ts` routes file and #38 only registers it, the actual file creation vs route registration can be handled by #38 doing the wire-up if needed.

## Parallelization Strategy

**Recommended Approach**: sequential (single stream)

## Expected Timeline

- Wall time: 4 hours
- Total work: 4 hours

## Notes

- `my_status` should be derived by LEFT JOINing `game_attendance` on `user_id = current user`.
- If no attendance record exists, return `null` for `my_status`.
- Use `verifyToken` middleware from `backend/src/middleware/auth.ts`.
- Validate `gameId` parameter using Zod (must be numeric string or positive integer).
- Return standard API envelope on all responses.
