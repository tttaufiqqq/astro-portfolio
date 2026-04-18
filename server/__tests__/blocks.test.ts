import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = vi.hoisted(() => ({
  contentBlock: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: function() { return mockPrisma; },
}));

vi.mock('../lib/storage', () => ({
  deleteFile: vi.fn().mockResolvedValue(undefined),
  upload: vi.fn(),
}));

import app from '../app';

function authCookie(): string {
  const token = jwt.sign({ admin: true }, 'test-secret', { expiresIn: '1h' });
  return `token=${token}`;
}

const sampleBlock = {
  id: 1,
  projectId: 10,
  type: 'heading',
  order: 0,
  content: '{"text":"Hello","level":2}',
  language: null,
  imageUrl: null,
};

describe('GET /api/projects/:projectId/blocks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/projects/10/blocks');
    expect(res.status).toBe(401);
  });

  it('returns blocks with parsed content', async () => {
    mockPrisma.contentBlock.findMany.mockResolvedValue([sampleBlock]);
    const res = await request(app)
      .get('/api/projects/10/blocks')
      .set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].content).toEqual({ text: 'Hello', level: 2 });
  });

  it('returns empty array when project has no blocks', async () => {
    mockPrisma.contentBlock.findMany.mockResolvedValue([]);
    const res = await request(app)
      .get('/api/projects/10/blocks')
      .set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('POST /api/projects/:projectId/blocks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/projects/10/blocks')
      .send({ type: 'text', content: { html: 'hi' } });
    expect(res.status).toBe(401);
  });

  it('returns 400 when type is missing', async () => {
    const res = await request(app)
      .post('/api/projects/10/blocks')
      .set('Cookie', authCookie())
      .send({ content: { html: 'hi' } });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid block type', async () => {
    const res = await request(app)
      .post('/api/projects/10/blocks')
      .set('Cookie', authCookie())
      .send({ type: 'invalid', content: {} });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid block type/);
  });

  it('creates block and returns 201 with parsed content', async () => {
    const created = { ...sampleBlock, content: '{"text":"Hello","level":2}' };
    mockPrisma.contentBlock.create.mockResolvedValue(created);
    const res = await request(app)
      .post('/api/projects/10/blocks')
      .set('Cookie', authCookie())
      .send({ type: 'heading', order: 0, content: { text: 'Hello', level: 2 } });
    expect(res.status).toBe(201);
    expect(res.body.content).toEqual({ text: 'Hello', level: 2 });
  });

  it('accepts all valid block types', async () => {
    for (const type of ['heading', 'text', 'image', 'video', 'code']) {
      mockPrisma.contentBlock.create.mockResolvedValue({ ...sampleBlock, type, content: '{}' });
      const res = await request(app)
        .post('/api/projects/10/blocks')
        .set('Cookie', authCookie())
        .send({ type, content: {} });
      expect(res.status).toBe(201);
    }
  });
});

describe('PATCH /api/projects/:projectId/blocks/reorder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).patch('/api/projects/10/blocks/reorder').send([]);
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is not an array', async () => {
    const res = await request(app)
      .patch('/api/projects/10/blocks/reorder')
      .set('Cookie', authCookie())
      .send({ id: 1, order: 0 });
    expect(res.status).toBe(400);
  });

  it('reorders blocks and returns ok', async () => {
    mockPrisma.contentBlock.update.mockResolvedValue(sampleBlock);
    const res = await request(app)
      .patch('/api/projects/10/blocks/reorder')
      .set('Cookie', authCookie())
      .send([{ id: 1, order: 0 }, { id: 2, order: 1 }]);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
