process.env.CHOREGARDEN_SECRETS = JSON.stringify({ NODE_ENV: 'test' });

import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import { app, pool, server } from './index';

describe('Trivial Test', () => {
  it('should always pass', () => {
    expect(true).toBe(true);
  });
});

describe('API Endpoint Tests', () => {
  it('should return 200 and a pong message for /api/ping', async () => {
    const response = await request(app).get('/api/ping');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('pong');
  });
});

afterAll(async () => {
  if (pool) {
    await pool.end();
  }
  server.close();
});


