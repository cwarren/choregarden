import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import { app } from './index'; // Assuming your Express app is exported as a named export

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


