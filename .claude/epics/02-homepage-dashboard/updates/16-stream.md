---
stream: Game Cards Component
issue: 16
agent: senior-frontend
started: 2026-04-08T15:30:00Z
status: completed
---

# Issue #16: 赛程卡片组件 (Game Cards Component)

## Completed Tasks

### 1. Created usePublicGames Hook
- **File**: `src/hooks/usePublicGames.ts`
- **Coverage**: 100%
- **Features**:
  - Fetches games from `/api/public/games?limit=4`
  - Returns games, isLoading, error, refetch, lastUpdated
  - Proper TypeScript types for Game interface
  - Error handling with meaningful messages

### 2. Created GameCard Component
- **File**: `src/components/games/GameCard.tsx`
- **Coverage**: 89.47%
- **Features**:
  - White background with rounded-xl (12px) border #E2E8F0
  - Displays game time, venue, home/away teams
  - Shows game status with color-coded badges
  - Displays scores when available
  - Framer Motion hover animation
  - Helper functions exported for testing

### 3. Created GameGrid Component
- **File**: `src/components/games/GameGrid.tsx`
- **Coverage**: 100%
- **Features**:
  - Responsive grid: 3 columns desktop, 1 column mobile, gap-6
  - Stagger animation using Framer Motion (100ms between cards)
  - Data freshness indicator using #13 component
  - Error state using #13 ErrorState component
  - Loading state with skeleton cards
  - Empty state with CalendarX icon
  - "查看更多" link with "coming soon" tooltip for unimplemented routes

### 4. Created Tests
- **Hook Tests**: `src/__tests__/hooks/usePublicGames.test.ts` (8 tests)
- **GameCard Tests**: `src/__tests__/components/games/GameCard.test.tsx` (12 tests)
- **GameGrid Tests**: `src/__tests__/components/games/GameGrid.test.tsx` (15 tests)

### 5. Updated Test Setup
- Added framer-motion mock to `src/__tests__/setup.ts`
- Mock includes motion.div, motion.button, motion.span, motion.a
- Added hooks mocks: useSpring, useTransform, useMotionValue, animate

## Files Created

```
frontend/src/
├── hooks/
│   └── usePublicGames.ts
├── components/games/
│   ├── index.ts
│   ├── GameCard.tsx
│   └── GameGrid.tsx
└── __tests__/
    ├── hooks/
    │   └── usePublicGames.test.ts
    └── components/games/
        ├── GameCard.test.tsx
        └── GameGrid.test.tsx
```

## Test Results

All 35 tests passing:
- usePublicGames: 8 tests
- GameCard: 12 tests
- GameGrid: 15 tests

## Coverage Summary

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| usePublicGames.ts | 100% | 100% | 100% | 100% |
| GameCard.tsx | 89.47% | 86.66% | 100% | 89.47% |
| GameGrid.tsx | 100% | 91.66% | 100% | 100% |

## Notes

- Reused existing components from Issue #13 (DataFreshnessIndicator, ErrorState, Skeleton)
- Used Framer Motion for stagger animations
- "查看更多" link shows tooltip for unimplemented routes
- All acceptance criteria met
