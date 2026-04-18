import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = vi.hoisted(() => ({
  contentBlock: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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
import { deleteFile } from '../lib/storage';

function authCookie(): string {
  const token = jwt.sign({ admin: true }, 'test-secret', { expiresIn: '1h' });
  return `token=${token}`;
}

const sampleBlock = {
  id: 1,
  projectId: 1,
  type: 'image' as const,
  order: 0,
  content: '{}',
  language: null,
  imageUrl: null,
};

describe('PUT /api/blocks/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/blocks/1').send({ type: 'image' });
    expect(res.status).toBe(401);
  });

  it('updates block', async () => {
    mockPrisma.contentBlock.findUnique.mockResolvedValue(sampleBlock);
    const updated = { ...sampleBlock, content: '{"text":"hello"}' };
    mockPrisma.contentBlock.update.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/blocks/1')
      .set('Cookie', authCookie())
      .send({ type: 'text', order: 0, content: { text: 'hello' } });
    expect(res.status).toBe(200);
  });

  it('deletes old imageUrl from blob when replaced', async () => {
    const oldUrl = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/blocks/my-project-a1b2.png';
    const newUrl = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/blocks/my-project-c3d4.png';
    mockPrisma.contentBlock.findUnique.mockResolvedValue({ ...sampleBlock, imageUrl: oldUrl });
    mockPrisma.contentBlock.update.mockResolvedValue({ ...sampleBlock, imageUrl: newUrl });
    await request(app)
      .put('/api/blocks/1')
      .set('Cookie', authCookie())
      .send({ type: 'image', order: 0, content: '{}', imageUrl: newUrl });
    expect(deleteFile).toHaveBeenCalledWith(oldUrl);
  });

  it('does not delete blob when imageUrl is unchanged', async () => {
    const url = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/blocks/same-a1b2.png';
    mockPrisma.contentBlock.findUnique.mockResolvedValue({ ...sampleBlock, imageUrl: url });
    mockPrisma.contentBlock.update.mockResolvedValue({ ...sampleBlock, imageUrl: url });
    await request(app)
      .put('/api/blocks/1')
      .set('Cookie', authCookie())
      .send({ type: 'image', order: 0, content: '{}', imageUrl: url });
    expect(deleteFile).not.toHaveBeenCalled();
  });

  it('does not delete blob when block has no existing imageUrl', async () => {
    const newUrl = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/blocks/new-a1b2.png';
    mockPrisma.contentBlock.findUnique.mockResolvedValue({ ...sampleBlock, imageUrl: null });
    mockPrisma.contentBlock.update.mockResolvedValue({ ...sampleBlock, imageUrl: newUrl });
    await request(app)
      .put('/api/blocks/1')
      .set('Cookie', authCookie())
      .send({ type: 'image', order: 0, content: '{}', imageUrl: newUrl });
    expect(deleteFile).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/blocks/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/blocks/1');
    expect(res.status).toBe(401);
  });

  it('deletes block and returns 204', async () => {
    mockPrisma.contentBlock.findUnique.mockResolvedValue(sampleBlock);
    mockPrisma.contentBlock.delete.mockResolvedValue(sampleBlock);
    const res = await request(app)
      .delete('/api/blocks/1')
      .set('Cookie', authCookie());
    expect(res.status).toBe(204);
  });

  it('deletes imageUrl from blob before deleting block', async () => {
    const imageUrl = 'https://taufiqportfolio.blob.core.windows.net/portfolio-media/blocks/my-project-a1b2.png';
    mockPrisma.contentBlock.findUnique.mockResolvedValue({ ...sampleBlock, imageUrl });
    mockPrisma.contentBlock.delete.mockResolvedValue(sampleBlock);
    await request(app).delete('/api/blocks/1').set('Cookie', authCookie());
    expect(deleteFile).toHaveBeenCalledWith(imageUrl);
  });

  it('skips blob delete when block has no imageUrl', async () => {
    mockPrisma.contentBlock.findUnique.mockResolvedValue({ ...sampleBlock, imageUrl: null });
    mockPrisma.contentBlock.delete.mockResolvedValue(sampleBlock);
    await request(app).delete('/api/blocks/1').set('Cookie', authCookie());
    expect(deleteFile).not.toHaveBeenCalled();
  });
});
