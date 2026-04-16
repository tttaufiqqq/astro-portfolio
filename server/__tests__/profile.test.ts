import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = vi.hoisted(() => ({
  profile: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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

const sampleProfile = {
  id: 1,
  name: 'Muhammad Taufiq',
  role: 'Software Engineer',
  bio: 'IT undergrad at UTeM',
  githubUrl: 'https://github.com/tttaufiqqq',
  linkedinUrl: null,
  twitterUrl: null,
  avatarUrl: 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/avatars/avatar.jpg',
  resumeUrl: 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/resumes/cv.pdf',
};

describe('GET /api/profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns existing profile', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue(sampleProfile);
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Muhammad Taufiq');
  });

  it('auto-creates default profile when none exists', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue(null);
    mockPrisma.profile.create.mockResolvedValue({ ...sampleProfile, id: 2 });
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(200);
    expect(mockPrisma.profile.create).toHaveBeenCalled();
  });
});

describe('PUT /api/profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/profile').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });

  it('updates existing profile', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue(sampleProfile);
    const updated = { ...sampleProfile, bio: 'Updated bio' };
    mockPrisma.profile.update.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/profile')
      .set('Cookie', authCookie())
      .send({ name: 'Muhammad Taufiq', role: 'Software Engineer', bio: 'Updated bio' });
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe('Updated bio');
    expect(mockPrisma.profile.update).toHaveBeenCalled();
  });

  it('creates profile when none exists', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue(null);
    mockPrisma.profile.create.mockResolvedValue(sampleProfile);
    const res = await request(app)
      .put('/api/profile')
      .set('Cookie', authCookie())
      .send({ name: 'Muhammad Taufiq', role: 'Software Engineer', bio: 'New bio' });
    expect(res.status).toBe(200);
    expect(mockPrisma.profile.create).toHaveBeenCalled();
  });

  it('converts empty string URLs to null', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue(sampleProfile);
    mockPrisma.profile.update.mockResolvedValue(sampleProfile);
    await request(app)
      .put('/api/profile')
      .set('Cookie', authCookie())
      .send({ name: 'Taufiq', role: 'Dev', bio: 'Bio', githubUrl: '' });
    const callArg = mockPrisma.profile.update.mock.calls[0][0];
    expect(callArg.data.githubUrl).toBeNull();
  });
});

describe('DELETE /api/profile/resume', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/profile/resume');
    expect(res.status).toBe(401);
  });

  it('deletes resume from blob and clears DB field', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue(sampleProfile);
    mockPrisma.profile.update.mockResolvedValue({ ...sampleProfile, resumeUrl: null });
    const res = await request(app)
      .delete('/api/profile/resume')
      .set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(deleteFromBlob).toHaveBeenCalledWith(sampleProfile.resumeUrl);
    expect(mockPrisma.profile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { resumeUrl: null } })
    );
  });

  it('returns ok even when no resume exists', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue({ ...sampleProfile, resumeUrl: null });
    const res = await request(app)
      .delete('/api/profile/resume')
      .set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(deleteFromBlob).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/profile/avatar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/profile/avatar');
    expect(res.status).toBe(401);
  });

  it('deletes avatar from blob and clears DB field', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue(sampleProfile);
    mockPrisma.profile.update.mockResolvedValue({ ...sampleProfile, avatarUrl: null });
    const res = await request(app)
      .delete('/api/profile/avatar')
      .set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(deleteFromBlob).toHaveBeenCalledWith(sampleProfile.avatarUrl);
  });

  it('returns ok even when no avatar exists', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue({ ...sampleProfile, avatarUrl: null });
    const res = await request(app)
      .delete('/api/profile/avatar')
      .set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(deleteFromBlob).not.toHaveBeenCalled();
  });
});
