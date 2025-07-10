import dotenv from 'dotenv';
import fs from 'fs';

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

export const secrets = loadJsonEnv('CHOREGARDEN_SECRETS');
export const dbSecrets = loadJsonEnv('CHOREGARDEN_DB_SECRETS');

export const config = {
  port: Number(secrets.BACKEND_PORT) || 5000,
  host: '0.0.0.0',
  nodeEnv: secrets.NODE_ENV || 'development',
  cognito: {
    awsRegion: secrets.AWS_REGION || 'us-east-1',
    userPoolId: secrets.COGNITO_USER_POOL_ID,
    clientId: secrets.COGNITO_CLIENT_ID
  }
};

// Validate critical configuration
if (!config.cognito.userPoolId || !config.cognito.clientId) {
  console.error('Missing Cognito configuration:', config.cognito);
}
