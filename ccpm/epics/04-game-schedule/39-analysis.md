---
issue: 39
title: Build frontend hooks and GameSchedulePage
analyzed: 2026-04-09T13:07:00Z
estimated_hours: 6
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #39

## Overview

Create frontend hooks for fetching game schedule and managing attendance state, then build the `GameSchedulePage` component with MLB-style timeline layout, month filtering, and stagger animations.

## Parallel Streams

### Stream A: Hooks & Schedule Page
**Scope**: Create `useGames.ts`, `useAttendance.ts`, `GameSchedulePage.tsx`, register `/schedule` route
**Files**:
- `frontend/src/hooks/useGames.ts` (new)
- `frontend/src/hooks/useAttendance.ts` (new)
- `frontend/src/pages/GameSchedulePage.tsx` (new)
- `frontend/src/routes.tsx` (add `/schedule` route)
- `frontend/src/hooks/index.ts` (update exports if exists)
**Agent Type**: frontend-specialist
**Can Start**: immediately
**Estimated Hours**: 6
**Dependencies**: none

## Coordination Points

### Shared Files
- `frontend/src/routes.tsx` — add `/schedule` route (coordinate with Issue #44 which also modifies routes)

## Conflict Risk Assessment
- **Low Risk**: mostly new files, only minor route addition

## Parallelization Strategy

**Recommended Approach**: sequential (single stream)

## Expected Timeline

- Wall time: 6 hours
- Total work: 6 hours

## Notes

- `useGames()` should fetch from `/api/public/games` or `/api/games` depending on auth status. For simplicity, use the public endpoint since the schedule page displays all games.
- `useAttendance(gameId)` should manage optimistic updates for the attend/decline mutation using the existing axios util.
- `GameSchedulePage` should use `ScheduleGameCard` from Issue #41.
- Month filter is client-side: extract months from fetched games, show left/right arrows.
- Stagger animation: framer-motion `staggerChildren` with 0.05s delay.
- Skeleton loader uses `#041E42` tone.
- Page background `#F5F7FA`.
