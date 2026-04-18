import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { Resend } from 'resend';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';

const router = Router();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many messages sent. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public — contact form
router.post('/', contactLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email, and message are required' });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }
  if (message.length > 5000) {
    res.status(400).json({ error: 'Message must be 5000 characters or fewer' });
    return;
  }
  const msg = await prisma.message.create({ data: { name, email, message } });

  // Telegram notification — fire-and-forget
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    const text = `📬 New portfolio message\nFrom: ${name} <${email}>\n\n${message}`;
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
      .then(r => r.json())
      .then(data => console.log('[Telegram]', JSON.stringify(data)))
      .catch(err => console.error('[Telegram error]', err));
  } else {
    console.warn('[Telegram] missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  }

  res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
});

// Protected — unread count (must be before /:id)
router.get('/unread-count', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.message.count({ where: { read: false } });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

// Protected — mark all as read
router.post('/read-all', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.message.updateMany({ where: { read: false }, data: { read: true } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Protected — admin only
router.get('/', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// Protected — reply to a message
router.post('/:id/reply', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req.body;
    if (!body) {
      res.status(400).json({ error: 'body is required' });
      return;
    }

    const msg = await prisma.message.findUnique({ where: { id: Number(req.params.id) } });
    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (!resend) {
      console.warn('[Reply] RESEND_API_KEY not set — skipping email in dev');
      res.status(204).send();
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Portfolio <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL ?? 'taufiq33992@gmail.com',
      replyTo: msg.email,
      subject: `Re: ${msg.name} — ${msg.email}`,
      text: `Reply to: ${msg.name} <${msg.email}>\n\n${body}\n\n---\nOriginal message: "${msg.message}"`,
    });

    if (error) {
      console.error('[Reply] Resend error:', JSON.stringify(error));
      res.status(500).json({ error: error.message });
      return;
    }

    console.log('[Reply] Sent:', data?.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.message.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
