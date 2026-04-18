import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = vi.hoisted(() => ({
  message: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
}));

const mockResendSend = vi.hoisted(() => vi.fn());

vi.mock('@prisma/client', () => ({
  PrismaClient: function() { return mockPrisma; },
}));

vi.mock('resend', () => ({
  Resend: function() {
    return { emails: { send: mockResendSend } };
  },
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

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ name: 'Alice', message: 'Hello!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ email: 'alice@example.com', message: 'Hello!' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when message body is missing', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ name: 'Alice', email: 'alice@example.com' });
    expect(res.status).toBe(400);
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

describe('POST /api/messages/:id/reply', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/messages/1/reply').send({ body: 'Hi!' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is missing', async () => {
    const res = await request(app)
      .post('/api/messages/1/reply')
      .set('Cookie', authCookie())
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/body/);
  });

  it('returns 404 when message does not exist', async () => {
    mockPrisma.message.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/messages/99/reply')
      .set('Cookie', authCookie())
      .send({ body: 'Hi!' });
    expect(res.status).toBe(404);
  });

  it('returns 204 on successful reply', async () => {
    mockPrisma.message.findUnique.mockResolvedValue(sampleMessage);
    mockResendSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    const res = await request(app)
      .post('/api/messages/1/reply')
      .set('Cookie', authCookie())
      .send({ body: 'Thanks for reaching out!' });
    expect(res.status).toBe(204);
  });

  it('returns 500 when Resend returns an error', async () => {
    mockPrisma.message.findUnique.mockResolvedValue(sampleMessage);
    mockResendSend.mockResolvedValue({ data: null, error: { message: 'Domain not verified' } });
    const res = await request(app)
      .post('/api/messages/1/reply')
      .set('Cookie', authCookie())
      .send({ body: 'Hi!' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Domain not verified');
  });
});

describe('POST /api/messages — validation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ name: 'Alice', email: 'not-an-email', message: 'Hello!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid email/);
  });

  it('returns 400 when message exceeds 5000 characters', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ name: 'Alice', email: 'alice@example.com', message: 'x'.repeat(5001) });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/5000/);
  });

  it('accepts message at exactly 5000 characters', async () => {
    mockPrisma.message.create.mockResolvedValue(sampleMessage);
    const res = await request(app)
      .post('/api/messages')
      .send({ name: 'Alice', email: 'alice@example.com', message: 'x'.repeat(5000) });
    expect(res.status).toBe(201);
  });
});

describe('GET /api/messages/unread-count', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/messages/unread-count');
    expect(res.status).toBe(401);
  });

  it('returns unread count', async () => {
    mockPrisma.message.count.mockResolvedValue(3);
    const res = await request(app)
      .get('/api/messages/unread-count')
      .set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
  });
});

describe('POST /api/messages/read-all', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/messages/read-all');
    expect(res.status).toBe(401);
  });

  it('marks all messages as read and returns 204', async () => {
    mockPrisma.message.updateMany.mockResolvedValue({ count: 2 });
    const res = await request(app)
      .post('/api/messages/read-all')
      .set('Cookie', authCookie());
    expect(res.status).toBe(204);
    expect(mockPrisma.message.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { read: true } })
    );
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
