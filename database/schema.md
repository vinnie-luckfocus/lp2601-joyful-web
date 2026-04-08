# Joyful Baseball League - Database Schema Documentation

## Overview

This document describes the PostgreSQL database schema for the Joyful Baseball League website. The schema supports user management, team management, game scheduling, attendance tracking, batting statistics, and video management.

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     teams       │     │     users       │     │     games       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ PK id           │◄────┤ FK team_id      │     │ PK id           │
│    name         │     │ PK id           │     │    scheduled_at │
│    logo_url     │     │    username     │     │    location     │
│    description  │     │    password_hash│     │ FK home_team_id │◄──┐
│    division     │     │    name         │     │ FK away_team_id │◄──┤
│    wins         │     │    email        │     │    home_score   │   │
│    losses       │     │    phone        │     │    away_score   │   │
│    created_at   │     │    avatar_url   │     │    status       │   │
│    updated_at   │     │    jersey_number│     │    created_at   │   │
└─────────────────┘     │    position     │     │    updated_at   │   │
                        │    role         │     └─────────────────┘   │
                        │    status       │              ▲            │
                        │    created_at   │              │            │
                        │    updated_at   │              │            │
                        └─────────────────┘              │            │
                                 ▲                       │            │
                                 │                       │            │
            ┌────────────────────┼───────────────────────┘            │
            │                    │                                    │
            │         ┌──────────┴──────────┐                        │
            │         │   game_attendance   │                        │
            │         ├─────────────────────┤                        │
            │         │ PK id               │                        │
            │         │ FK game_id          │                        │
            │         │ FK user_id          │                        │
            │         │    status           │                        │
            │         │    created_at       │                        │
            │         │    updated_at       │                        │
            │         └─────────────────────┘                        │
            │                                                        │
            │         ┌─────────────────┐     ┌─────────────────┐    │
            │         │ batting_records │     │     videos      │    │
            │         ├─────────────────┤     ├─────────────────┤    │
            │         │ PK id           │     │ PK id           │    │
            │         │ FK game_id      │─────┤ FK game_id      │────┘
            └────────►│ FK user_id      │     │    title        │
                      │    at_bats      │     │    description  │
                      │    hits         │     │    video_url    │
                      │    doubles      │     │    thumbnail_url│
                      │    triples      │     │ FK uploaded_by  │◄──┐
                      │    home_runs    │     │    status       │   │
                      │    rbis         │     │    file_size    │   │
                      │    runs         │     │    duration     │   │
                      │    strikeouts   │     │    created_at   │   │
                      │    walks        │     │    updated_at   │   │
                      │    created_at   │     └─────────────────┘   │
                      │    updated_at   │              ▲            │
                      └─────────────────┘              │            │
                                                       │            │
                                        ┌──────────────┴──────────┐ │
                                        │    video_highlights       │ │
                                        ├───────────────────────────┤ │
                                        │ PK id                     │ │
                                        │ FK video_id               │ │
                                        │    title                  │ │
                                        │    description            │ │
                                        │    start_time             │ │
                                        │    end_time               │ │
                                        │ FK created_by             │─┘
                                        │    created_at             │
                                        │    updated_at             │
                                        └───────────────────────────┘
