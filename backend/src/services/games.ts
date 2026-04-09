/**
 * Games Service
 * Business logic for authenticated game endpoints
 */

import pool from '../config/database';

export interface GameWithStatus {
  id: number;
  scheduled_at: string;
  location: string;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  my_status: 'confirmed' | 'declined' | null;
}

/**
 * Get all games with current user's attendance status
 */
export async function getGames(userId: string): Promise<GameWithStatus[]> {
  const query = `
    SELECT
      g.id,
      g.scheduled_at,
      g.location,
      g.home_team_id,
      g.away_team_id,
      ht.name AS home_team_name,
      at.name AS away_team_name,
      g.home_score,
      g.away_score,
      g.status,
      ga.status AS my_status
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    LEFT JOIN game_attendance ga ON g.id = ga.game_id AND ga.user_id = $1
    ORDER BY g.scheduled_at ASC
  `;

  const result = await pool.query<GameWithStatus>(query, [userId]);
  return result.rows;
}

/**
 * Get single game by ID with current user's attendance status
 */
export async function getGameById(
  gameId: number,
  userId: string
): Promise<GameWithStatus | null> {
  const query = `
    SELECT
      g.id,
      g.scheduled_at,
      g.location,
      g.home_team_id,
      g.away_team_id,
      ht.name AS home_team_name,
      at.name AS away_team_name,
      g.home_score,
      g.away_score,
      g.status,
      ga.status AS my_status
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    LEFT JOIN game_attendance ga ON g.id = ga.game_id AND ga.user_id = $2
    WHERE g.id = $1
  `;

  const result = await pool.query<GameWithStatus>(query, [gameId, userId]);
  return result.rows[0] || null;
}

export interface AttendeeUser {
  id: string;
  username: string;
  name: string;
}

export interface AttendanceLists {
  confirmed: AttendeeUser[];
  declined: AttendeeUser[];
  pending: AttendeeUser[];
}

/**
 * Update attendance status with atomic transaction and cutoff check
 */
export async function updateAttendance(
  gameId: number,
  userId: string,
  status: 'confirmed' | 'declined'
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const gameResult = await client.query(
      'SELECT scheduled_at FROM games WHERE id = $1 FOR UPDATE',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      await client.query('ROLLBACK');
      const error = new Error('Game not found');
      (error as unknown as { code: string }).code = 'GAME_NOT_FOUND';
      throw error;
    }

    const cutoffResult = await client.query(
      `SELECT 1 FROM games WHERE id = $1 AND NOW() <= scheduled_at - INTERVAL '2 hours'`,
      [gameId]
    );

    if (cutoffResult.rows.length === 0) {
      await client.query('ROLLBACK');
      const error = new Error('Signup is closed within 2 hours of game start');
      (error as unknown as { code: string }).code = 'CUTOFF_PASSED';
      throw error;
    }

    await client.query(
      `INSERT INTO game_attendance (game_id, user_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (game_id, user_id) DO UPDATE SET status = $3, updated_at = NOW()`,
      [gameId, userId, status]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {
      // Ignore rollback errors
    });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get attendance lists for a game
 */
export async function getAttendance(gameId: number): Promise<AttendanceLists> {
  const confirmedResult = await pool.query<AttendeeUser>(
    `SELECT u.id::text, u.username, u.name
     FROM users u
     JOIN game_attendance ga ON u.id = ga.user_id
     WHERE ga.game_id = $1 AND ga.status = 'confirmed'`,
    [gameId]
  );

  const declinedResult = await pool.query<AttendeeUser>(
    `SELECT u.id::text, u.username, u.name
     FROM users u
     JOIN game_attendance ga ON u.id = ga.user_id
     WHERE ga.game_id = $1 AND ga.status = 'declined'`,
    [gameId]
  );

  const pendingResult = await pool.query<AttendeeUser>(
    `SELECT u.id::text, u.username, u.name
     FROM users u
     WHERE u.status = 'active'
       AND u.id NOT IN (
         SELECT user_id FROM game_attendance WHERE game_id = $1
       )`,
    [gameId]
  );

  return {
    confirmed: confirmedResult.rows,
    declined: declinedResult.rows,
    pending: pendingResult.rows,
  };
}
