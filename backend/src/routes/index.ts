import { Router } from 'express';
import { createHealthRoutes } from './health';
import { createUserRoutes } from './users';
import { UserService } from '../services/UserService';

export const createRoutes = (userService: UserService, requireAuth: any, requireUser: any) => {
  const router = Router();

  // Mount route modules
  router.use('/api', createHealthRoutes(requireAuth));
  router.use('/api/user', createUserRoutes(userService, requireAuth, requireUser));

  return router;
};
