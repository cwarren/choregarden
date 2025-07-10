import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { config } from '../config/environment';
import '../types/express'; // Import type extensions

export const createAuthMiddleware = (userService: UserService) => {
  const authService = new AuthService(config.cognito);

  // Full authentication middleware for direct backend calls
  const authenticateAndCreateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No valid authorization header' });
      }

      const token = authHeader.split(' ')[1];

      // Verify JWT token using AuthService
      const decoded = await authService.validateCognitoToken(token);

      // Get or create user in application database
      const appUser = await userService.getOrCreateUserFromToken(decoded);

      // Extract user info and add to request
      const userInfo = authService.extractUserInfoFromDecodedToken(decoded);
      req.user = {
        cognitoUserId: userInfo.cognitoUserId,
        email: userInfo.email,
        appUser: appUser
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Authentication middleware that detects API Gateway vs direct backend calls at runtime
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    // Check if request came through API Gateway (check multiple possible headers)
    const hasApiGatewayHeaders = req.headers['x-amzn-requestid'] || 
                                req.headers['x-amz-cf-id'] || 
                                req.headers['x-amzn-trace-id'] ||
                                req.headers['via']?.includes('AmazonAPIGateway');
    
    if (hasApiGatewayHeaders) {
      // API Gateway request - API Gateway should have already validated the JWT
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          
          // For API Gateway, we just need to extract user info (no validation needed)
          const userInfo = authService.extractUserInfoFromToken(token);
          
          // Set user info for API Gateway requests
          req.user = {
            cognitoUserId: userInfo.cognitoUserId,
            email: userInfo.email,
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
      // Direct backend call - use full JWT validation
      authenticateAndCreateUser(req, res, next);
    }
  };

  return { requireAuth };
};
