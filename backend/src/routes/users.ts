import { Router } from 'express';
import { createUserController } from '../controllers/userController';
import { UserService } from '../services/UserService';

export const createUserRoutes = (userService: UserService, requireAuth: any, requireUser: any) => {
  const router = Router();
  const userController = createUserController(userService);

  // User profile endpoints
  router.get('/profile', requireAuth, requireUser, userController.getUserProfile);
  router.put('/profile', requireAuth, requireUser, userController.updateUserProfile);

  // User registration endpoint
  router.post('/register', requireAuth, userController.registerUser);

  // CORS options
  router.options('/register', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
    res.sendStatus(200);
  });

  router.options('/profile', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
    res.sendStatus(200);
  });

  return router;
};
