import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export const createUserController = (userService: UserService) => {
  const getUserProfile = (req: Request, res: Response) => {
    // User data is guaranteed to be loaded by requireUser middleware
    res.json(req.user!.appUser);
  };

  const updateUserProfile = async (req: Request, res: Response) => {
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
  };

  const registerUser = async (req: Request, res: Response) => {
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
  };

  return {
    getUserProfile,
    updateUserProfile,
    registerUser
  };
};
