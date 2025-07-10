import { Request, Response } from 'express';
import { pool } from '../config/database';

export const ping = (req: Request, res: Response) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`Received /api/ping request from ${ip}`);
  res.json({ message: 'pong, BE20250710.1' });
};

export const pingDeep = (req: Request, res: Response) => {
  pool.query('select now() as curtime, max(version) as schemaversion from flyway_schema_history', (err: Error | null, result: { rows: { [key: string]: any }[] } | undefined) => {
    if (err) {
      console.error('Error executing query', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log('Database query result:', result?.rows[0]);
    res.json({ 
      message: 'pong with DB connection', 
      time: result?.rows[0].curtime, 
      schemaVersion: result?.rows[0].schemaversion 
    });
  });
};

export const pingProtected = (req: Request, res: Response) => {
  // This is just a protected health check - no need to look up user data
  res.json({ 
    message: 'pong (protected)', 
    cognitoId: req.user?.cognitoUserId 
  });
};
