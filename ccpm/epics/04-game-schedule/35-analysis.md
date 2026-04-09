---
issue: 35
title: Extend public API for full schedule
analyzed: 2026-04-09T12:48:00Z
estimated_hours: 3
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #35

## Overview

Extend the existing public API to serve the full season game schedule via `GET /api/public/games`. The endpoint currently returns only upcoming/recent games limited to 4. We need to support returning ALL games with optional `?limit` parameter, proper response envelope, and cache headers.

## Parallel Streams

### Stream A: Public API Extension
**Scope**: Extend `publicApi.ts` service, update `public.ts` route, add integration tests
**Files**:
- `backend/src/services/publicApi.ts`
- `backend/src/routes/public.ts`
- `tests/backend/routes/public.test.ts` (create new)
**Agent Type**: backend-specialist
**Can Start**: immediately
**Estimated Hours**: 3
**Dependencies**: none

## Coordination Points

### Shared Files
- `backend/src/routes/public.ts` - modify `GET /api/public/games` handler
- `backend/src/services/publicApi.ts` - add `getAllGames(limit?: number)` function

### Sequential Requirements
1. Write tests first (TDD)
2. Implement service function
3. Update route to call new service
4. Run tests

## Conflict Risk Assessment
- **Low Risk**: Only touches public API files, no overlap with other active streams

## Parallelization Strategy

**Recommended Approach**: sequential (single stream)

## Expected Timeline

- Wall time: 3 hours
- Total work: 3 hours

## Notes

- The existing `/api/public/games` uses default limit of 4. Change to return ALL games when no limit is provided, while preserving backward compatibility for homepage usage via `?limit`.
- Cache header should be `Cache-Control: public, max-age=60`.
- Response envelope: `{ success, data, error, meta: { total_count } }`.
- Each game should include `home_team` and `away_team` objects (or names) as per acceptance criteria.
