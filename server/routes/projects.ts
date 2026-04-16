import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public
router.get('/', async (_req: Request, res: Response) => {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(projects);
});

router.get('/:id', async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({ where: { id: Number(req.params.id) } });
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(project);
});

// Protected
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { title, description, techStack, githubUrl, demoUrl, imageUrl, featured } = req.body;
  const project = await prisma.project.create({
    data: { title, description, techStack, githubUrl, demoUrl, imageUrl, featured: featured ?? false },
  });
  res.status(201).json(project);
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const { title, description, techStack, githubUrl, demoUrl, imageUrl, featured } = req.body;
  const project = await prisma.project.update({
    where: { id: Number(req.params.id) },
    data: { title, description, techStack, githubUrl, demoUrl, imageUrl, featured },
  });
  res.json(project);
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.project.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export default router;
