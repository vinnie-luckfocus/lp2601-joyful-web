/**
 * Database Schema Tests
 * Tests database tables, constraints, and indexes
 * Coverage: PRD01 - Database design requirements
 */

import pool from '../../../backend/src/config/database';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Schema', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('Tables Exist', () => {
    const tables = [
      'teams',
      'users',
      'games',
      'game_attendance',
      'batting_records',
      'videos',
      'video_highlights',
    ];

    tables.forEach((table) => {
      it(`should have ${table} table`, async () => {
        const result = await pool.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = $1
          )`,
          [table]
        );
        expect(result.rows[0].exists).toBe(true);
      });
    });
  });

  describe('Teams Table', () => {
    it('should have correct columns', async () => {
      const result = await pool.query(
        `SELECT column_name, data_type
         FROM information_schema.columns
         WHERE table_name = 'teams'`,
      );
      const columns = result.rows.map((r) => r.column_name);
      expect(columns).toContain('id');
      expect(columns).toContain('name');
      expect(columns).toContain('logo_url');
      expect(columns).toContain('description');
      expect(columns).toContain('division');
      expect(columns).toContain('wins');
      expect(columns).toContain('losses');
    });

    it('should enforce non-negative wins/losses', async () => {
      await expect(
        pool.query('INSERT INTO teams (name, wins, losses) VALUES ($1, $2, $3)', ['Test', -1, 0])
      ).rejects.toThrow();
    });
  });

  describe('Users Table', () => {
    it('should enforce unique username', async () => {
      const username = `test_${Date.now()}`;
      await pool.query(
        `INSERT INTO users (username, password_hash, name, role)
         VALUES ($1, $2, $3, $4)`,
        [username, 'hash', 'Test', 'player']
      );

      await expect(
        pool.query(
          `INSERT INTO users (username, password_hash, name, role)
           VALUES ($1, $2, $3, $4)`,
          [username, 'hash2', 'Test2', 'player']
        )
      ).rejects.toThrow();

      // Cleanup
      await pool.query('DELETE FROM users WHERE username = $1', [username]);
    });

    it('should enforce valid role values', async () => {
      await expect(
        pool.query(
          `INSERT INTO users (username, password_hash, name, role)
           VALUES ($1, $2, $3, $4)`,
          [`test_${Date.now()}`, 'hash', 'Test', 'invalid_role']
        )
      ).rejects.toThrow();
    });
  });

  describe('Games Table', () => {
    it('should enforce different teams constraint', async () => {
      await expect(
        pool.query(
          `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id)
           VALUES ($1, $2, $3, $4)`,
          [new Date(), 'Test Field', 1, 1]
        )
      ).rejects.toThrow();
    });
  });

  describe('Batting Records', () => {
    it('should enforce hits <= at_bats', async () => {
      await expect(
        pool.query(
          `INSERT INTO batting_records (game_id, user_id, at_bats, hits)
           VALUES ($1, $2, $3, $4)`,
          [1, 1, 2, 5]
        )
      ).rejects.toThrow();
    });

    it('should enforce extra base hits <= hits', async () => {
      await expect(
        pool.query(
          `INSERT INTO batting_records (game_id, user_id, at_bats, hits, doubles, triples, home_runs)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [1, 1, 10, 2, 2, 2, 2]
        )
      ).rejects.toThrow();
    });
  });

  describe('Indexes', () => {
    it('should have users_team_id index', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM pg_indexes
          WHERE indexname = 'idx_users_team_id'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });

    it('should have games_scheduled_at index', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM pg_indexes
          WHERE indexname = 'idx_games_scheduled_at'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });
  });

  describe('Views', () => {
    it('should have team_standings view', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.views
          WHERE table_name = 'team_standings'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });

    it('should have player_batting_stats view', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.views
          WHERE table_name = 'player_batting_stats'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });
  });

  describe('Migration 003 Rollback', () => {
    const migrationPath = path.join(__dirname, '../../../database/migrations/003_game_schedule_adjustments.sql');

    function extractDownSql(sql: string): string {
      const lines = sql.split('\n');
      let inDown = false;
      const downLines: string[] = [];

      for (const line of lines) {
        if (line.includes('-- DOWN MIGRATION')) {
          inDown = true;
          continue;
        }
        if (inDown) {
          const cleaned = line.replace(/^--\s*/, '');
          if (cleaned.trim()) {
            downLines.push(cleaned);
          }
        }
      }

      return downLines.join('\n');
    }

    function extractUpSql(sql: string): string {
      const lines = sql.split('\n');
      let inUp = false;
      const upLines: string[] = [];

      for (const line of lines) {
        if (line.includes('-- UP MIGRATION')) {
          inUp = true;
          continue;
        }
        if (inUp && line.includes('-- DOWN MIGRATION')) {
          break;
        }
        if (inUp) {
          if (line.trim() && !line.trim().startsWith('--')) {
            upLines.push(line);
          }
        }
      }

      return upLines.join('\n');
    }

    it('should remove the composite index on rollback', async () => {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      const downSql = extractDownSql(sql);

      await pool.query(downSql);

      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM pg_indexes
          WHERE indexname = 'idx_attendance_game_status'
        )`
      );
      expect(result.rows[0].exists).toBe(false);
    });

    afterAll(async () => {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      const upSql = extractUpSql(sql);
      await pool.query(upSql);
    });
  });
});
