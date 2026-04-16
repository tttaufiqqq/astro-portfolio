import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
  const experiences = await prisma.experience.findMany({ orderBy: { startDate: 'desc' } });
  res.json(experiences);
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { company, role, startDate, endDate, description } = req.body;
  const experience = await prisma.experience.create({
    data: { company, role, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, description },
  });
  res.status(201).json(experience);
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const { company, role, startDate, endDate, description } = req.body;
  const experience = await prisma.experience.update({
    where: { id: Number(req.params.id) },
    data: { company, role, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, description },
  });
  res.json(experience);
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.experience.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export default router;
