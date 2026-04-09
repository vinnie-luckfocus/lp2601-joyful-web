/**
 * Joyful Baseball League - Database Seed Script
 * Creates comprehensive seed data for development and testing
 *
 * Usage: node database/seeds/seed.js
 *
 * Requirements:
 * - pg: npm install pg
 * - bcryptjs: npm install bcryptjs
 * - DATABASE_URL environment variable set
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/joyful_baseball'
});

// Seed data
const teams = [
  { name: 'Joyful A队', division: '大联盟', logo_url: 'https://placehold.co/120x120/041E42/FFFFFF?text=A', description: 'Joyful A队是大联盟中的强队，拥有多位经验丰富的球员。' },
  { name: 'Joyful B队', division: '大联盟', logo_url: 'https://placehold.co/120x120/BF0D3E/FFFFFF?text=B', description: 'Joyful B队以年轻球员为主，充满活力和拼搏精神。' }
];

// Players for Team A (10 players)
const teamAPlayers = [
  { name: '张伟', jersey_number: 1, position: '投手', username: 'player_01' },
  { name: '王芳', jersey_number: 2, position: '捕手', username: 'player_02' },
  { name: '李娜', jersey_number: 3, position: '一垒手', username: 'player_03' },
  { name: '刘强', jersey_number: 4, position: '二垒手', username: 'player_04' },
  { name: '陈明', jersey_number: 5, position: '三垒手', username: 'player_05' },
  { name: '杨洋', jersey_number: 6, position: '游击手', username: 'player_06' },
  { name: '赵磊', jersey_number: 7, position: '左外野', username: 'player_07' },
  { name: '孙丽', jersey_number: 8, position: '中外野', username: 'player_08' },
  { name: '周杰', jersey_number: 9, position: '右外野', username: 'player_09' },
  { name: '吴刚', jersey_number: 10, position: '指定打击', username: 'player_10' }
];

// Players for Team B (10 players)
const teamBPlayers = [
  { name: '郑华', jersey_number: 11, position: '投手', username: 'player_11' },
  { name: '黄静', jersey_number: 12, position: '捕手', username: 'player_12' },
  { name: '林涛', jersey_number: 13, position: '一垒手', username: 'player_13' },
  { name: '徐明', jersey_number: 14, position: '二垒手', username: 'player_14' },
  { name: '谢峰', jersey_number: 15, position: '三垒手', username: 'player_15' },
  { name: '马丽', jersey_number: 16, position: '游击手', username: 'player_16' },
  { name: '朱军', jersey_number: 17, position: '左外野', username: 'player_17' },
  { name: '胡雪', jersey_number: 18, position: '中外野', username: 'player_18' },
  { name: '郭明', jersey_number: 19, position: '右外野', username: 'player_19' },
  { name: '何伟', jersey_number: 20, position: '指定打击', username: 'player_20' }
];

// Completed games for record calculation
const completedGames = [
  { scheduled_at: '2026-01-11 14:00:00+08', location: 'A球场', home_team_index: 0, away_team_index: 1, status: 'completed', home_score: 5, away_score: 3 },
  { scheduled_at: '2026-01-18 14:00:00+08', location: 'B球场', home_team_index: 1, away_team_index: 0, status: 'completed', home_score: 2, away_score: 4 },
  { scheduled_at: '2026-01-25 14:00:00+08', location: 'A球场', home_team_index: 0, away_team_index: 1, status: 'completed', home_score: 1, away_score: 6 },
  { scheduled_at: '2026-02-08 14:00:00+08', location: 'B球场', home_team_index: 1, away_team_index: 0, status: 'completed', home_score: 7, away_score: 5 }
];

// Games schedule (6 upcoming Saturdays at 14:00)
const games = [
  { scheduled_at: '2026-04-11 14:00:00+08', location: 'A球场', home_team_index: 0, away_team_index: 1, status: 'scheduled' },
  { scheduled_at: '2026-04-18 14:00:00+08', location: 'B球场', home_team_index: 1, away_team_index: 0, status: 'scheduled' },
  { scheduled_at: '2026-04-25 14:00:00+08', location: 'A球场', home_team_index: 0, away_team_index: 1, status: 'scheduled' },
  { scheduled_at: '2026-05-02 14:00:00+08', location: 'B球场', home_team_index: 1, away_team_index: 0, status: 'scheduled' },
  { scheduled_at: '2026-05-09 14:00:00+08', location: 'A球场', home_team_index: 0, away_team_index: 1, status: 'scheduled' },
  { scheduled_at: '2026-05-16 14:00:00+08', location: 'B球场', home_team_index: 1, away_team_index: 0, status: 'scheduled' }
];

// Admin user
const adminUser = {
  username: 'admin',
  password: 'admin123',
  name: '系统管理员',
  role: 'admin'
};

// E2E test user (password meets 6-char minimum for login API)
const e2eUser = {
  username: 'e2e_player',
  password: 'testpass123',
  name: 'E2E测试球员',
  role: 'player',
  team_id: null, // set dynamically after teams are inserted
  jersey_number: 99,
  position: '外野手'
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Clear all existing data from tables
 * Order matters due to foreign key constraints
 */
