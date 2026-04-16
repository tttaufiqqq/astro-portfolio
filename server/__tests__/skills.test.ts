import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = vi.hoisted(() => ({
  skill: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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

const sampleSkill = { id: 1, name: 'TypeScript', category: 'Language', icon: 'SiTypescript', order: 0 };

describe('GET /api/skills', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns list of skills', async () => {
    mockPrisma.skill.findMany.mockResolvedValue([sampleSkill]);
    const res = await request(app).get('/api/skills');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('TypeScript');
  });
});

describe('POST /api/skills', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/skills').send({ name: 'React', category: 'Frontend' });
    expect(res.status).toBe(401);
  });

  it('creates skill and returns 201', async () => {
    mockPrisma.skill.create.mockResolvedValue(sampleSkill);
    const res = await request(app)
      .post('/api/skills')
      .set('Cookie', authCookie())
      .send({ name: 'TypeScript', category: 'Language', icon: 'SiTypescript' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('TypeScript');
  });

  it('defaults order to 0 when not provided', async () => {
    mockPrisma.skill.create.mockResolvedValue(sampleSkill);
    await request(app)
      .post('/api/skills')
      .set('Cookie', authCookie())
      .send({ name: 'TypeScript', category: 'Language' });
    expect(mockPrisma.skill.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ order: 0 }) })
    );
  });
});

describe('PUT /api/skills/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/skills/1').send({ name: 'Updated' });
    expect(res.status).toBe(401);
  });

  it('updates skill', async () => {
    const updated = { ...sampleSkill, name: 'JavaScript' };
    mockPrisma.skill.update.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/skills/1')
      .set('Cookie', authCookie())
      .send({ name: 'JavaScript', category: 'Language', order: 1 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('JavaScript');
  });
});

describe('DELETE /api/skills/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/skills/1');
    expect(res.status).toBe(401);
  });

  it('deletes skill and returns 204', async () => {
    mockPrisma.skill.delete.mockResolvedValue(sampleSkill);
    const res = await request(app).delete('/api/skills/1').set('Cookie', authCookie());
    expect(res.status).toBe(204);
  });
});

describe('PATCH /api/skills/reorder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).patch('/api/skills/reorder').send([]);
    expect(res.status).toBe(401);
  });

  it('reorders skills and returns ok', async () => {
    mockPrisma.skill.update.mockResolvedValue(sampleSkill);
    const res = await request(app)
      .patch('/api/skills/reorder')
      .set('Cookie', authCookie())
      .send([{ id: 1, order: 0 }, { id: 2, order: 1 }]);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
