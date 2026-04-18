import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = vi.hoisted(() => ({
  experience: {
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

const sampleExperience = {
  id: 1,
  company: 'Acme Corp',
  role: 'Software Engineer',
  description: 'Built things',
  startDate: '2023-01-01T00:00:00.000Z',
  endDate: null,
  current: true,
  order: 0,
};

describe('GET /api/experiences', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns list of experiences', async () => {
    mockPrisma.experience.findMany.mockResolvedValue([sampleExperience]);
    const res = await request(app).get('/api/experiences');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].company).toBe('Acme Corp');
  });
});

describe('POST /api/experiences', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/experiences').send({ company: 'X', role: 'Dev', startDate: '2023-01-01' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/experiences')
      .set('Cookie', authCookie())
      .send({ company: 'X' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid startDate', async () => {
    const res = await request(app)
      .post('/api/experiences')
      .set('Cookie', authCookie())
      .send({ company: 'X', role: 'Dev', startDate: 'not-a-date' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid startDate/);
  });

  it('returns 400 for invalid endDate', async () => {
    const res = await request(app)
      .post('/api/experiences')
      .set('Cookie', authCookie())
      .send({ company: 'X', role: 'Dev', startDate: '2023-01-01', endDate: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid endDate/);
  });

  it('creates experience and returns 201', async () => {
    mockPrisma.experience.create.mockResolvedValue(sampleExperience);
    const res = await request(app)
      .post('/api/experiences')
      .set('Cookie', authCookie())
      .send({ company: 'Acme Corp', role: 'Software Engineer', startDate: '2023-01-01', current: true });
    expect(res.status).toBe(201);
    expect(res.body.company).toBe('Acme Corp');
  });

  it('defaults current to false when not provided', async () => {
    mockPrisma.experience.create.mockResolvedValue({ ...sampleExperience, current: false });
    await request(app)
      .post('/api/experiences')
      .set('Cookie', authCookie())
      .send({ company: 'X', role: 'Dev', startDate: '2023-01-01' });
    expect(mockPrisma.experience.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ current: false }) })
    );
  });
});

describe('PUT /api/experiences/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/experiences/1').send({ company: 'X', role: 'Dev', startDate: '2023-01-01' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid startDate', async () => {
    const res = await request(app)
      .put('/api/experiences/1')
      .set('Cookie', authCookie())
      .send({ company: 'X', role: 'Dev', startDate: 'bad-date' });
    expect(res.status).toBe(400);
  });

  it('updates experience and returns 200', async () => {
    const updated = { ...sampleExperience, role: 'Senior Engineer' };
    mockPrisma.experience.update.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/experiences/1')
      .set('Cookie', authCookie())
      .send({ company: 'Acme Corp', role: 'Senior Engineer', startDate: '2023-01-01' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('Senior Engineer');
  });
});

describe('DELETE /api/experiences/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/experiences/1');
    expect(res.status).toBe(401);
  });

  it('deletes experience and returns 204', async () => {
    mockPrisma.experience.delete.mockResolvedValue(sampleExperience);
    const res = await request(app).delete('/api/experiences/1').set('Cookie', authCookie());
    expect(res.status).toBe(204);
  });
});

describe('PATCH /api/experiences/reorder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).patch('/api/experiences/reorder').send([]);
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is not an array', async () => {
    const res = await request(app)
      .patch('/api/experiences/reorder')
      .set('Cookie', authCookie())
      .send({ id: 1 });
    expect(res.status).toBe(400);
  });

  it('reorders experiences and returns ok', async () => {
    mockPrisma.experience.update.mockResolvedValue(sampleExperience);
    const res = await request(app)
      .patch('/api/experiences/reorder')
      .set('Cookie', authCookie())
      .send([{ id: 1, order: 0 }, { id: 2, order: 1 }]);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
