import pool from '../config/database';

export interface Team {
  id: number;
  name: string;
  logo_url: string | null;
  description: string | null;
  division: string | null;
  captain_id: number | null;
  captain_name: string | null;
  captain_avatar_url: string | null;
}

export interface TeamMember {
  id: number;
  name: string;
  jersey_number: number | null;
  position: string | null;
  role: string;
  avatar_url: string | null;
}

export interface TeamGame {
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
}

export interface TeamRecord {
  wins: number;
  losses: number;
  win_rate: number;
}

export async function findById(id: number): Promise<Team | null> {
  const query = `
    SELECT
      t.id,
      t.name,
      t.logo_url,
      t.description,
      t.division,
      t.captain_id,
      u.name AS captain_name,
      u.avatar_url AS captain_avatar_url
    FROM teams t
    LEFT JOIN users u ON t.captain_id = u.id
    WHERE t.id = $1
  `;
  const result = await pool.query<Team>(query, [id]);
  return result.rows[0] || null;
}

export async function findMembersByTeamId(id: number): Promise<TeamMember[]> {
  const query = `
    SELECT
      id,
      name,
      jersey_number,
      position,
      role,
      avatar_url
    FROM users
    WHERE team_id = $1 AND role != 'admin'
    ORDER BY jersey_number ASC NULLS LAST, name ASC
  `;
  const result = await pool.query<TeamMember>(query, [id]);
  return result.rows;
}

export async function findRecentGamesByTeamId(
  id: number,
  limit: number = 3
): Promise<TeamGame[]> {
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
      g.status
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
      AND g.status = 'completed'
    ORDER BY g.scheduled_at DESC
    LIMIT $2
  `;
  const result = await pool.query<TeamGame>(query, [id, limit]);
  return result.rows;
}

export async function getRecordByTeamId(id: number): Promise<TeamRecord> {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE home_team_id = $1 AND home_score > away_score) +
      COUNT(*) FILTER (WHERE away_team_id = $1 AND away_score > home_score) AS wins,
      COUNT(*) FILTER (WHERE home_team_id = $1 AND home_score < away_score) +
      COUNT(*) FILTER (WHERE away_team_id = $1 AND away_score < home_score) AS losses
    FROM games
    WHERE (home_team_id = $1 OR away_team_id = $1)
      AND status = 'completed'
      AND home_score IS NOT NULL
      AND away_score IS NOT NULL
  `;
  const result = await pool.query<TeamRecord>(query, [id]);
  const row = result.rows[0];
  const wins = parseInt(String(row.wins || 0), 10);
  const losses = parseInt(String(row.losses || 0), 10);
  const total = wins + losses;
  return {
    wins,
    losses,
    win_rate: total > 0 ? parseFloat(((wins / total) * 100).toFixed(2)) : 0,
  };
}
