import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = vi.hoisted(() => ({
  project: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: function() { return mockPrisma; },
}));

vi.mock('../lib/blob', () => ({
  deleteFromBlob: vi.fn().mockResolvedValue(undefined),
  uploadToBlob: vi.fn(),
}));

import app from '../app';
import { deleteFromBlob } from '../lib/blob';

function authCookie(): string {
  const token = jwt.sign({ admin: true }, 'test-secret', { expiresIn: '1h' });
  return `token=${token}`;
}

const sampleProject = {
  id: 1,
  title: 'My Project',
  slug: 'my-project',
  summary: 'A summary',
  description: 'A description',
  techStack: 'React,Node',
  githubUrl: null,
  demoUrl: null,
  imageUrl: null,
  featured: false,
  status: 'published',
  order: 0,
  contentBlocks: [],
};

describe('GET /api/projects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns list of projects', async () => {
    mockPrisma.project.findMany.mockResolvedValue([sampleProject]);
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].slug).toBe('my-project');
  });

  it('filters by featured=true', async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    await request(app).get('/api/projects?featured=true');
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ featured: true }) })
    );
  });

  it('filters by status', async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    await request(app).get('/api/projects?status=published');
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'published' }) })
    );
  });
});

describe('GET /api/projects/:slug', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns project with prev/next when found', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(sampleProject);
    mockPrisma.project.findMany.mockResolvedValue([sampleProject]);
    const res = await request(app).get('/api/projects/my-project');
    expect(res.status).toBe(200);
    expect(res.body.project.slug).toBe('my-project');
    expect(res.body).toHaveProperty('prev');
    expect(res.body).toHaveProperty('next');
  });

  it('returns 404 when project not found', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/projects/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});

describe('POST /api/projects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/projects').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });

  it('creates project and auto-generates slug from title', async () => {
    const created = { ...sampleProject, title: 'Hello World', slug: 'hello-world' };
    mockPrisma.project.create.mockResolvedValue(created);
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', authCookie())
      .send({ title: 'Hello World', description: 'desc', techStack: 'React' });
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('hello-world');
    expect(mockPrisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'hello-world' }) })
    );
  });

  it('strips special chars and collapses spaces in slug', async () => {
    const created = { ...sampleProject, title: 'Hello & World!', slug: 'hello-world' };
    mockPrisma.project.create.mockResolvedValue(created);
    await request(app)
      .post('/api/projects')
      .set('Cookie', authCookie())
      .send({ title: 'Hello & World!', description: 'desc', techStack: 'React' });
    const callArg = mockPrisma.project.create.mock.calls[0][0];
    // '& ' removed → two spaces → collapsed to one dash
    expect(callArg.data.slug).toBe('hello-world');
  });
});

describe('PUT /api/projects/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/projects/1').send({ title: 'Updated' });
    expect(res.status).toBe(401);
  });

  it('updates project', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(sampleProject);
    const updated = { ...sampleProject, title: 'Updated' };
    mockPrisma.project.update.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/projects/1')
      .set('Cookie', authCookie())
      .send({ title: 'Updated', description: 'desc', techStack: 'Vue' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
  });

  it('deletes old imageUrl from blob when replaced', async () => {
    const oldUrl = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/projects/old-a1b2.png';
    const newUrl = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/projects/new-c3d4.png';
    mockPrisma.project.findUnique.mockResolvedValue({ ...sampleProject, imageUrl: oldUrl });
    mockPrisma.project.update.mockResolvedValue({ ...sampleProject, imageUrl: newUrl });
    await request(app)
      .put('/api/projects/1')
      .set('Cookie', authCookie())
      .send({ title: 'My Project', description: 'desc', techStack: 'React', imageUrl: newUrl });
    expect(deleteFromBlob).toHaveBeenCalledWith(oldUrl);
  });

  it('does not delete blob when imageUrl is unchanged', async () => {
    const url = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/projects/same-a1b2.png';
    mockPrisma.project.findUnique.mockResolvedValue({ ...sampleProject, imageUrl: url });
    mockPrisma.project.update.mockResolvedValue({ ...sampleProject, imageUrl: url });
    await request(app)
      .put('/api/projects/1')
      .set('Cookie', authCookie())
      .send({ title: 'My Project', description: 'desc', techStack: 'React', imageUrl: url });
    expect(deleteFromBlob).not.toHaveBeenCalled();
  });

  it('does not delete blob when project has no existing imageUrl', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({ ...sampleProject, imageUrl: null });
    mockPrisma.project.update.mockResolvedValue(sampleProject);
    await request(app)
      .put('/api/projects/1')
      .set('Cookie', authCookie())
      .send({ title: 'My Project', description: 'desc', techStack: 'React' });
    expect(deleteFromBlob).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/projects/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/projects/1');
    expect(res.status).toBe(401);
  });

  it('deletes project and returns 204', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(sampleProject);
    mockPrisma.project.delete.mockResolvedValue(sampleProject);
    const res = await request(app)
      .delete('/api/projects/1')
      .set('Cookie', authCookie());
    expect(res.status).toBe(204);
  });

  it('deletes project imageUrl from blob on delete', async () => {
    const imageUrl = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/projects/my-project-a1b2.png';
    mockPrisma.project.findUnique.mockResolvedValue({ ...sampleProject, imageUrl, contentBlocks: [] });
    mockPrisma.project.delete.mockResolvedValue(sampleProject);
    await request(app).delete('/api/projects/1').set('Cookie', authCookie());
    expect(deleteFromBlob).toHaveBeenCalledWith(imageUrl);
  });

  it('deletes block imageUrls from blob on project delete', async () => {
    const blockImageUrl = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/blocks/my-project-c3d4.png';
    mockPrisma.project.findUnique.mockResolvedValue({
      ...sampleProject,
      imageUrl: null,
      contentBlocks: [{ id: 10, imageUrl: blockImageUrl }, { id: 11, imageUrl: null }],
    });
    mockPrisma.project.delete.mockResolvedValue(sampleProject);
    await request(app).delete('/api/projects/1').set('Cookie', authCookie());
    expect(deleteFromBlob).toHaveBeenCalledWith(blockImageUrl);
    expect(deleteFromBlob).toHaveBeenCalledTimes(1);
  });

  it('skips blob delete when project has no imageUrl or block images', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({ ...sampleProject, imageUrl: null, contentBlocks: [] });
    mockPrisma.project.delete.mockResolvedValue(sampleProject);
    await request(app).delete('/api/projects/1').set('Cookie', authCookie());
    expect(deleteFromBlob).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/projects/reorder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).patch('/api/projects/reorder').send([]);
    expect(res.status).toBe(401);
  });

  it('reorders projects and returns ok', async () => {
    mockPrisma.project.update.mockResolvedValue(sampleProject);
    const res = await request(app)
      .patch('/api/projects/reorder')
      .set('Cookie', authCookie())
      .send([{ id: 1, order: 0 }, { id: 2, order: 1 }]);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
