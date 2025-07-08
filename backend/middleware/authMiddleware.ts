// Enhanced authentication middleware that creates/updates users
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { UserService } from '../services/UserService';

// Configuration interface for Cognito settings
interface CognitoConfig {
  awsRegion: string;
  userPoolId: string;
  clientId: string;
}

// Extend Request type to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        cognitoUserId: string;
        email: string;
        appUser: any; // Your application user from database
      };
    }
  }
}

function createJwksClient(config: CognitoConfig) {
  return jwksClient({
    jwksUri: `https://cognito-idp.${config.awsRegion}.amazonaws.com/${config.userPoolId}/.well-known/jwks.json`
  });
}

function getKey(client: jwksClient.JwksClient) {
  return (header: any, callback: (err: any, key?: string) => void) => {
    client.getSigningKey(header.kid, (err: any, key: any) => {
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  };
}

export const authenticateAndCreateUser = (userService: UserService, config: CognitoConfig) => {
  const client = createJwksClient(config);
  const getKeyFunction = getKey(client);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No valid authorization header' });
      }

      const token = authHeader.split(' ')[1];

      // Verify JWT token
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, getKeyFunction, {
          audience: config.clientId,
          issuer: `https://cognito-idp.${config.awsRegion}.amazonaws.com/${config.userPoolId}`,
          algorithms: ['RS256']
        }, (err: any, decoded: any) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      }) as any;

      // Get or create user in application database
      const appUser = await userService.getOrCreateUserFromToken(decoded);

      // Add user info to request
      req.user = {
        cognitoUserId: decoded.sub,
        email: decoded.email,
        appUser: appUser
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};
