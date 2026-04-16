import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public — contact form
router.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  const msg = await prisma.message.create({ data: { name, email, message } });
  res.status(201).json(msg);
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
