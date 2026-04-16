import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
    const experiences = await prisma.experience.findMany({ orderBy: { order: 'asc' } });
    res.json(experiences);
});

router.patch('/reorder', requireAuth, async (req: Request, res: Response) => {
    const items: { id: number; order: number }[] = req.body;
    await Promise.all(
        items.map(item => prisma.experience.update({ where: { id: item.id }, data: { order: item.order } }))
    );
    res.json({ ok: true });
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { company, role, startDate, endDate, description, current, order } = req.body;
    const experience = await prisma.experience.create({
        data: {
            company, role, description,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            current: current ?? false,
            order: order ?? 0,
        },
    });
    res.status(201).json(experience);
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const { company, role, startDate, endDate, description, current, order } = req.body;
    const experience = await prisma.experience.update({
        where: { id: Number(req.params.id) },
        data: {
            company, role, description,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            current: current ?? false,
            order,
        },
    });
    res.json(experience);
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    await prisma.experience.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
});

export default router;
