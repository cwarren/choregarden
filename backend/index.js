const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
// Load environment variables from .env file
require('dotenv').config();

const app = express();
const port = process.env.BACKEND_PORT || 5000;

// Enable CORS
app.use(cors());

// PostgreSQL connection setup
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      user: process.env.APP_DB_USER || 'unknown1',
      host: process.env.POSTGRES_HOST || 'unknown2', // Use Docker service name
      database: process.env.POSTGRES_DB || 'unknown3',
      password: process.env.APP_DB_PASSWORD || 'unknown4',
      port: process.env.POSTGRES_PORT || 5432,
    });

// Explicitly log the resolved host value
console.log('Resolved database host:', process.env.POSTGRES_HOST || 'database');

// Log the database connection configuration
console.log('Database connection configuration:', {
  user: process.env.APP_DB_USER || 'unknown1',
  host: process.env.POSTGRES_HOST || 'unknown2',
  database: process.env.POSTGRES_DB || 'unknown3',
  password: process.env.APP_DB_PASSWORD || 'unknown4',
  port: process.env.POSTGRES_PORT || 5432,
});

// Retry logic for database connection
const connectWithRetry = (retries = 5, delay = 2000) => {
  if (retries === 0) {
    console.error('Failed to connect to the database after multiple attempts.');
    process.exit(1);
  }

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error(`Database connection failed. Retrying in ${delay / 1000} seconds...`, err);
      setTimeout(() => connectWithRetry(retries - 1, delay), delay);
    } else {
      console.log('Database connected:', res.rows[0]);
    }
  });
};

// Call the retry logic
connectWithRetry();

// Basic API endpoint
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});