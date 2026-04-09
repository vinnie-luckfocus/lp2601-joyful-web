const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/joyful_baseball'
});

(async () => {
  await client.connect();
  const teams = await client.query('SELECT id FROM teams ORDER BY id LIMIT 2');
  if (teams.rows.length < 2) {
    console.error('Need at least 2 teams');
    process.exit(1);
  }
  const homeTeamId = teams.rows[0].id;
  const awayTeamId = teams.rows[1].id;

  const gameResult = await client.query(
    `INSERT INTO games (scheduled_at, location, home_team_id, away_team_id, status)
     VALUES (NOW() + INTERVAL '1 hour', '测试球场', $1, $2, 'scheduled')
     RETURNING id`,
    [homeTeamId, awayTeamId]
  );
  const gameId = gameResult.rows[0].id;

  const players = await client.query("SELECT id FROM users WHERE role = 'player'");
  for (const player of players.rows) {
    await client.query(
      `INSERT INTO game_attendance (game_id, user_id, status)
       VALUES ($1, $2, 'pending')`,
      [gameId, player.id]
    );
  }

  console.log(gameId);
  await client.end();
})();
