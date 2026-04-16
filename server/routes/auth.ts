import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: 'Invalid credentials' });
    return;
  }

  const hash = process.env.ADMIN_PASSWORD_HASH as string;
  const isValid = await bcrypt.compare(password, hash);

  if (!isValid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET as string, {
    expiresIn: '24h',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24h
  });

  res.json({ message: 'Logged in' });
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/check', (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) {
    res.json({ authenticated: false });
    return;
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    res.json({ authenticated: true });
  } catch {
    res.json({ authenticated: false });
  }
});

export default router;