```

## Table Descriptions

### 1. teams

Stores information about baseball teams in the league.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique team identifier |
| name | VARCHAR(100) | NOT NULL | Team name (e.g., 'A队', 'B队') |
| logo_url | VARCHAR(500) | | URL to team logo image |
| description | TEXT | | Team description/bio |
| division | VARCHAR(50) | | League division: '大联盟' or '小联盟' |
| wins | INTEGER | DEFAULT 0, >= 0 | Total wins |
| losses | INTEGER | DEFAULT 0, >= 0 | Total losses |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- One-to-Many with `users` (a team has many players)
- One-to-Many with `games` as home_team
- One-to-Many with `games` as away_team

### 2. users

Stores player, admin, coach, and staff information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique user identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| name | VARCHAR(100) | NOT NULL | Display name |
| email | VARCHAR(100) | | Email address |
| phone | VARCHAR(20) | | Phone number |
| avatar_url | VARCHAR(500) | | Profile picture URL |
| team_id | INTEGER | FK → teams(id) | Assigned team |
| jersey_number | INTEGER | 1-99 | Jersey number |
| position | VARCHAR(50) | | Baseball position |
| role | VARCHAR(20) | DEFAULT 'player' | Role: admin, player, coach, staff |
| status | VARCHAR(20) | DEFAULT 'active' | Status: active, inactive, suspended |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- Many-to-One with `teams`
- One-to-Many with `game_attendance`
- One-to-Many with `batting_records`
- One-to-Many with `videos` (uploaded_by)
- One-to-Many with `video_highlights` (created_by)

### 3. games

Stores scheduled games and match results.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique game identifier |
| scheduled_at | TIMESTAMP | NOT NULL | Scheduled date and time |
| location | VARCHAR(100) | NOT NULL | Game location/venue |
| home_team_id | INTEGER | FK → teams(id), NOT NULL | Home team |
| away_team_id | INTEGER | FK → teams(id), NOT NULL | Away team |
| home_score | INTEGER | >= 0 | Home team score |
| away_score | INTEGER | >= 0 | Away team score |
| status | VARCHAR(20) | DEFAULT 'scheduled' | scheduled, ongoing, completed, cancelled, postponed |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Constraints:**
- `home_team_id` and `away_team_id` must be different teams

**Relationships:**
- Many-to-One with `teams` (home_team)
- Many-to-One with `teams` (away_team)
- One-to-Many with `game_attendance`
- One-to-Many with `batting_records`
- One-to-Many with `videos`

### 4. game_attendance

Tracks player attendance/RSVP for each game.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique attendance record |
| game_id | INTEGER | FK → games(id), NOT NULL | Associated game |
| user_id | INTEGER | FK → users(id), NOT NULL | Player |
| status | VARCHAR(20) | DEFAULT 'pending' | confirmed, pending, declined, tentative |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Constraints:**
- Unique combination of (game_id, user_id) - one attendance record per player per game

**Relationships:**
- Many-to-One with `games`
- Many-to-One with `users`

### 5. batting_records

Individual batting statistics for each player in each game.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique record identifier |
| game_id | INTEGER | FK → games(id), NOT NULL | Associated game |
| user_id | INTEGER | FK → users(id), NOT NULL | Player |
| at_bats | INTEGER | DEFAULT 0, >= 0 | Number of at-bats |
| hits | INTEGER | DEFAULT 0, >= 0 | Total hits |
| doubles | INTEGER | DEFAULT 0, >= 0 | Doubles (2B) |
| triples | INTEGER | DEFAULT 0, >= 0 | Triples (3B) |
| home_runs | INTEGER | DEFAULT 0, >= 0 | Home runs (HR) |
| rbis | INTEGER | DEFAULT 0, >= 0 | Runs Batted In |
| runs | INTEGER | DEFAULT 0, >= 0 | Runs scored |
| strikeouts | INTEGER | DEFAULT 0, >= 0 | Strikeouts |
| walks | INTEGER | DEFAULT 0, >= 0 | Base on balls |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Constraints:**
- Unique combination of (game_id, user_id) - one batting record per player per game
- `hits` cannot exceed `at_bats`
- `doubles + triples + home_runs` cannot exceed `hits`

**Relationships:**
- Many-to-One with `games`
- Many-to-One with `users`

### 6. videos

Game video uploads and metadata.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique video identifier |
| game_id | INTEGER | FK → games(id) | Associated game (nullable) |
| title | VARCHAR(200) | NOT NULL | Video title |
| description | TEXT | | Video description |
| video_url | VARCHAR(500) | NOT NULL | URL to video file |
| thumbnail_url | VARCHAR(500) | | URL to thumbnail image |
| uploaded_by | INTEGER | FK → users(id), NOT NULL | Uploader |
| status | VARCHAR(20) | DEFAULT 'processing' | processing, ready, error, deleted |
| file_size_bytes | BIGINT | | File size in bytes |
| duration_seconds | INTEGER | > 0 | Video duration |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- Many-to-One with `games`
- Many-to-One with `users` (uploader)
- One-to-Many with `video_highlights`

### 7. video_highlights

Marked highlight moments within videos.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique highlight identifier |
| video_id | INTEGER | FK → videos(id), NOT NULL | Associated video |
| title | VARCHAR(200) | NOT NULL | Highlight title |
| description | TEXT | | Highlight description |
| start_time | INTEGER | NOT NULL, >= 0 | Start time in seconds |
| end_time | INTEGER | NOT NULL, > 0 | End time in seconds |
| created_by | INTEGER | FK → users(id), NOT NULL | User who created the highlight |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Constraints:**
- `end_time` must be greater than `start_time`

**Relationships:**
- Many-to-One with `videos`
- Many-to-One with `users` (creator)

## Indexes

### Performance Indexes

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| users | idx_users_team_id | team_id | Fast team roster lookups |
| users | idx_users_role | role | Filter by user role |
| users | idx_users_status | status | Filter by user status |
| users | idx_users_username | username | Fast username lookups |
| games | idx_games_home_team_id | home_team_id | Home team game history |
| games | idx_games_away_team_id | away_team_id | Away team game history |
| games | idx_games_scheduled_at | scheduled_at | Upcoming games query |
| games | idx_games_status | status | Filter by game status |
| game_attendance | idx_attendance_game_id | game_id | Game attendance list |
| game_attendance | idx_attendance_user_id | user_id | Player attendance history |
| game_attendance | idx_attendance_status | status | Filter by attendance status |
| batting_records | idx_batting_game_id | game_id | Game batting stats |
| batting_records | idx_batting_user_id | user_id | Player batting history |
| videos | idx_videos_game_id | game_id | Game video list |
| videos | idx_videos_uploaded_by | uploaded_by | User uploads |
| videos | idx_videos_status | status | Filter by video status |
| video_highlights | idx_highlights_video_id | video_id | Video highlights |
| video_highlights | idx_highlights_created_by | created_by | User created highlights |

## Views

### team_standings

Aggregated team standings with win percentages.

```sql
SELECT
    id,
    name,
    division,
    wins,
    losses,
    win_percentage
