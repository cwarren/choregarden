import { Router } from 'express';
import { ping, pingDeep, pingProtected } from '../controllers/healthController';

export const createHealthRoutes = (requireAuth: any) => {
  const router = Router();

  router.get('/ping', ping);
  router.get('/pingdeep', pingDeep);
  router.get('/pingprotected', requireAuth, pingProtected);

  // CORS options
  router.options('/pingprotected', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
    res.sendStatus(200);
  });

  return router;
};
