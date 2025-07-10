import { Pool } from 'pg';
import { dbSecrets } from './environment';

const commonConfig = {
  ssl: { rejectUnauthorized: false }
};

export const pool = dbSecrets.DATABASE_URL
  ? new Pool({
      connectionString: dbSecrets.DATABASE_URL,
      ...commonConfig
    })
  : new Pool({
      user: dbSecrets.APP_DB_USER || 'unknown1',
      host: dbSecrets.POSTGRES_HOST || 'unknown2',
      database: dbSecrets.POSTGRES_DB || 'unknown3',
      password: dbSecrets.APP_DB_PASSWORD || 'unknown4',
      port: Number(dbSecrets.POSTGRES_PORT) || 5432,
      ...commonConfig
    });

export const connectWithRetry = (retries = 5, delay = 2000): void => {
  if (retries === 0) {
    console.error('Failed to connect to the database after multiple attempts.');
    process.exit(1);
  }

  pool.query('SELECT NOW()', (err: Error | null, res: { rows: { [key: string]: any }[] } | undefined) => {
    if (err) {
      console.error(`Database connection failed. Retrying in ${delay / 1000} seconds...`, err);
      setTimeout(() => connectWithRetry(retries - 1, delay), delay);
    } else {
      console.log('Database connected:', res?.rows[0]);
    }
  });
};