async function clearData() {
  console.log('Clearing existing data...');

  // Clear in reverse dependency order
  await client.query('DELETE FROM video_highlights');
  await client.query('DELETE FROM videos');
  await client.query('DELETE FROM batting_records');
  await client.query('DELETE FROM game_lineups');
  await client.query('DELETE FROM game_tactics');
  await client.query('DELETE FROM game_attendance');
  await client.query('DELETE FROM games');
  await client.query('DELETE FROM users');
  await client.query('DELETE FROM teams');

  console.log('  - All tables cleared');
}

/**
 * Reset all sequences to start from 1
 */
async function resetSequences() {
  console.log('Resetting sequences...');

  const sequences = [
    'teams_id_seq',
    'users_id_seq',
    'games_id_seq',
    'game_attendance_id_seq',
    'batting_records_id_seq',
    'videos_id_seq',
    'video_highlights_id_seq',
    'game_tactics_id_seq',
    'game_lineups_id_seq'
  ];

  for (const seq of sequences) {
    try {
      await client.query(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
    } catch (err) {
      // Sequence might not exist, ignore
    }
  }

  console.log('  - Sequences reset');
}

/**
 * Insert teams and return their IDs
 * @returns {Promise<Array>} - Array of team IDs
 */
async function insertTeams() {
  console.log('Inserting teams...');

  const teamIds = [];
  for (const team of teams) {
    const result = await client.query(
      'INSERT INTO teams (name, division, logo_url, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [team.name, team.division, team.logo_url, team.description]
    );
    teamIds.push(result.rows[0].id);
    console.log(`  - Created: ${team.name} (ID: ${result.rows[0].id})`);
  }

  return teamIds;
}

/**
 * Insert players for a team
 * @param {Array} players - Array of player objects
 * @param {number} teamId - Team ID
 * @param {string} teamName - Team name for logging
 * @returns {Promise<Array>} - Array of inserted user IDs
 */
async function insertPlayers(players, teamId, teamName) {
  console.log(`Inserting players for ${teamName}...`);

  const userIds = [];
  for (const player of players) {
    const passwordHash = await hashPassword(player.jersey_number.toString());

    const result = await client.query(
      `INSERT INTO users (username, password_hash, name, team_id, jersey_number, position, role, status, is_first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        player.username,
        passwordHash,
        player.name,
        teamId,
        player.jersey_number,
        player.position,
        'player',
        'active',
        true
      ]
    );
    userIds.push(result.rows[0].id);
    console.log(`  - ${player.name} (#${player.jersey_number}, ${player.position})`);
  }

  return userIds;
}

/**
 * Insert games
 * @param {Array} teamIds - Array of team IDs
 * @returns {Promise<Array>} - Array of inserted game IDs
 */
async function insertGames(teamIds) {
  console.log('Inserting scheduled games...');

  const gameIds = [];
  for (const game of games) {
    const result = await client.query(
      `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        game.scheduled_at,
        game.location,
        teamIds[game.home_team_index],
        teamIds[game.away_team_index],
        game.status
      ]
    );
    gameIds.push(result.rows[0].id);
    console.log(`  - Game ${result.rows[0].id}: ${game.scheduled_at} at ${game.location}`);
  }

  return gameIds;
}

async function insertCompletedGames(teamIds) {
  console.log('Inserting completed games...');

  const gameIds = [];
  for (const game of completedGames) {
    const result = await client.query(
      `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status, home_score, away_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        game.scheduled_at,
        game.location,
        teamIds[game.home_team_index],
        teamIds[game.away_team_index],
        game.status,
        game.home_score,
        game.away_score
      ]
    );
    gameIds.push(result.rows[0].id);
    console.log(`  - Completed Game ${result.rows[0].id}: ${game.home_score} vs ${game.away_score}`);
  }

  return gameIds;
}

async function assignCaptains(teamIds, teamAUserIds, teamBUserIds) {
  console.log('Assigning team captains...');

  if (teamAUserIds.length > 0) {
    await client.query(
      'UPDATE teams SET captain_id = $1 WHERE id = $2',
      [teamAUserIds[0], teamIds[0]]
    );
    console.log(`  - Team A captain: User ${teamAUserIds[0]}`);
  }

  if (teamBUserIds.length > 0) {
    await client.query(
      'UPDATE teams SET captain_id = $1 WHERE id = $2',
      [teamBUserIds[0], teamIds[1]]
    );
    console.log(`  - Team B captain: User ${teamBUserIds[0]}`);
  }
}

/**
 * Insert admin user
 */
async function insertAdmin() {
  console.log('Inserting admin user...');

  const passwordHash = await hashPassword(adminUser.password);

  await client.query(
    `INSERT INTO users (username, password_hash, name, role, status, is_first_login)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      adminUser.username,
      passwordHash,
      adminUser.name,
      adminUser.role,
      'active',
      true
    ]
  );

  console.log(`  - Admin: ${adminUser.username} (${adminUser.name})`);
}

/**
 * Insert E2E test user
 * @param {number} teamId - Team ID to assign
 * @returns {Promise<number>} - Inserted user ID
 */
async function insertE2EUser(teamId) {
  console.log('Inserting E2E test user...');
  const passwordHash = await hashPassword(e2eUser.password);
  const result = await client.query(
    `INSERT INTO users (username, password_hash, name, team_id, jersey_number, position, role, status, is_first_login)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      e2eUser.username,
      passwordHash,
      e2eUser.name,
      teamId,
      e2eUser.jersey_number,
      e2eUser.position,
      e2eUser.role,
      'active',
      false
    ]
  );
  console.log(`  - E2E User: ${e2eUser.username} (${e2eUser.name})`);
  return result.rows[0].id;
}

/**
 * Insert attendance records for all players across all games
 * @param {Array} gameIds - Array of game IDs
 * @param {Array} playerIds - Array of player user IDs
 */
async function insertAttendance(gameIds, playerIds) {
  console.log('Inserting attendance records...');

  let count = 0;
  for (const gameId of gameIds) {
    for (const playerId of playerIds) {
      await client.query(
        `INSERT INTO game_attendance (game_id, user_id, status)
         VALUES ($1, $2, $3)`,
        [gameId, playerId, 'pending']
      );
      count += 1;
    }
  }

  console.log(`  - Created ${count} attendance records`);
}

/**
 * Insert lineup and tactics for the first scheduled game
 * @param {number} gameId - Game ID
 * @param {Array} playerIds - Array of player user IDs for the home team
 */
async function insertLineupAndTactics(gameId, playerIds) {
  console.log('Inserting lineup and tactics...');

  const positions = [
    { pos: '投手', abbr: 'P' },
    { pos: '捕手', abbr: 'C' },
    { pos: '一垒手', abbr: '1B' },
    { pos: '二垒手', abbr: '2B' },
    { pos: '三垒手', abbr: '3B' },
    { pos: '游击手', abbr: 'SS' },
    { pos: '左外野', abbr: 'LF' },
    { pos: '中外野', abbr: 'CF' },
    { pos: '右外野', abbr: 'RF' }
  ];

  for (let i = 0; i < 9; i++) {
    const player = playerIds[i];
    if (!player) continue;
    await client.query(
      `INSERT INTO game_lineups (game_id, user_id, batting_order, position, jersey_number)
       VALUES ($1, $2, $3, $4, $5)`,
      [gameId, player, i + 1, positions[i].pos, (i + 1).toString()]
    );
  }

  await client.query(
    `INSERT INTO game_tactics (game_id, general_notes, signals, defense_strategy)
     VALUES ($1, $2, $3, $4)`,
    [
      gameId,
      '本场比赛重点防守对方强打者，游击手需要后撤防守深区。投手配球以外角球为主。',
      JSON.stringify({
        steal: '双触耳表示盗垒',
        bunt: '摸帽檐表示牺牲触击',
        hit_run: '拉腰带表示打带跑'
      }),
      '内野守备采用标准站位，双杀时二垒手优先覆盖垒包。外野手向左靠拢，因为对方左打者较多。'
    ]
  );

  console.log(`  - Created 9 lineup records and tactics for game ${gameId}`);
}

/**
 * Verify seed data was created correctly
 */
async function verifyData() {
  console.log('\nVerifying seed data...');

  const teamCount = await client.query('SELECT COUNT(*) FROM teams');
  const playerCount = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', ['player']);
  const adminCount = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
  const gameCount = await client.query('SELECT COUNT(*) FROM games');
  const attendanceCount = await client.query('SELECT COUNT(*) FROM game_attendance');
  const lineupCount = await client.query('SELECT COUNT(*) FROM game_lineups');
  const tacticsCount = await client.query('SELECT COUNT(*) FROM game_tactics');

  console.log(`  - Teams: ${teamCount.rows[0].count}`);
  console.log(`  - Players: ${playerCount.rows[0].count}`);
  console.log(`  - Admins: ${adminCount.rows[0].count}`);
  console.log(`  - Games: ${gameCount.rows[0].count}`);
  console.log(`  - Attendance: ${attendanceCount.rows[0].count}`);
  console.log(`  - Lineups: ${lineupCount.rows[0].count}`);
  console.log(`  - Tactics: ${tacticsCount.rows[0].count}`);

  // Verify team assignments
  const teamAPlayers = await client.query(
    'SELECT COUNT(*) FROM users WHERE team_id = 1 AND role = $1',
    ['player']
  );
  const teamBPlayers = await client.query(
    'SELECT COUNT(*) FROM users WHERE team_id = 2 AND role = $1',
    ['player']
  );

  console.log(`  - Team A players: ${teamAPlayers.rows[0].count}`);
  console.log(`  - Team B players: ${teamBPlayers.rows[0].count}`);

  return {
    teams: parseInt(teamCount.rows[0].count),
    players: parseInt(playerCount.rows[0].count),
    admins: parseInt(adminCount.rows[0].count),
    games: parseInt(gameCount.rows[0].count),
    attendance: parseInt(attendanceCount.rows[0].count),
    lineups: parseInt(lineupCount.rows[0].count),
    tactics: parseInt(tacticsCount.rows[0].count)
  };
}

/**
 * Main seed function
 */
async function run() {
  console.log('========================================');
  console.log('Joyful Baseball League - Database Seeder');
  console.log('========================================\n');

  try {
    // Connect to database
    console.log('Connecting to database...');
    await client.connect();
    console.log('  - Connected\n');

    // Start transaction
    await client.query('BEGIN');

    // Clear existing data
    await clearData();

    // Reset sequences
    await resetSequences();

    // Insert teams
    const teamIds = await insertTeams();

    // Insert players for each team
    const teamAUserIds = await insertPlayers(teamAPlayers, teamIds[0], 'Joyful A队');
    const teamBUserIds = await insertPlayers(teamBPlayers, teamIds[1], 'Joyful B队');
    const playerIds = [...teamAUserIds, ...teamBUserIds];

    // Assign captains
    await assignCaptains(teamIds, teamAUserIds, teamBUserIds);

    // Insert completed games for record calculation
    const completedGameIds = await insertCompletedGames(teamIds);

    // Insert scheduled games
    const gameIds = await insertGames(teamIds);

    // Insert E2E test user
    const e2eUserId = await insertE2EUser(teamIds[0]);

    // Insert attendance records for all players on all scheduled games
    await insertAttendance(gameIds, [...playerIds, e2eUserId]);

    // Insert lineup and tactics for the first scheduled game
    if (gameIds.length > 0) {
      await insertLineupAndTactics(gameIds[0], teamAUserIds.slice(0, 9));
    }

    // Insert admin
    await insertAdmin();

    // Commit transaction
    await client.query('COMMIT');

    // Verify data
    const stats = await verifyData();

    console.log('\n========================================');
    console.log('Seed completed successfully!');
    console.log('========================================');
    console.log(`Teams: ${stats.teams}`);
    console.log(`Players: ${stats.players} (10 per team)`);
    console.log(`Games: ${stats.games}`);
    console.log(`Attendance: ${stats.attendance}`);
    console.log(`Lineups: ${stats.lineups}`);
    console.log(`Tactics: ${stats.tactics}`);
    console.log(`Admin: ${stats.admins}`);
    console.log('\nSeed data summary complete.');
    console.log('  Use admin username to log in and complete first-login password change.');

  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('\n❌ Error seeding database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  run();
}

module.exports = { run };
