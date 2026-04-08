/**
 * Database Seed Tests
 * Tests seed data creation and verification
 * Coverage: PRD01 - Seed data requirements (2 teams, 18+ players, 4 games)
 */

import pool from '../../../backend/src/config/database';

describe('Database Seed Data', () => {
  beforeAll(async () => {
    // Ensure seed data exists
    const teamCount = await pool.query('SELECT COUNT(*) FROM teams');
    if (parseInt(teamCount.rows[0].count) === 0) {
      throw new Error('Seed data not found. Please run: node database/seeds/seed.js');
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Team Requirements', () => {
    it('should have at least 2 teams', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM teams');
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(2);
    });

    it('should have Joyful A队 and Joyful B队', async () => {
      const result = await pool.query('SELECT name FROM teams');
      const teamNames = result.rows.map((r) => r.name);
      expect(teamNames).toContain('Joyful A队');
      expect(teamNames).toContain('Joyful B队');
    });

    it('should have teams in 大联盟 division', async () => {
      const result = await pool.query('SELECT division FROM teams WHERE division IS NOT NULL');
      const divisions = result.rows.map((r) => r.division);
      expect(divisions).toContain('大联盟');
    });
  });

  describe('Player Requirements', () => {
    it('should have at least 18 players total', async () => {
      const result = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'player'");
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(18);
    });

    it('should have players assigned to teams', async () => {
      const result = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'player' AND team_id IS NOT NULL"
      );
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(18);
    });

    it('should have at least 9 players per team', async () => {
      const result = await pool.query(
        `SELECT team_id, COUNT(*) as count
         FROM users
         WHERE role = 'player' AND team_id IS NOT NULL
         GROUP BY team_id`
      );
      result.rows.forEach((row) => {
        expect(parseInt(row.count)).toBeGreaterThanOrEqual(9);
      });
    });

    it('should have players with jersey numbers', async () => {
      const result = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'player' AND jersey_number IS NOT NULL"
      );
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(18);
    });

    it('should have players with positions', async () => {
      const result = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'player' AND position IS NOT NULL"
      );
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(18);
    });
  });

  describe('Admin Requirements', () => {
    it('should have admin user', async () => {
      const result = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(1);
    });

    it('should have admin with username "admin"', async () => {
      const result = await pool.query("SELECT username FROM users WHERE role = 'admin'");
      const usernames = result.rows.map((r) => r.username);
      expect(usernames).toContain('admin');
    });
  });

  describe('Game Schedule Requirements', () => {
    it('should have at least 4 games', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM games');
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(4);
    });

    it('should have games with scheduled times', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM games WHERE scheduled_at IS NOT NULL');
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(4);
    });

    it('should have games with locations', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM games WHERE location IS NOT NULL');
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(4);
    });

    it('should have games with home and away teams', async () => {
      const result = await pool.query(
        'SELECT COUNT(*) FROM games WHERE home_team_id IS NOT NULL AND away_team_id IS NOT NULL'
      );
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(4);
    });

    it('should have games on Saturdays at 14:00', async () => {
      const result = await pool.query(
        "SELECT COUNT(*) FROM games WHERE EXTRACT(HOUR FROM scheduled_at) = 14 AND EXTRACT(DOW FROM scheduled_at) = 6"
      );
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Data Integrity', () => {
    it('should have all players with unique jersey numbers per team', async () => {
      const result = await pool.query(
        `SELECT team_id, jersey_number, COUNT(*)
         FROM users
         WHERE role = 'player'
         GROUP BY team_id, jersey_number
         HAVING COUNT(*) > 1`
      );
      expect(result.rows.length).toBe(0);
    });

    it('should have players with valid positions', async () => {
      const validPositions = ['投手', '捕手', '一垒手', '二垒手', '三垒手', '游击手', '左外野', '中外野', '右外野', '指定打击'];
      const result = await pool.query("SELECT DISTINCT position FROM users WHERE role = 'player'");
      const positions = result.rows.map((r) => r.position);
      positions.forEach((pos) => {
        expect(validPositions).toContain(pos);
      });
    });

    it('should have all required table relationships', async () => {
      // Check foreign key constraints exist
      const result = await pool.query(
        `SELECT tc.table_name, kcu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
         WHERE tc.constraint_type = 'FOREIGN KEY'`
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
});
