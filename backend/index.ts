import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Debug: Output the raw CHOREGARDEN_SECRETS env variable
// console.log('DEBUG: process.env.CHOREGARDEN_SECRETS:', process.env.CHOREGARDEN_SECRETS ? '[secrets set]' : '[secrets not set]');
// if (process.env.CHOREGARDEN_SECRETS) {
//   try {
//     JSON.parse(process.env.CHOREGARDEN_SECRETS);
//     console.log('DEBUG: CHOREGARDEN_SECRETS is valid JSON');
//   } catch (e) {
//     console.error('DEBUG: CHOREGARDEN_SECRETS is not valid JSON:', e);
//   }
// }

// Parse secrets from CHOREGARDEN_SECRETS env variable
const secrets = process.env.CHOREGARDEN_SECRETS ? JSON.parse(process.env.CHOREGARDEN_SECRETS) : {};
if (secrets.NODE_ENV === 'development') {
  console.log('DEBUG: Parsed secrets:', secrets);
}

const app = express();
const port = Number(secrets.BACKEND_PORT) || 5000;
const host = '0.0.0.0'; // <-- Bind to all interfaces

// Enable CORS
app.use(cors());

// PostgreSQL connection setup using secrets from CHOREGARDEN_SECRETS

// Wrap sensitive console.log statements in a condition to check for development environment
if (secrets.NODE_ENV === 'development') {
  console.log('Resolved database host:', secrets.POSTGRES_HOST || 'database');
  console.log('DB connection config:', secrets.DATABASE_URL ? { connectionString: secrets.DATABASE_URL } : {
    user: secrets.APP_DB_USER,
    host: secrets.POSTGRES_HOST,
    database: secrets.POSTGRES_DB,
    password: secrets.APP_DB_PASSWORD,
    port: Number(secrets.POSTGRES_PORT)
  });
}
const pool = secrets.DATABASE_URL
  ? new Pool({ connectionString: secrets.DATABASE_URL })
  : new Pool({
    user: secrets.APP_DB_USER || 'unknown1',
    host: secrets.POSTGRES_HOST || 'unknown2',
    database: secrets.POSTGRES_DB || 'unknown3',
    password: secrets.APP_DB_PASSWORD || 'unknown4',
    port: Number(secrets.POSTGRES_PORT) || 5432,
  });


// Retry logic for database connection
const connectWithRetry = (retries = 5, delay = 2000): void => {
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

// Call the retry logic only in non-test environments
if (secrets.NODE_ENV !== 'test') {
  connectWithRetry();
}

// Basic API endpoints
app.get('/api/ping', (req: express.Request, res: express.Response) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`Received /api/ping request from ${ip}`);
  res.json({ message: 'pong' });
});
app.get('/api/pingdeep', (req: express.Request, res: express.Response) => {
  pool.query('SELECT NOW()', (err: Error | null, result: { rows: { [key: string]: any }[] } | undefined) => {
    if (err) {
      console.error('Error executing query', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log('Database query result:', result?.rows[0]);
    res.json({ message: 'pong with DB connection', time: result?.rows[0] });
  });
});

const server = app.listen(port, host, () => {
  console.log(`Backend server is running on http://${host}:${port}`);
});

export { app, pool, server };
// export { app, server };