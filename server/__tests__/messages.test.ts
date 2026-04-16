import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = vi.hoisted(() => ({
  message: {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: function() { return mockPrisma; },
}));

import app from '../app';

function authCookie(): string {
  const token = jwt.sign({ admin: true }, 'test-secret', { expiresIn: '1h' });
  return `token=${token}`;
}

const sampleMessage = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  message: 'Hello!',
  createdAt: new Date().toISOString(),
};

describe('POST /api/messages (contact form — public)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates message and returns 201', async () => {
    mockPrisma.message.create.mockResolvedValue(sampleMessage);
    const res = await request(app)
      .post('/api/messages')
      .send({ name: 'Alice', email: 'alice@example.com', message: 'Hello!' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Alice');
  });

  it('does not require auth', async () => {
    mockPrisma.message.create.mockResolvedValue(sampleMessage);
    const res = await request(app)
      .post('/api/messages')
      .send({ name: 'Bob', email: 'bob@example.com', message: 'Hi' });
    expect(res.status).toBe(201);
  });
});

describe('GET /api/messages (admin only)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/messages');
    expect(res.status).toBe(401);
  });

  it('returns messages list for authenticated admin', async () => {
    mockPrisma.message.findMany.mockResolvedValue([sampleMessage]);
    const res = await request(app).get('/api/messages').set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].email).toBe('alice@example.com');
  });
});

describe('DELETE /api/messages/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/messages/1');
    expect(res.status).toBe(401);
  });

  it('deletes message and returns 204', async () => {
    mockPrisma.message.delete.mockResolvedValue(sampleMessage);
    const res = await request(app).delete('/api/messages/1').set('Cookie', authCookie());
    expect(res.status).toBe(204);
  });
});
