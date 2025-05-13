import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 5000;

// Enable CORS
app.use(cors());

// PostgreSQL connection setup
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      user: process.env.APP_DB_USER || 'unknown1',
      host: process.env.POSTGRES_HOST || 'unknown2',
      database: process.env.POSTGRES_DB || 'unknown3',
      password: process.env.APP_DB_PASSWORD || 'unknown4',
      port: Number(process.env.POSTGRES_PORT) || 5432,
    });

// Wrap sensitive console.log statements in a condition to check for development environment
if (process.env.NODE_ENV === 'development') {
  console.log('Resolved database host:', process.env.POSTGRES_HOST || 'database');
  console.log('Database connection configuration:', {
    user: process.env.APP_DB_USER || 'unknown1',
    host: process.env.POSTGRES_HOST || 'unknown2',
    database: process.env.POSTGRES_DB || 'unknown3',
    password: process.env.APP_DB_PASSWORD || 'unknown4',
    port: Number(process.env.POSTGRES_PORT) || 5432,
  });
}

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
if (process.env.NODE_ENV !== 'test') {
  connectWithRetry();
}

// Basic API endpoints
app.get('/api/ping', (req: express.Request, res: express.Response) => {
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

const server = app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

export { app, pool, server };