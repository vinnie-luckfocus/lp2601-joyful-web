/**
 * Stats Service
 * Business logic for player statistics
 */

import pool from '../config/database';

export interface CumulativeStats {
  games: number;
  at_bats: number;
  hits: number;
  batting_avg: number;
  singles: number;
  doubles: number;
  triples: number;
  hr: number;
  rbi: number;
  runs: number;
  walks: number;
  strikeouts: number;
}

export interface RecentGameStat {
  game_id: number;
  batting_avg: number;
}

export interface Milestones {
  hits_to_100: number | null;
}

export interface PlayerStats {
  user: {
    name: string;
    team: string | null;
    jersey_number: number | null;
    position: string | null;
  };
  cumulative: CumulativeStats;
  recent_5_games: RecentGameStat[];
  milestones: Milestones;
}

export async function getPlayerStats(userId: string): Promise<PlayerStats | null> {
  // Get user profile
  const userResult = await pool.query(
    `
      SELECT u.name, t.name AS team, u.jersey_number, u.position
      FROM users u
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.id = $1
    `,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  // Get cumulative stats
  const cumulativeResult = await pool.query(
    `
      SELECT
        COUNT(DISTINCT game_id) AS games,
        COALESCE(SUM(at_bats), 0) AS at_bats,
        COALESCE(SUM(hits), 0) AS hits,
        COALESCE(SUM(doubles), 0) AS doubles,
        COALESCE(SUM(triples), 0) AS triples,
        COALESCE(SUM(home_runs), 0) AS hr,
        COALESCE(SUM(rbis), 0) AS rbi,
        COALESCE(SUM(runs), 0) AS runs,
        COALESCE(SUM(walks), 0) AS walks,
        COALESCE(SUM(strikeouts), 0) AS strikeouts
      FROM batting_records
      WHERE user_id = $1
    `,
    [userId]
  );

  const cum = cumulativeResult.rows[0];
  const atBats = parseInt(cum.at_bats, 10);
  const hits = parseInt(cum.hits, 10);
  const battingAvg = atBats > 0 ? hits / atBats : 0;

  // Get recent 5 games batting averages
  const recentResult = await pool.query(
    `
      SELECT
        game_id,
        CASE
          WHEN at_bats > 0 THEN ROUND((hits::numeric / at_bats), 3)
          ELSE 0
        END AS batting_avg
      FROM batting_records
      WHERE user_id = $1
      ORDER BY game_id DESC
      LIMIT 5
    `,
    [userId]
  );

  const recentGames: RecentGameStat[] = recentResult.rows.map((row) => ({
    game_id: row.game_id,
    batting_avg: parseFloat(row.batting_avg),
  }));

  // Milestones
  const milestones: Milestones = {
    hits_to_100: hits < 100 ? 100 - hits : null,
  };

  return {
    user: {
      name: user.name,
      team: user.team,
      jersey_number: user.jersey_number,
      position: user.position,
    },
    cumulative: {
      games: parseInt(cum.games, 10),
      at_bats: atBats,
      hits,
      batting_avg: parseFloat(battingAvg.toFixed(3)),
      singles: hits - parseInt(cum.doubles, 10) - parseInt(cum.triples, 10) - parseInt(cum.hr, 10),
      doubles: parseInt(cum.doubles, 10),
      triples: parseInt(cum.triples, 10),
      hr: parseInt(cum.hr, 10),
      rbi: parseInt(cum.rbi, 10),
      runs: parseInt(cum.runs, 10),
      walks: parseInt(cum.walks, 10),
      strikeouts: parseInt(cum.strikeouts, 10),
    },
    recent_5_games: recentGames,
    milestones,
  };
}
