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
  { name: 'Joyful A队', division: '大联盟' },
  { name: 'Joyful B队', division: '大联盟' }
];

// Players for Team A (9 players)
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

// Players for Team B (9 players)
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

// Games schedule (4 weeks, Saturdays at 14:00)
const games = [
  {
    scheduled_at: '2025-04-12 14:00:00+08',
    location: 'A球场',
    home_team_index: 0,
    away_team_index: 1,
    status: 'scheduled'
  },
  {
    scheduled_at: '2025-04-19 14:00:00+08',
    location: 'B球场',
    home_team_index: 1,
    away_team_index: 0,
    status: 'scheduled'
  },
  {
    scheduled_at: '2025-04-26 14:00:00+08',
    location: 'A球场',
    home_team_index: 0,
    away_team_index: 1,
    status: 'scheduled'
  },
  {
    scheduled_at: '2025-05-03 14:00:00+08',
    location: 'B球场',
    home_team_index: 1,
    away_team_index: 0,
    status: 'scheduled'
  }
];

// Admin user
const adminUser = {
  username: 'admin',
  password: 'admin123',
  name: '系统管理员',
  role: 'admin'
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
    'video_highlights_id_seq'
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
      'INSERT INTO teams (name, division) VALUES ($1, $2) RETURNING id',
      [team.name, team.division]
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
 */
async function insertPlayers(players, teamId, teamName) {
  console.log(`Inserting players for ${teamName}...`);

  for (const player of players) {
    const passwordHash = await hashPassword(player.jersey_number.toString());

    await client.query(
      `INSERT INTO users (username, password_hash, name, team_id, jersey_number, position, role, status, is_first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
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
    console.log(`  - ${player.name} (#${player.jersey_number}, ${player.position})`);
  }
}

/**
 * Insert games
 * @param {Array} teamIds - Array of team IDs
 */
async function insertGames(teamIds) {
  console.log('Inserting games...');

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
    console.log(`  - Game ${result.rows[0].id}: ${game.scheduled_at} at ${game.location}`);
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
 * Verify seed data was created correctly
 */
async function verifyData() {
  console.log('\nVerifying seed data...');

  const teamCount = await client.query('SELECT COUNT(*) FROM teams');
  const playerCount = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', ['player']);
  const adminCount = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
  const gameCount = await client.query('SELECT COUNT(*) FROM games');

  console.log(`  - Teams: ${teamCount.rows[0].count}`);
  console.log(`  - Players: ${playerCount.rows[0].count}`);
  console.log(`  - Admins: ${adminCount.rows[0].count}`);
  console.log(`  - Games: ${gameCount.rows[0].count}`);

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
    games: parseInt(gameCount.rows[0].count)
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
    await insertPlayers(teamAPlayers, teamIds[0], 'Joyful A队');
    await insertPlayers(teamBPlayers, teamIds[1], 'Joyful B队');

    // Insert games
    await insertGames(teamIds);

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
    console.log(`Games: ${stats.games} (4 weeks schedule)`);
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
