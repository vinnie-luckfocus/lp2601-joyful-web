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
