/**
 * Public API Service
 * Business logic for public endpoints
 */

import pool from '../config/database';

// Error codes
export const ErrorCodes = {
  DB_CONNECTION_ERROR: '5001',
  QUERY_TIMEOUT: '5002',
  INVALID_PARAMETER: '4001',
  DATA_NOT_FOUND: '4041',
} as const;

// Custom error class
export class PublicApiError extends Error {
  code: string;
  statusCode: number;
  details: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Types
export interface Game {
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

export interface ScheduleGame {
  id: number;
  scheduled_at: string;
  location: string;
  home_team: {
    id: number;
    name: string;
  };
  away_team: {
    id: number;
    name: string;
  };
  status: string;
}

export interface Standing {
  id: number;
  name: string;
  division: string | null;
  wins: number;
  losses: number;
  win_percentage: number;
}

export interface Leader {
  user_id: number;
  player_name: string;
  jersey_number: number | null;
  team_name: string | null;
  value: number;
  category: string;
}

export interface Highlight {
  type: 'hr' | 'rbi' | 'hit' | 'win';
  player: string;
  count: number;
  description: string;
}

export interface GameResult {
  id: number;
  scheduled_at: string;
  location: string;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  highlights: Highlight[];
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 100;

/**
 * Exponential backoff retry wrapper
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a connection error
      const errorMessage = lastError.message.toLowerCase();
      const isConnectionError =
        errorMessage.includes('connection') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('timeout');

      if (!isConnectionError) {
        // Don't retry on non-connection errors
        throw error;
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  const errorMessage = lastError?.message.toLowerCase() || '';
  if (errorMessage.includes('timeout')) {
    throw new PublicApiError(
      ErrorCodes.QUERY_TIMEOUT,
      '查询超时，请稍后重试',
      504,
      { operation: operationName }
    );
  }

  throw new PublicApiError(
    ErrorCodes.DB_CONNECTION_ERROR,
    '数据库连接失败，请稍后重试',
    503,
    { operation: operationName }
  );
}

/**
 * Validate limit parameter
 */
function validateLimit(limit: number, maxLimit: number = 50): void {
  if (!Number.isInteger(limit) || limit <= 0 || limit > maxLimit) {
    throw new PublicApiError(
      ErrorCodes.INVALID_PARAMETER,
      `无效的limit参数，必须是1-${maxLimit}之间的整数`,
      400,
      { limit, maxLimit }
    );
  }
}

/**
 * Get recent games
 */
export async function getRecentGames(limit: number = 4): Promise<Game[]> {
  validateLimit(limit, 20);

  return withRetry(async () => {
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
      WHERE g.scheduled_at >= NOW() - INTERVAL '7 days'
      ORDER BY g.scheduled_at ASC
      LIMIT $1
    `;

    const result = await pool.query<Game>(query, [limit]);
    return result.rows;
  }, 'getRecentGames');
}

/**
 * Get all games sorted by scheduled_at ascending
 */
export async function getAllGames(limit?: number): Promise<ScheduleGame[]> {
  if (limit !== undefined) {
    validateLimit(limit, 50);
  }

  return withRetry(async () => {
    let query = `
      SELECT
        g.id,
        g.scheduled_at,
        g.location,
        g.status,
        json_build_object(
          'id', ht.id,
          'name', ht.name
        ) AS home_team,
        json_build_object(
          'id', at.id,
          'name', at.name
        ) AS away_team
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.id
      JOIN teams at ON g.away_team_id = at.id
      ORDER BY g.scheduled_at ASC
    `;

    const params: number[] = [];
    if (limit !== undefined) {
      query += ' LIMIT $1';
      params.push(limit);
    }

    const result = await pool.query<ScheduleGame>(query, params);
    return result.rows;
  }, 'getAllGames');
}

/**
 * Get team standings
 */
export async function getStandings(): Promise<Standing[]> {
  return withRetry(async () => {
    const query = `
      SELECT
        t.id,
        t.name,
        t.division,
        t.wins,
        t.losses,
        CASE
          WHEN (t.wins + t.losses) > 0
          THEN ROUND((t.wins::numeric / (t.wins + t.losses)) * 100, 2)
          ELSE 0
        END AS win_percentage
      FROM teams t
      ORDER BY win_percentage DESC, t.wins DESC
    `;

    const result = await pool.query<Standing>(query);
    return result.rows;
  }, 'getStandings');
}

/**
 * Get statistical leaders
 */
export async function getLeaders(
  category: string = 'batting_average',
  limit: number = 10
): Promise<Leader[]> {
  validateLimit(limit, 50);

  // Valid categories
  const validCategories = [
    'batting_average',
    'home_runs',
    'rbis',
    'hits',
    'runs',
    'doubles',
    'triples',
    'walks',
  ];

  if (!validCategories.includes(category)) {
    throw new PublicApiError(
      ErrorCodes.INVALID_PARAMETER,
      `无效的category参数，有效值: ${validCategories.join(', ')}`,
      400,
      { category, validCategories }
    );
  }

  return withRetry(async () => {
    let query: string;

    if (category === 'batting_average') {
      query = `
        SELECT
          u.id AS user_id,
          u.name AS player_name,
          u.jersey_number,
          t.name AS team_name,
          CASE
            WHEN SUM(br.at_bats) > 0
            THEN ROUND((SUM(br.hits)::numeric / SUM(br.at_bats)), 3)
            ELSE 0
          END AS value,
          'batting_average' AS category
        FROM users u
        LEFT JOIN teams t ON u.team_id = t.id
        LEFT JOIN batting_records br ON u.id = br.user_id
        WHERE u.role = 'player'
        GROUP BY u.id, u.name, u.jersey_number, t.name
        HAVING SUM(br.at_bats) > 0
        ORDER BY value DESC
        LIMIT $1
      `;
    } else {
      const statColumn = category; // home_runs, rbis, hits, etc.
      query = `
        SELECT
          u.id AS user_id,
          u.name AS player_name,
          u.jersey_number,
          t.name AS team_name,
          COALESCE(SUM(br.${statColumn}), 0) AS value,
          '${category}' AS category
        FROM users u
        LEFT JOIN teams t ON u.team_id = t.id
        LEFT JOIN batting_records br ON u.id = br.user_id
        WHERE u.role = 'player'
        GROUP BY u.id, u.name, u.jersey_number, t.name
        HAVING SUM(br.${statColumn}) > 0
        ORDER BY value DESC
        LIMIT $1
      `;
    }

    const result = await pool.query<Leader>(query, [limit]);
    return result.rows;
  }, 'getLeaders');
}

/**
 * Get highlights for a game
 */
async function getGameHighlights(gameId: number): Promise<Highlight[]> {
  const highlights: Highlight[] = [];

  // Get home run leaders for this game
  const hrQuery = `
    SELECT
      u.name AS player,
      br.home_runs AS count
    FROM batting_records br
    JOIN users u ON br.user_id = u.id
    WHERE br.game_id = $1 AND br.home_runs > 0
    ORDER BY br.home_runs DESC
    LIMIT 2
  `;

  const hrResult = await pool.query(hrQuery, [gameId]);
  for (const row of hrResult.rows) {
    highlights.push({
      type: 'hr',
      player: row.player,
      count: row.count,
      description: `本垒打 x${row.count}`,
    });
  }

  // Get RBI leaders for this game
  const rbiQuery = `
    SELECT
      u.name AS player,
      br.rbis AS count
    FROM batting_records br
    JOIN users u ON br.user_id = u.id
    WHERE br.game_id = $1 AND br.rbis > 0
    ORDER BY br.rbis DESC
    LIMIT 2
  `;

  const rbiResult = await pool.query(rbiQuery, [gameId]);
  for (const row of rbiResult.rows) {
    // Avoid duplicates if same player has both HR and RBI
    const existing = highlights.find(
      (h) => h.player === row.player && h.type === 'hr'
    );
    if (!existing) {
      highlights.push({
        type: 'rbi',
        player: row.player,
        count: row.count,
        description: `打点 x${row.count}`,
      });
    }
  }

  return highlights;
}

/**
 * Get recent game results
 */
export async function getRecentGameResults(
  limit: number = 3
): Promise<GameResult[]> {
  validateLimit(limit, 20);

  return withRetry(async () => {
    const query = `
      SELECT
        g.id,
        g.scheduled_at,
        g.location,
        ht.name AS home_team_name,
        at.name AS away_team_name,
        g.home_score,
        g.away_score
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.id
      JOIN teams at ON g.away_team_id = at.id
      WHERE g.status = 'completed'
        AND g.home_score IS NOT NULL
        AND g.away_score IS NOT NULL
      ORDER BY g.scheduled_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);

    // Fetch highlights for each game
    const games: GameResult[] = [];
    for (const row of result.rows) {
      const highlights = await getGameHighlights(row.id);
      games.push({
        id: row.id,
        scheduled_at: row.scheduled_at,
        location: row.location,
        home_team_name: row.home_team_name,
        away_team_name: row.away_team_name,
        home_score: row.home_score,
        away_score: row.away_score,
        highlights,
      });
    }

    return games;
  }, 'getRecentGameResults');
}
