import { execSync } from 'child_process';
import path from 'path';

const projectRoot = path.resolve(process.cwd(), '..');

export function seedDatabase(): void {
  execSync('node database/seeds/seed.js', {
    cwd: projectRoot,
    stdio: 'pipe',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/joyful_baseball',
    },
  });
}

export function insertNearFutureGame(): number {
  const output = execSync('node tests/e2e/scripts/insert-near-future-game.cjs', {
    cwd: path.resolve(projectRoot, 'frontend'),
    stdio: 'pipe',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/joyful_baseball',
      FORCE_COLOR: '0',
    },
  });
  // Strip any ANSI escape codes that Node may inject
  const str = output.toString().trim().replace(/\u001b\[\d+m/g, '');
  return parseInt(str, 10);
}

export function clearAllGames(): void {
  const script = `
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/joyful_baseball'
    });
    (async () => {
      await client.connect();
      await client.query('DELETE FROM game_attendance');
      await client.query('DELETE FROM games');
      await client.end();
    })();
  `;
  execSync(`node -e "${script.replace(/"/g, '\\"')}"`, {
    cwd: projectRoot,
    stdio: 'pipe',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/joyful_baseball',
    },
  });
}
