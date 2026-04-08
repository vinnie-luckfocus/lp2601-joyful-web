# Issue #3 Analysis: Database Seed Data

## Overview
Create seed data scripts with 2 teams, 18+ players, 4 weeks of games, and 1 admin user for development and testing.

## Work Streams

### Stream A: Seed Data Creation (Single Stream)
**Files to Create:**
- `database/seeds/seed.js` - Main seed script
- `database/seeds/data/teams.js` - Team data
- `database/seeds/data/players.js` - Player data
- `database/seeds/data/games.js` - Game schedule data
- `database/seeds/data/admin.js` - Admin user data

**Implementation Details:**
1. Teams (2):
   - Joyful A队 (Major League)
   - Joyful B队 (Major League)

2. Players (9+ per team = 18+ total):
   - Realistic Chinese names
   - Positions: P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH
   - Jersey numbers 1-99
   - All assigned to teams

3. Games (4 weeks, 1-2 games per week):
   - Saturdays at 14:00
   - Alternating home/away
   - Realistic ballpark names
   - Future dates (starting 2025-04-12)

4. Admin user:
   - username: admin
   - password: (bcrypt hashed - use a simple password like "admin123" for dev)
   - role: admin

**Key Requirements:**
- Script must be idempotent (can run multiple times safely)
- Clear existing data before inserting (TRUNCATE or DELETE)
- Reset sequences after truncate
- Use bcrypt for password hashing
- Log progress during execution

**Parallel Streams:** 1

## Dependencies
- Issue #2 (Database Schema) - COMPLETED ✓

## Risks
- Foreign key constraints may block deletes
- Date/timezone handling for game schedules
- Password hashing requires bcrypt

## Definition of Done
- [ ] Seed script runs without errors
- [ ] Database contains 2 teams after execution
- [ ] Database contains 18+ players (9+ per team)
- [ ] Database contains 4+ games (4 weeks schedule)
- [ ] Admin user can login with credentials
