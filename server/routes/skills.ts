import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
  const skills = await prisma.skill.findMany({ orderBy: { category: 'asc' } });
  res.json(skills);
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { name, category } = req.body;
  const skill = await prisma.skill.create({ data: { name, category } });
  res.status(201).json(skill);
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const { name, category } = req.body;
  const skill = await prisma.skill.update({
    where: { id: Number(req.params.id) },
    data: { name, category },
  });
  res.json(skill);
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.skill.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export default router;
