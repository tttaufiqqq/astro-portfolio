import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock bcrypt — we test route logic, not bcrypt itself
vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn() },
}));

// Prisma not used in auth routes, but mock to avoid DB connection
vi.mock('@prisma/client', () => ({
  PrismaClient: function() { return {}; },
}));

import bcrypt from 'bcryptjs';
import app from '../app';

function authCookie(): string {
  const token = jwt.sign({ admin: true }, 'test-secret', { expiresIn: '1h' });
  return `token=${token}`;
}

describe('POST /api/auth/login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 401 when password is wrong', async () => {
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    const res = await request(app).post('/api/auth/login').send({ password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 200 and sets cookie when password is correct', async () => {
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const res = await request(app).post('/api/auth/login').send({ password: 'testpassword' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged in');
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out');
  });
});

describe('GET /api/auth/check', () => {
  it('returns authenticated: false when no token', async () => {
    const res = await request(app).get('/api/auth/check');
    expect(res.status).toBe(200);
    expect(res.body.authenticated).toBe(false);
  });

  it('returns authenticated: false for invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/check')
      .set('Cookie', 'token=bad.token.value');
    expect(res.status).toBe(200);
    expect(res.body.authenticated).toBe(false);
  });

  it('returns authenticated: true for valid token', async () => {
    const res = await request(app)
      .get('/api/auth/check')
      .set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body.authenticated).toBe(true);
  });
});
