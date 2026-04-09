/**
 * E2E Authentication Seed Script
 * Creates a dedicated E2E test user with is_first_login = true
 * for testing the forced password-change flow.
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/joyful_baseball'
});

const E2E_USERS = [
  {
    username: 'e2e_first_login',
    password: 'testpass123',
    name: 'E2E First Login User',
    role: 'player',
    team_id: 1,
    is_first_login: true,
  },
  {
    username: 'e2e_normal_login',
    password: 'testpass123',
    name: 'E2E Normal User',
    role: 'player',
    team_id: null,
    is_first_login: false,
  },
  {
    username: 'e2e_team_user',
    password: 'testpass123',
    name: 'E2E Team User',
    role: 'player',
    team_id: 1,
    is_first_login: false,
  },
];

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function ensureTeamsExist() {
  const result = await client.query('SELECT COUNT(*) FROM teams');
  if (parseInt(result.rows[0].count, 10) === 0) {
    await client.query(
      "INSERT INTO teams (name, division) VALUES ('E2E Test Team', '大联盟')"
    );
  }
}

async function seedE2EUsers() {
  console.log('Seeding E2E auth users...');

  await ensureTeamsExist();

  for (const user of E2E_USERS) {
    const passwordHash = await hashPassword(user.password);

    await client.query(
      `INSERT INTO users (username, password_hash, name, role, team_id, status, is_first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (username) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         team_id = EXCLUDED.team_id,
         status = EXCLUDED.status,
         is_first_login = EXCLUDED.is_first_login`,
      [
        user.username,
        passwordHash,
        user.name,
        user.role,
        user.team_id,
        'active',
        user.is_first_login,
      ]
    );
    console.log(`  - ${user.username} (is_first_login=${user.is_first_login}, team_id=${user.team_id})`);
  }
}

async function run() {
  try {
    await client.connect();
    await seedE2EUsers();
    console.log('E2E auth seed completed.');
  } catch (err) {
    console.error('E2E auth seed failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  run();
}

module.exports = { run, E2E_USERS };
