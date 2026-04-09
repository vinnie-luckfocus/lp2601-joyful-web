---
name: tactics-board
status: backlog
created: 2026-04-09T22:15:40Z
updated: 2026-04-09T22:27:03Z
progress: 0%
prd: ccpm/prds/06-tactics-board.md
github: https://github.com/vinnie-luckfocus/lp2601-joyful-web/issues/49
---

# Epic: Tactics Board

## Overview

Implement the Tactics Board feature that displays batting order, defensive positions, and tactical notes for an upcoming game. The feature provides a visual baseball field diagram with interactive position markers, ensuring every player knows their role before the match.

Key capabilities:
- Display 1-9 batting order with name, jersey number, and defensive position
- Visual baseball field diagram with interactive position markers
- Tactical notes, signals, and defensive strategy display
- Highlight the current logged-in user's row and position
- Responsive layout: side-by-side on desktop, stacked on mobile

## Architecture Decisions

- **Field diagram**: SVG-based custom component over Canvas or image map. SVG enables responsive scaling, accessibility, and easy click interactions without external dependencies.
- **Animation**: CSS transitions and keyframes with a lightweight orchestration hook. Keeps bundle size small and avoids importing a full animation library.
- **Data shape**: Reuse the existing `games` and `users` tables. Store tactics as a JSONB column on `games` or a dedicated `game_tactics` table to keep reads simple.
- **Auth integration**: Leverage existing JWT middleware; no new auth mechanism needed.

## Technical Approach

### Frontend
- New route: `/games/:id/tactics`
- Components:
  - `LineupList` — scrollable batting order list with current-user highlight
  - `FieldDiagram` — SVG baseball diamond with 9 position markers
  - `PositionMarker` — clickable marker with hover state and tooltip
  - `TacticsPanel` — collapsible cards for general notes, signals, defense strategy
- Styling: Tailwind CSS using the MLB color palette specified in the PRD
- Animation: CSS `@keyframes` for staggered load and Framer Motion (or CSS-only) for micro-interactions

### Backend
- New endpoint: `GET /api/games/:id/lineup`
- Returns:
  - `game_id`
  - `lineup` array with `batting_order`, `user_id`, `name`, `position`, `jersey_number`
  - `tactics` object with `general_notes`, `signals`, `defense_strategy`
- Authorization: player must belong to the team associated with the game

### Infrastructure
- Database migration for `game_tactics` table (or `tactics_jsonb` on `games`)
- Seed data for at least one game with a complete lineup and tactics for local development and E2E tests

## Implementation Strategy

1. **Schema & API** — define the tactics data model and implement the `GET /api/games/:id/lineup` endpoint
2. **Field Diagram SVG** — build the responsive baseball field component with position markers
3. **Lineup UI** — implement the batting order list with current-user highlighting
4. **Tactics Panel** — build collapsible cards for notes, signals, and defensive strategy
5. **Integration** — wire frontend to backend, handle loading and error states
6. **Responsive Polish** — finalize mobile/desktop layout and animations
7. **Tests** — unit tests for components, integration tests for the endpoint, and E2E tests for the full view flow

## Task Breakdown Preview

| # | Task | Focus |
|---|------|-------|
| 1 | Database schema & migration | Backend |
| 2 | Seed data for lineup & tactics | Backend |
| 3 | `GET /api/games/:id/lineup` endpoint | Backend |
| 4 | `FieldDiagram` SVG component | Frontend |
| 5 | `LineupList` component with user highlight | Frontend |
| 6 | `TacticsPanel` component | Frontend |
| 7 | Tactics board page & routing | Frontend |
| 8 | Responsive layout & animations | Frontend |
| 9 | Integration & E2E tests | Testing |
| 10 | Code review & cleanup | Polish |

## Dependencies

- `games` table (existing)
- `users` table (existing)
- Team membership authorization (existing)
- Game schedule feature (to provide game context and links)

## Success Criteria

- 90% of players view the tactics board before a game (measured by analytics)
- Players can identify their batting order, position, and tactical role without confusion
- All tests pass with 80%+ coverage
- Feature is responsive and performant on mobile and desktop

## Tasks Created

| Task | Name | Parallel |
|------|------|----------|
| #76 | Database schema and migration for tactics board | true |
| #77 | Seed data for lineup and tactics | false |
| #78 | Backend API - GET /api/games/:id/lineup | false |
| #79 | SVG baseball field diagram component | true |
| #80 | Lineup list component with current-user highlight | true |
| #81 | Tactics panel component | true |
| #82 | Tactics board page and routing | false |
| #83 | Responsive layout and animations | false |
| #84 | Unit, integration, and E2E tests | false |

## Estimated Effort

3-4 days for one full-stack developer.
