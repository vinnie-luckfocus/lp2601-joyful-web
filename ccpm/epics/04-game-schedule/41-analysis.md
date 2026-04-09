---
issue: 41
title: Refactor GameCard and build ScheduleGameCard
analyzed: 2026-04-09T13:03:00Z
estimated_hours: 5
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #41

## Overview

Refactor the existing `GameCard` component into smaller reusable sub-components (`GameCardTeams`, `GameCardMeta`, `GameCardFooter`) so both the homepage `RecentGames` and the new schedule page can share presentation logic. Then build `ScheduleGameCard` that composes these sub-components and adds attendance-specific features.

## Parallel Streams

### Stream A: GameCard Refactor & ScheduleGameCard
**Scope**: Refactor `GameCard.tsx`, create sub-components, build `ScheduleGameCard`, update exports, ensure no homepage regression
**Files**:
- `frontend/src/components/games/GameCard.tsx`
- `frontend/src/components/games/GameCardTeams.tsx` (new)
- `frontend/src/components/games/GameCardMeta.tsx` (new)
- `frontend/src/components/games/GameCardFooter.tsx` (new)
- `frontend/src/components/games/ScheduleGameCard.tsx` (new)
- `frontend/src/components/games/index.ts`
- `frontend/src/components/games/__tests__/GameCard.test.tsx` (update if exists)
**Agent Type**: frontend-specialist
**Can Start**: immediately
**Estimated Hours**: 5
**Dependencies**: none

## Coordination Points

### Shared Files
- `frontend/src/components/games/index.ts` - add new exports
- `frontend/src/components/games/GameCard.tsx` - refactor without breaking existing props/API

### Sequential Requirements
1. Extract sub-components from GameCard
2. Refactor GameCard to use sub-components
3. Build ScheduleGameCard composing sub-components
4. Verify homepage GameCard renders identically
5. Run frontend tests

## Conflict Risk Assessment
- **Low Risk**: frontend-only, well-scoped file changes

## Parallelization Strategy

**Recommended Approach**: sequential (single stream)

## Expected Timeline

- Wall time: 5 hours
- Total work: 5 hours

## Notes

- `GameCard` must keep the same `GameCardProps` interface and visual output for homepage compatibility.
- `ScheduleGameCard` should accept additional props for `myStatus`, `confirmedCount`, etc.
- MLB Red = `#BF0D3E`, Card background = `#FFFFFF`.
- Use Tailwind CSS for styling, consistent with existing codebase.
