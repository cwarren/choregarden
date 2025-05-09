import dotenv from 'dotenv';
dotenv.config();

describe('Trivial Test', () => {
  it('should always pass', () => {
    expect(true).toBe(true);
  });
});

import { Pool } from 'pg';

describe('Database Connection Test', () => {
  let pool: Pool | undefined;

  beforeAll(() => {
    const user = process.env.POSTGRES_USER;
    const host = process.env.POSTGRES_HOST;
    const database = process.env.POSTGRES_DB;
    const password = process.env.POSTGRES_PASSWORD;
    const port = process.env.POSTGRES_PORT;

    if (!user || !host || !database || !password || !port) {
      console.warn('Skipping database connection test due to missing environment variables.');
      return;
    }

    pool = new Pool({
      user,
      host,
      database,
      password,
      port: parseInt(port, 10),
    });
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  it('should connect to the database and execute a query', async () => {
    if (!pool) {
      console.warn('Skipping test due to missing database connection.');
      return;
    }

    const result = await pool.query('SELECT 1 AS result');
    expect(result.rows[0].result).toBe(1);
  });
});

