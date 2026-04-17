import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public — contact form
router.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email, and message are required' });
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
    }).catch(() => {});
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

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.message.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export default router;