FROM team_standings
ORDER BY win_percentage DESC, wins DESC;
```

### player_batting_stats

Aggregated batting statistics for all players.

```sql
SELECT
    user_id,
    player_name,
    jersey_number,
    team_name,
    games_played,
    total_at_bats,
    total_hits,
    total_doubles,
    total_triples,
    total_home_runs,
    total_rbis,
    total_runs,
    total_walks,
    total_strikeouts,
    batting_average
FROM player_batting_stats;
```

## Triggers

All tables have an `update_updated_at_column` trigger that automatically updates the `updated_at` timestamp on any row modification.

## Constraints Summary

| Table | Constraint | Description |
|-------|------------|-------------|
| users | username UNIQUE | No duplicate usernames |
| users | jersey_number CHECK | Must be between 1-99 |
| users | role CHECK | Must be admin, player, coach, or staff |
| users | status CHECK | Must be active, inactive, or suspended |
| teams | wins CHECK | Must be >= 0 |
| teams | losses CHECK | Must be >= 0 |
| games | different_teams CHECK | Home and away teams must differ |
| games | status CHECK | Must be scheduled, ongoing, completed, cancelled, or postponed |
| game_attendance | unique_game_attendance UNIQUE | One record per player per game |
| game_attendance | status CHECK | Must be confirmed, pending, declined, or tentative |
| batting_records | unique_batting_record UNIQUE | One record per player per game |
| batting_records | valid_hits CHECK | Hits cannot exceed at-bats |
| batting_records | valid_extra_hits CHECK | Extra base hits cannot exceed total hits |
| videos | status CHECK | Must be processing, ready, error, or deleted |
| video_highlights | valid_time_range CHECK | End time must be after start time |

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- Soft deletes are handled via `status` fields rather than actual deletion
- Foreign keys use appropriate `ON DELETE` actions:
  - `CASCADE`: Child records deleted with parent (attendance, batting records, highlights)
  - `SET NULL`: Reference cleared when parent deleted (user's team, video's game)
  - `RESTRICT`: Prevent deletion of parent if children exist (games with teams, videos with uploader)
