/**
 * End-to-end flow tests — chained requests simulating real user journeys.
 * Each describe block represents one complete user flow, using state from
 * earlier requests to drive later ones.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// ---------------------------------------------------------------------------
// Prisma mock
// ---------------------------------------------------------------------------

const mockPrisma = vi.hoisted(() => ({
  project: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  contentBlock: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  message: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
  profile: {
    findFirst: vi.fn(),
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

vi.mock('resend', () => ({
  Resend: function() {
    return { emails: { send: vi.fn().mockResolvedValue({ data: { id: 'e1' }, error: null }) } };
  },
}));

import app from '../app';

function authCookie(): string {
  const token = jwt.sign({ admin: true }, 'test-secret', { expiresIn: '1h' });
  return `token=${token}`;
}

// ---------------------------------------------------------------------------
// Flow 1: Admin creates a project then views it publicly
// ---------------------------------------------------------------------------

describe('Flow: admin creates project → visible on public list', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates project via POST then retrieves it via GET', async () => {
    const created = {
      id: 1,
      title: 'BuzzyHive 2.0',
      slug: 'buzzyhive-2-0',
      summary: 'IoT hive monitor',
      description: 'Full-stack IoT system',
      techStack: 'React,Laravel',
      githubUrl: null,
      demoUrl: null,
      imageUrl: null,
      featured: true,
      status: 'published',
      order: 0,
      contentBlocks: [],
    };

    mockPrisma.project.create.mockResolvedValue(created);
    const postRes = await request(app)
      .post('/api/projects')
      .set('Cookie', authCookie())
      .send({ title: 'BuzzyHive 2.0', description: 'Full-stack IoT system', techStack: 'React,Laravel' });
    expect(postRes.status).toBe(201);
    expect(postRes.body.slug).toBe('buzzyhive-2-0');

    mockPrisma.project.findMany.mockResolvedValue([created]);
    const listRes = await request(app).get('/api/projects');
    expect(listRes.status).toBe(200);
    expect(listRes.body[0].title).toBe('BuzzyHive 2.0');
  });
});

// ---------------------------------------------------------------------------
// Flow 2: Admin adds block to project → block appears in project detail
// ---------------------------------------------------------------------------

describe('Flow: admin adds block → block visible on project detail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates block then retrieves project with block included', async () => {
    const block = {
      id: 10,
      projectId: 1,
      type: 'text',
      order: 0,
      content: '{"html":"<p>Overview</p>"}',
      language: null,
      imageUrl: null,
    };

    mockPrisma.contentBlock.create.mockResolvedValue(block);
    const postRes = await request(app)
      .post('/api/projects/1/blocks')
      .set('Cookie', authCookie())
      .send({ type: 'text', order: 0, content: { html: '<p>Overview</p>' } });
    expect(postRes.status).toBe(201);
    expect(postRes.body.content).toEqual({ html: '<p>Overview</p>' });

    const project = {
      id: 1,
      title: 'BuzzyHive 2.0',
      slug: 'buzzyhive-2-0',
      summary: null,
      description: 'desc',
      techStack: 'React',
      githubUrl: null,
      demoUrl: null,
      imageUrl: null,
      featured: false,
      status: 'published',
      order: 0,
      contentBlocks: [block],
    };

    mockPrisma.project.findUnique.mockResolvedValue(project);
    mockPrisma.project.findMany.mockResolvedValue([{ id: 1, title: 'BuzzyHive 2.0', slug: 'buzzyhive-2-0' }]);
    const detailRes = await request(app).get('/api/projects/buzzyhive-2-0');
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.project.contentBlocks).toHaveLength(1);
    expect(detailRes.body.project.contentBlocks[0].content).toEqual({ html: '<p>Overview</p>' });
  });
});

// ---------------------------------------------------------------------------
// Flow 3: Visitor submits contact form → admin sees message in inbox
// ---------------------------------------------------------------------------

describe('Flow: visitor submits contact form → admin views inbox', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates message via contact form then admin retrieves it', async () => {
    const msg = {
      id: 5,
      name: 'Siti',
      email: 'siti@example.com',
      message: 'Great portfolio!',
      read: false,
      createdAt: new Date().toISOString(),
    };

    mockPrisma.message.create.mockResolvedValue(msg);
    const contactRes = await request(app)
      .post('/api/messages')
      .send({ name: 'Siti', email: 'siti@example.com', message: 'Great portfolio!' });
    expect(contactRes.status).toBe(201);
    expect(contactRes.body.name).toBe('Siti');

    mockPrisma.message.findMany.mockResolvedValue([msg]);
    const inboxRes = await request(app)
      .get('/api/messages')
      .set('Cookie', authCookie());
    expect(inboxRes.status).toBe(200);
    expect(inboxRes.body[0].email).toBe('siti@example.com');
  });
});

// ---------------------------------------------------------------------------
// Flow 4: Admin edits block then verifies updated content on project detail
// ---------------------------------------------------------------------------

describe('Flow: admin edits block → updated content on project detail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates block via PUT then verifies change in project response', async () => {
    const original = {
      id: 10,
      projectId: 1,
      type: 'text',
      order: 0,
      content: '{"html":"<p>Old</p>"}',
      language: null,
      imageUrl: null,
    };
    const updated = { ...original, content: '{"html":"<p>New</p>"}' };

    mockPrisma.contentBlock.findUnique.mockResolvedValue(original);
    mockPrisma.contentBlock.update.mockResolvedValue(updated);
    const putRes = await request(app)
      .put('/api/blocks/10')
      .set('Cookie', authCookie())
      .send({ type: 'text', order: 0, content: { html: '<p>New</p>' } });
    expect(putRes.status).toBe(200);
    expect(putRes.body.content).toEqual({ html: '<p>New</p>' });

    const project = {
      id: 1,
      title: 'BuzzyHive 2.0',
      slug: 'buzzyhive-2-0',
      summary: null,
      description: 'desc',
      techStack: 'React',
      githubUrl: null,
      demoUrl: null,
      imageUrl: null,
      featured: false,
      status: 'published',
      order: 0,
      contentBlocks: [updated],
    };
    mockPrisma.project.findUnique.mockResolvedValue(project);
    mockPrisma.project.findMany.mockResolvedValue([{ id: 1, title: 'BuzzyHive 2.0', slug: 'buzzyhive-2-0' }]);
    const detailRes = await request(app).get('/api/projects/buzzyhive-2-0');
    expect(detailRes.body.project.contentBlocks[0].content).toEqual({ html: '<p>New</p>' });
  });
});

// ---------------------------------------------------------------------------
// Flow 5: Auth check — unauthenticated request is rejected across all admin routes
// ---------------------------------------------------------------------------

describe('Flow: unauthenticated requests are rejected on all write routes', () => {
  it('rejects all protected mutations without a cookie', async () => {
    const cases = [
      request(app).post('/api/projects').send({ title: 'X' }),
      request(app).put('/api/projects/1').send({ title: 'X' }),
      request(app).delete('/api/projects/1'),
      request(app).patch('/api/projects/reorder').send([]),
      request(app).post('/api/projects/1/blocks').send({ type: 'text' }),
      request(app).put('/api/blocks/1').send({ type: 'text' }),
      request(app).delete('/api/blocks/1'),
      request(app).post('/api/skills').send({ name: 'X', category: 'Y' }),
      request(app).delete('/api/skills/1'),
      request(app).put('/api/profile').send({ name: 'X' }),
      request(app).delete('/api/profile/avatar'),
      request(app).get('/api/messages'),
    ];
    const responses = await Promise.all(cases);
    for (const res of responses) {
      expect(res.status).toBe(401);
    }
  });
});
