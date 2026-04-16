import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';

function makeReq(token?: string): Partial<Request> {
  return { cookies: token ? { token } : {} } as Partial<Request>;
}

function makeRes(): { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('requireAuth middleware', () => {
  const next = vi.fn() as unknown as NextFunction;

  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when no token is present', () => {
    const req = makeReq();
    const res = makeRes();
    requireAuth(req as Request, res as unknown as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for an invalid token', () => {
    const req = makeReq('invalid.token.value');
    const res = makeRes();
    requireAuth(req as Request, res as unknown as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and attaches admin payload for a valid token', () => {
    const token = jwt.sign({ admin: true }, 'test-secret');
    const req = makeReq(token) as any;
    const res = makeRes();
    requireAuth(req as Request, res as unknown as Response, next);
    expect(next).toHaveBeenCalled();
    expect(req.admin).toBeDefined();
    expect(req.admin.admin).toBe(true);
  });

  it('returns 401 for an expired token', () => {
    const token = jwt.sign({ admin: true }, 'test-secret', { expiresIn: -1 });
    const req = makeReq(token);
    const res = makeRes();
    requireAuth(req as Request, res as unknown as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
