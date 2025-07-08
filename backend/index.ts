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

// =================================
// MIDDLEWARES
// =================================

// Authentication middleware that detects API Gateway vs direct backend calls at runtime
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Check if request came through API Gateway (has specific headers)
  const hasApiGatewayHeaders = req.headers['x-amzn-requestid'] || req.headers['x-amz-cf-id'];
  
  if (hasApiGatewayHeaders) {
    // API Gateway request - extract user info from JWT token (already validated by API Gateway)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        // Set user info for API Gateway requests
        req.user = {
          cognitoUserId: payload.sub,
          email: payload.email,
          appUser: null // Will be looked up by endpoint if needed
        };
        
        next();
      } catch (error) {
        console.error('Error parsing JWT payload:', error);
        return res.status(401).json({ error: 'Invalid token format' });
      }
    } else {
      return res.status(401).json({ error: 'No authorization header' });
    }
  } else {
    // Direct backend call - use full JWT validation (includes user creation for backwards compatibility)
    const fullAuthMiddleware = authenticateAndCreateUser(userService, cognitoConfig);
    fullAuthMiddleware(req, res, next);
  }
};

// Middleware to ensure user data is loaded (for endpoints that require it)
const requireUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // For API Gateway requests, look up existing user if not already loaded
  if (req.user && !req.user.appUser) {
    try {
      req.user.appUser = await userService.findByCognitoId(req.user.cognitoUserId);
    } catch (error) {
      console.error('Error looking up user:', error);
      return res.status(500).json({ error: 'Failed to look up user' });
    }
  }
  
  // Ensure user exists
  if (!req.user?.appUser) {
    return res.status(404).json({ error: 'User not found. Please register first.' });
  }
  
  next();
};

// =================================
// STATUS ENDPOINTS
// =================================


app.get('/api/ping', (req: express.Request, res: express.Response) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`Received /api/ping request from ${ip}`);
  res.json({ message: 'pong, BE20250708.3' });
});

app.get('/api/pingdeep', (req: express.Request, res: express.Response) => {
  pool.query('select now() as curtime, max(version) as schemaversion from flyway_schema_history', (err: Error | null, result: { rows: { [key: string]: any }[] } | undefined) => {
    if (err) {
      console.error('Error executing query', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log('Database query result:', result?.rows[0]);
    res.json({ message: 'pong with DB connection', 
              time: result?.rows[0].curtime, 
              schemaVersion: result?.rows[0].schemaversion });
  });
});

app.get('/api/pingprotected', requireAuth, async (req: express.Request, res: express.Response) => {
  // This is just a protected health check - no need to look up user data
  res.json({ 
    message: 'pong (protected)', 
    cognitoId: req.user?.cognitoUserId 
  });
});

app.options('/api/pingprotected', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  res.sendStatus(200);
});


// =================================
// APPLICATION ENDPOINTS
// =================================

// ---------------------------------
// User endpoints
// ---------------------------------

// User profile endpoint
app.get('/api/user/profile', requireAuth, requireUser, async (req: express.Request, res: express.Response) => {
  // User data is guaranteed to be loaded by requireUser middleware
  res.json(req.user!.appUser);
});

// Update user profile endpoint
app.put('/api/user/profile', requireAuth, requireUser, async (req: express.Request, res: express.Response) => {
  // User data is guaranteed to be loaded by requireUser middleware
  const { displayName } = req.body;
  
  try {
    const updatedUser = await userService.updateUser(req.user!.cognitoUserId, { displayName });
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// User registration endpoint (called after Cognito signup/login)
app.post('/api/user/register', requireAuth, async (req: express.Request, res: express.Response) => {
  // Explicitly create/update user only in this endpoint
  if (req.user && !req.user.appUser) {
    try {
      req.user.appUser = await userService.getOrCreateUserFromToken({
        sub: req.user.cognitoUserId,
        email: req.user.email
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }
  
  res.json({
    message: 'User registered successfully',
    user: req.user?.appUser
  });
});

app.options('/api/user/register', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  res.sendStatus(200);
});

app.options('/api/user/profile', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  res.sendStatus(200);
});

// =================================
// GO TIME !!!
// =================================

const server = app.listen(port, host, () => {
  console.log(`Backend server is running on http://${host}:${port}`);
});

export { app, pool, server };
