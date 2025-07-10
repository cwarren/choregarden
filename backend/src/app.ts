import express from 'express';
import cors from 'cors';
import { pool, connectWithRetry } from './config/database';
import { config } from './config/environment';
import { UserService } from './services/UserService';
import { createAuthMiddleware, createUserMiddleware } from './middleware';
import { createRoutes } from './routes';

export const createApp = () => {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());

  // Initialize database connection (only in non-test environments)
  if (config.nodeEnv !== 'test') {
    connectWithRetry();
  }

  // Initialize services
  const userService = new UserService(pool);

  // Initialize middleware
  const { requireAuth } = createAuthMiddleware(userService);
  const { requireUser, loadUser } = createUserMiddleware(userService);

  // Mount routes
  app.use(createRoutes(userService, requireAuth, requireUser));

  return { app, pool };
};

export { pool };
