---
name: statistics
status: backlog
created: 2026-04-09T22:15:40Z
updated: 2026-04-09T22:21:07Z
progress: 0%
prd: ccpm/prds/07-statistics.md
github: https://github.com/vinnie-luckfocus/lp2601-joyful-web/issues/47
---

# Epic: Statistics

## Overview

Implement the statistics module for Joyful league: batting record data entry by admins and automatic personal stat visualization for players. This includes cumulative stats, trend charts, a radar chart, and a public leaderboard.

## Architecture Decisions

- Store batting records in a dedicated `batting_records` table linked to `games` and `users`.
- Compute cumulative stats on-demand via SQL aggregate queries to guarantee consistency after every insert/update.
- Derive recent game trends and milestones from the same records table without duplicating data.
- Use `recharts` on the frontend for trend lines and radar charts.
- Follow the existing MLB-style UI/UX palette and animation specs.

## Technical Approach

### Frontend
- Build admin batting-entry UI as a tabular, per-PA form inside the game detail page.
- Build the player stats page with a top profile header, responsive data cards grid, trend chart (line), radar chart, milestones strip, and a leaderboard section.
- Animate numbers, charts, and cards according to the motion spec.

### Backend
- `POST /api/games/:id/batting-records` — batch insert/update batting records with admin authorization.
- `GET /api/stats/me` — return profile, cumulative stats, last 5 game averages, and milestones.
- `GET /api/public/leaders` — return top-N leaderboard by category, publicly accessible.
- Add service-layer stat calculators that run aggregate queries and compute derived values (e.g., batting average = hits / at_bats).

### Infrastructure
- Add/confirm `batting_records` migration with fields: `id`, `game_id`, `user_id`, `batting_order`, `position`, `pa_result`, `inning`, `created_at`, `updated_at`.
- Add seed data for local testing and chart verification.

## Implementation Strategy

1. Define schema and migrations for `batting_records`.
2. Implement backend APIs and stat calculation utilities with tests.
3. Build the admin batting record entry UI and wire it to the API.
4. Build the player stats dashboard (cards, charts, milestones) and wire it to the API.
5. Build the public leaderboard UI.
6. Add animations and responsive polish.
7. Add E2E coverage for critical flows.

## Task Breakdown Preview

1. Database: `batting_records` migration and seed data
2. Backend: `POST /api/games/:id/batting-records` endpoint
3. Backend: `GET /api/stats/me` endpoint with stat calculators
4. Backend: `GET /api/public/leaders` leaderboard endpoint
5. Frontend: Admin batting record entry form/table
6. Frontend: Player stats page — profile header and cumulative cards
7. Frontend: Player stats page — trend chart and radar chart
8. Frontend: Player stats page — milestones and leaderboard
9. Frontend: Animations and responsive layouts
10. Testing: Backend + frontend unit tests and E2E tests

## Dependencies

- `batting_records` table migration (new)
- `games` and `users` tables (existing)
- User authentication and admin authorization middleware (existing)
- Recharts (frontend dependency)

## Success Criteria

- 90%+ of games have complete batting data entered.
- Stats calculations are 100% accurate (auditable via tests).
- Stats load in under 1 second.
- Charts are responsive and animate smoothly.

## Tasks Created

| Task | Name | Parallel |
| :--- | :--- | :--- |
| #51 | Database Schema and Migrations for batting_records | true |
| #58 | Backend API — POST /api/games/:id/batting-records | false |
| #50 | Backend API — GET /api/stats/me | false |
| #59 | Backend API — GET /api/public/leaders | false |
| #56 | Frontend — Admin Batting Record Entry Form | false |
| #52 | Frontend — Player Stats Dashboard (Profile + Cumulative Cards) | false |
| #55 | Frontend — Player Stats Charts (Trend + Radar) | true |
| #57 | Frontend — Milestones and Leaderboard Section | true |
| #53 | Frontend — Animations and Responsive Polish | false |
| #54 | Testing — Unit, Integration, and E2E Coverage | false |

Total tasks: 10
Parallel tasks: 2
Sequential tasks: 8

## Estimated Effort

2–3 weeks (1 backend engineer + 1 frontend engineer)
