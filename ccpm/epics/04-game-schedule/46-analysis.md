---
issue: 46
title: Create games and game_attendance tables with seed data
analyzed: 2026-04-09T12:38:50Z
estimated_hours: 3
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #46

## Overview

The initial schema migration (001_initial_schema.sql) already contains `games` and `game_attendance` tables with most required columns and indexes. However, the task requires some adjustments: adding a composite index on `game_attendance(game_id, status)`, expanding seed data to 10+ upcoming games with attendance records, and adding a migration rollback test. Since the initial migration likely already ran in dev/test environments, changes should be made via a new migration file rather than modifying 001_initial_schema.sql.

## Parallel Streams

### Stream A: Database Schema Adjustments & Seed Data
**Scope**: Create new migration for schema adjustments, expand seed data to 10+ games with attendance records, add rollback test
**Files**:
- `database/migrations/003_game_schedule_adjustments.sql`
- `database/seeds/seed.js`
- `tests/backend/database/schema.test.ts`
**Agent Type**: backend-specialist
**Can Start**: immediately
**Estimated Hours**: 3
**Dependencies**: none

## Coordination Points

### Shared Files
- `database/seeds/seed.js` - add games and attendance seed data
- `tests/backend/database/schema.test.ts` - add rollback test for new migration

### Sequential Requirements
1. Create migration file with adjustments
2. Update seed script
3. Write and run rollback test

## Conflict Risk Assessment
- **Low Risk**: Single stream, well-defined file scope

## Parallelization Strategy

**Recommended Approach**: sequential

Single stream due to tightly coupled changes (migration, seed, test).

## Expected Timeline

- Wall time: 3 hours
- Total work: 3 hours

## Notes

- Do NOT modify `001_initial_schema.sql` since it likely already ran. Use a new migration `003_game_schedule_adjustments.sql`.
- The new migration should: add composite index `idx_attendance_game_status ON game_attendance(game_id, status)`, and ensure all required columns exist (they already do in 001_initial_schema.sql).
- Update `games` array in seed.js to 10+ upcoming games (use future dates).
- Add `insertAttendance()` function in seed.js to create realistic attendance records for each game.
- Add rollback test that runs the DOWN migration and verifies tables are removed or reverted.
- Commit format: `Issue #46: {description}`
