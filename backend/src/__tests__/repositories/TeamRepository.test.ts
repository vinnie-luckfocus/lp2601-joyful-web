import pool from '../../config/database';
import * as TeamRepository from '../../repositories/TeamRepository';

describe('TeamRepository', () => {
  let teamAId: number;
  let teamBId: number;
  let captainAId: number;
  let playerA2Id: number;

  beforeAll(async () => {
    const teamAResult = await pool.query(
      `INSERT INTO teams (name, division, logo_url, description)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Repo Team A', '大联盟', 'https://example.com/a.png', 'Team A description']
    );
    teamAId = teamAResult.rows[0].id;

    const teamBResult = await pool.query(
      `INSERT INTO teams (name, division, logo_url, description)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Repo Team B', '大联盟', 'https://example.com/b.png', 'Team B description']
    );
    teamBId = teamBResult.rows[0].id;

    const captainResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, team_id, jersey_number, position, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['repo_captain_a', 'hash', 'Captain A', teamAId, 1, '投手', 'player', 'active']
    );
    captainAId = captainResult.rows[0].id;

    await pool.query(
      'UPDATE teams SET captain_id = $1 WHERE id = $2',
      [captainAId, teamAId]
    );

    const playerResult = await pool.query(
      `INSERT INTO users (username, password_hash, name, team_id, jersey_number, position, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['repo_player_a2', 'hash', 'Player A2', teamAId, 2, '捕手', 'player', 'active']
    );
    playerA2Id = playerResult.rows[0].id;

    await pool.query(
      `INSERT INTO users (username, password_hash, name, team_id, jersey_number, position, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['repo_player_b1', 'hash', 'Player B1', teamBId, 10, '一垒手', 'player', 'active']
    );

    // Completed games: A wins 2, B wins 1
    await pool.query(
      `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status, home_score, away_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['2026-01-01 14:00:00+08', 'Stadium', teamAId, teamBId, 'completed', 5, 3]
    );
    await pool.query(
      `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status, home_score, away_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['2026-01-08 14:00:00+08', 'Stadium', teamBId, teamAId, 'completed', 2, 6]
    );
    await pool.query(
      `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status, home_score, away_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['2026-01-15 14:00:00+08', 'Stadium', teamAId, teamBId, 'completed', 1, 4]
    );
    // Scheduled game should not affect record
    await pool.query(
      `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status)
       VALUES ($1, $2, $3, $4, $5)`,
      ['2026-04-01 14:00:00+08', 'Stadium', teamAId, teamBId, 'scheduled']
    );
  });

  afterAll(async () => {
    await pool.query('DELETE FROM game_attendance WHERE game_id IN (SELECT id FROM games WHERE home_team_id = $1 OR away_team_id = $1 OR home_team_id = $2 OR away_team_id = $2)', [teamAId, teamBId]);
    await pool.query('DELETE FROM games WHERE home_team_id = $1 OR away_team_id = $1 OR home_team_id = $2 OR away_team_id = $2', [teamAId, teamBId]);
    await pool.query('DELETE FROM users WHERE team_id = $1 OR team_id = $2', [teamAId, teamBId]);
    await pool.query('DELETE FROM teams WHERE id = $1 OR id = $2', [teamAId, teamBId]);
  });

  describe('findById', () => {
    it('returns team with captain details', async () => {
      const team = await TeamRepository.findById(teamAId);
      expect(team).not.toBeNull();
      expect(team!.name).toBe('Repo Team A');
      expect(team!.captain_id).toBe(captainAId);
      expect(team!.captain_name).toBe('Captain A');
    });

    it('returns null for non-existent team', async () => {
      const team = await TeamRepository.findById(999999);
      expect(team).toBeNull();
    });
  });

  describe('findMembersByTeamId', () => {
    it('returns ordered member list excluding admin', async () => {
      const members = await TeamRepository.findMembersByTeamId(teamAId);
      expect(members).toHaveLength(2);
      expect(members[0].jersey_number).toBe(1);
      expect(members[1].jersey_number).toBe(2);
      expect(members[0].role).toBe('player');
    });

    it('returns empty array for team with no members', async () => {
      const members = await TeamRepository.findMembersByTeamId(999999);
      expect(members).toEqual([]);
    });
  });

  describe('findRecentGamesByTeamId', () => {
    it('returns recent completed games limited by param', async () => {
      const games = await TeamRepository.findRecentGamesByTeamId(teamAId, 2);
      expect(games).toHaveLength(2);
      expect(games[0].status).toBe('completed');
    });

    it('defaults limit to 3', async () => {
      const games = await TeamRepository.findRecentGamesByTeamId(teamAId);
      expect(games).toHaveLength(3);
    });
  });

  describe('getRecordByTeamId', () => {
    it('computes wins, losses, and win_rate', async () => {
      const record = await TeamRepository.getRecordByTeamId(teamAId);
      expect(record.wins).toBe(2);
      expect(record.losses).toBe(1);
      expect(record.win_rate).toBeCloseTo(66.67, 2);
    });

    it('returns zero for team with no games', async () => {
      // Create a team with no games dynamically
      const result = await pool.query(
        `INSERT INTO teams (name, division) VALUES ($1, $2) RETURNING id`,
        ['NoGame Team', '大联盟']
      );
      const noGameTeamId = result.rows[0].id;
      const record = await TeamRepository.getRecordByTeamId(noGameTeamId);
      expect(record).toEqual({ wins: 0, losses: 0, win_rate: 0 });
      await pool.query('DELETE FROM teams WHERE id = $1', [noGameTeamId]);
    });
  });
});
