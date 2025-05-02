const request = require('supertest');
const express = require('express');

const app = express();
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

describe('GET /api/ping', () => {
  it('should return pong', async () => {
    const response = await request(app).get('/api/ping');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('pong');
  });
});