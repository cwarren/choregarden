import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { UserService } from './services/UserService';
import { authenticateAndCreateUser } from './middleware/authMiddleware';

dotenv.config();

// Utility to load secrets from env or fallback to .env.json
function loadJsonEnv(varName: string): any {
  try {
    if (process.env[varName]) {
      console.log(`DEBUG: ${varName} loaded from environment`);
      return JSON.parse(process.env[varName]!);
    }
    // Fallback: try loading from .env.json for local development
    const raw = fs.readFileSync('./.env.json', 'utf-8');
    const parsed = JSON.parse(raw);
    console.log(`DEBUG: ${varName} loaded from .env.json`);
    return parsed;
  } catch (err) {
    console.error(`ERROR: Failed to load ${varName}`, err);
    return {};
  }
}

const secrets = loadJsonEnv('CHOREGARDEN_SECRETS');
const dbSecrets = loadJsonEnv('CHOREGARDEN_DB_SECRETS');

// if (secrets.NODE_ENV === 'development' || true) {
//   console.log('DEBUG: Parsed secrets:', secrets);
//   console.log('DEBUG: Parsed dbSecrets:', dbSecrets);
// }

const app = express();
const port = Number(secrets.BACKEND_PORT) || 5000;
const host = '0.0.0.0'; // <-- Bind to all interfaces

app.use(cors());

// if (secrets.NODE_ENV === 'development') {
//   console.log('Resolved database host:', dbSecrets.POSTGRES_HOST);
//   console.log('DB connection config:', dbSecrets.DATABASE_URL ? { connectionString: dbSecrets.DATABASE_URL } : {
//     user: dbSecrets.APP_DB_USER,
//     host: dbSecrets.POSTGRES_HOST,
//     database: dbSecrets.POSTGRES_DB,
//     password: dbSecrets.APP_DB_PASSWORD,
//     port: Number(dbSecrets.POSTGRES_PORT)
//   });
// }

const commonConfig = {
  ssl: { rejectUnauthorized: false }
};

const pool = dbSecrets.DATABASE_URL
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

if (secrets.NODE_ENV !== 'test') {
  connectWithRetry();
}

// Initialize UserService
const userService = new UserService(pool);

// Cognito configuration
const cognitoConfig = {
  awsRegion: secrets.AWS_REGION || 'us-east-1',
  userPoolId: secrets.COGNITO_USER_POOL_ID,
  clientId: secrets.COGNITO_CLIENT_ID
};

// Check that Cognito config is loaded
if (!cognitoConfig.userPoolId || !cognitoConfig.clientId) {
  console.error('Missing Cognito configuration:', cognitoConfig);
}

const authMiddleware = authenticateAndCreateUser(userService, cognitoConfig);

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

app.get('/api/pingprotected', authMiddleware, (req: express.Request, res: express.Response) => {
  // This endpoint now creates/updates users automatically and provides user info
  res.json({ 
    message: 'pong (protected)', 
    user: req.user?.appUser,
    cognitoId: req.user?.cognitoUserId 
  });
});

// User profile endpoint
app.get('/api/user/profile', authMiddleware, (req: express.Request, res: express.Response) => {
  res.json(req.user?.appUser);
});

// User registration endpoint (called after Cognito signup/login)
app.post('/api/user/register', authMiddleware, (req: express.Request, res: express.Response) => {
  // This endpoint will automatically create the user via the authMiddleware
  // and return the created user data
  res.json({
    message: 'User registered successfully',
    user: req.user?.appUser
  });
});

// Update user profile endpoint
app.put('/api/user/profile', authMiddleware, (req: express.Request, res: express.Response) => {
  const { displayName } = req.body;
  
  userService.updateUser(req.user!.cognitoUserId, { displayName })
    .then(updatedUser => {
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(error => {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    });
});

app.options('/api/pingprotected', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  res.sendStatus(200);
});

const server = app.listen(port, host, () => {
  console.log(`Backend server is running on http://${host}:${port}`);
});

export { app, pool, server };
