---
issue: 37
title: Implement attendance API with cutoff and concurrency safety
analyzed: 2026-04-09T12:48:00Z
estimated_hours: 6
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #37

## Overview

Build attendance signup and listing endpoints with robust validation, 2-hour cutoff enforcement, atomic transactions to prevent race conditions, and rate limiting.

## Parallel Streams

### Stream A: Attendance API
**Scope**: Add attendance endpoints to `games.ts` routes, add attendance service methods, add tests for cutoff, concurrency, and rate limiting
**Files**:
- `backend/src/routes/games.ts` (extend with POST /:id/attend and GET /:id/attendance)
- `backend/src/services/games.ts` (add attendance methods)
- `tests/backend/routes/games.test.ts` (extend tests)
**Agent Type**: backend-specialist
**Can Start**: after Issue #36 completes (modifies same files)
**Estimated Hours**: 6
**Dependencies**: Issue #36

## Coordination Points

### Shared Files
- `backend/src/routes/games.ts` - Issue #36 creates this file; #37 extends it
- `backend/src/services/games.ts` - Issue #36 creates this file; #37 extends it
- `tests/backend/routes/games.test.ts` - shared tests

### Sequential Requirements
1. Wait for Issue #36 to complete (creates base games.ts)
2. Write attendance tests
3. Implement attendance service with atomic transactions
4. Add rate limiting middleware
5. Wire endpoints into games.ts
6. Run tests including concurrency simulation

## Conflict Risk Assessment
- **High Risk** without coordination: same files as #36. Must wait for #36 to complete before starting.

## Parallelization Strategy

**Recommended Approach**: sequential after #36

## Expected Timeline

- Wall time: 6 hours
- Total work: 6 hours

## Notes

- Use `BEGIN; SELECT scheduled_at FROM games WHERE id = $1 FOR UPDATE; ... COMMIT;` pattern.
- Rate limiter: express-rate-limit keyed by `req.user.userId`, max 10 req/min.
- `pending` users = all authenticated users minus confirmed/declined.
- Reject signups within 2 hours of game start with safe error message.
