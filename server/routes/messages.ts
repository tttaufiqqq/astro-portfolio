import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many messages sent. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public — contact form
router.post('/', contactLimiter, async (req: Request, res: Response) => {
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
});

// Protected — unread count (must be before /:id)
router.get('/unread-count', requireAuth, async (_req: Request, res: Response) => {
  const count = await prisma.message.count({ where: { read: false } });
  res.json({ count });
});

// Protected — mark all as read
router.post('/read-all', requireAuth, async (_req: Request, res: Response) => {
  await prisma.message.updateMany({ where: { read: false }, data: { read: true } });
  res.status(204).send();
});

// Protected — admin only
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(messages);
});

// Protected — reply to a message
router.post('/:id/reply', requireAuth, async (req: Request, res: Response) => {
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

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Portfolio <onboarding@resend.dev>',
      to: msg.email,
      subject: `Re: Your message to ${process.env.OWNER_NAME ?? 'me'}`,
      text: `Hi ${msg.name},\n\n${body}\n\n---\nThis is a reply to your message: "${msg.message}"`,
    });

    if (error) {
      console.error('[Reply] Resend error:', JSON.stringify(error));
      res.status(500).json({ error: error.message });
      return;
    }

    console.log('[Reply] Sent:', data?.id);
    res.status(204).send();
  } catch (err) {
    console.error('[Reply] Unexpected error:', err);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.message.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export default router;
