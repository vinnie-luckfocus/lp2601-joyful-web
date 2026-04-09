---
issue: 67
title: Database Schema & Seeds
created: 2026-04-10T06:35:00Z
---

# Analysis: Issue #67 - Database Schema & Seeds

## Current State
- `teams` table exists but lacks `captain_id` field
- `users` table already has `team_id`, `jersey_number`, `position`, `role`
- `games` table has `home_team_id`, `away_team_id`, `home_score`, `away_score`, `status`
- Seed script creates 2 teams, 10 players each, 10 scheduled games, but no completed games with scores

## Changes Needed

### 1. Migration
Create `database/migrations/004_add_team_captain.sql`:
- Add `captain_id INTEGER REFERENCES users(id) ON DELETE SET NULL` to `teams` table

### 2. Seed Data Updates
Modify `database/seeds/seed.js`:
- Add `logo_url` and `description` to team objects
- After inserting players, set first player of each team as `captain_id` on the team
- Add 3+ completed games with scores for win/loss validation
- Update seed script to insert games with mixed statuses (completed and scheduled)

## Files to Modify
- `database/migrations/004_add_team_captain.sql` (new)
- `database/seeds/seed.js` (modify)

## Streams
Single stream - schema change and seed update are tightly coupled.
