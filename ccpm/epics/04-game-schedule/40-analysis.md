---
issue: 40
title: Build GameDetailPage with attendance sections and animations
analyzed: 2026-04-09T13:07:00Z
estimated_hours: 6
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #40

## Overview

Build the `GameDetailPage` component that displays full game info, attendance lists split by status, and action buttons with MLB-style feedback animations and optimistic UI.

## Parallel Streams

### Stream A: Game Detail Page
**Scope**: Create `GameDetailPage.tsx`, `AttendanceButtons.tsx`, register `/games/:id` route
**Files**:
- `frontend/src/pages/GameDetailPage.tsx` (new)
- `frontend/src/components/games/AttendanceButtons.tsx` (new)
- `frontend/src/routes.tsx` (add `/games/:id` route)
**Agent Type**: frontend-specialist
**Can Start**: after Issue #39 completes (depends on `useAttendance` hook)
**Estimated Hours**: 6
**Dependencies**: Issue #39

## Coordination Points

### Shared Files
- `frontend/src/routes.tsx` — add `/games/:id` route
- `frontend/src/hooks/useAttendance.ts` — created by Issue #39

## Conflict Risk Assessment
- **Low Risk**: mostly new files

## Parallelization Strategy

**Recommended Approach**: sequential after #39

## Expected Timeline

- Wall time: 6 hours
- Total work: 6 hours

## Notes

- Use `useAttendance` hook from Issue #39 for optimistic updates.
- Use `useParams` from react-router for `:id`.
- Avatars: show user initials as fallback (use a helper to get initials from `name`).
- `+N` overflow when avatars exceed 5 per row.
- Green checkmark pop animation on successful signup.
- Error handling: revert optimistic update and show alert/toast.
