import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

export const createUserMiddleware = (userService: UserService) => {
  // Middleware to ensure user data is loaded (for endpoints that require it)
  const requireUser = async (req: Request, res: Response, next: NextFunction) => {
    // First, ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For API Gateway requests, look up existing user if not already loaded
    if (!req.user.appUser) {
      try {
        req.user.appUser = await userService.findByCognitoId(req.user.cognitoUserId);
      } catch (error) {
        console.error('Error looking up user:', error);
        return res.status(500).json({ error: 'Failed to look up user' });
      }
    }
    
    // Ensure user exists in our database
    if (!req.user.appUser) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }
    
    next();
  };

  // Middleware to load user data if available (but don't require it)
  const loadUser = async (req: Request, res: Response, next: NextFunction) => {
    // Only try to load if user is authenticated but app user data isn't loaded
    if (req.user && !req.user.appUser) {
      try {
        req.user.appUser = await userService.findByCognitoId(req.user.cognitoUserId);
      } catch (error) {
        console.error('Error loading user:', error);
        // Don't fail the request, just continue without user data
      }
    }
    
    next();
  };

  return { requireUser, loadUser };
};
