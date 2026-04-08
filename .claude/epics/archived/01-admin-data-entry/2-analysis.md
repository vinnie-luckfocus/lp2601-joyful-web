# Issue #2 Analysis: Database Schema Design

## Overview
Design complete PostgreSQL database schema for Joyful Baseball League including all tables, relationships, and constraints.

## Work Streams

### Stream A: Schema Design (Single Stream)
**Files to Modify:**
- Create `database/migrations/001_initial_schema.sql`
- Create `database/ER-diagram.png` (or SVG)
- Create `database/schema.md` (documentation)

**Implementation Details:**
1. Design tables:
   - `users` - Players, admins with role-based access
   - `teams` - Team information (A队, B队)
   - `games` - Scheduled games with home/away teams
   - `game_attendance` - Player attendance for each game
   - `batting_records` - Individual batting statistics
   - `videos` - Game video uploads
   - `video_highlights` - Marked highlight moments

2. Key constraints:
   - All tables have `created_at` and `updated_at`
   - Foreign key relationships properly defined
   - Indexes on frequently queried fields
   - Check constraints (e.g., jersey_number > 0)

**Parallel Streams:** 1 (no parallel work - single cohesive schema)

## Dependencies
- None (foundation task)

## Risks
- Schema changes later will require migrations
- Need to account for video storage (URLs vs blob)
- Stats normalization (calculated vs stored)

## Definition of Done
- [ ] SQL DDL file is complete and executable
- [ ] ER diagram clearly shows all relationships
- [ ] All acceptance criteria from task file are met
- [ ] Schema supports all MVP features
