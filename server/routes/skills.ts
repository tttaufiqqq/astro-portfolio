import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
    const skills = await prisma.skill.findMany({ orderBy: { order: 'asc' } });
    res.json(skills);
});

router.patch('/reorder', requireAuth, async (req: Request, res: Response) => {
    const items: { id: number; order: number }[] = req.body;
    await Promise.all(
        items.map(item => prisma.skill.update({ where: { id: item.id }, data: { order: item.order } }))
    );
    res.json({ ok: true });
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { name, category, icon, order } = req.body;
    const skill = await prisma.skill.create({ data: { name, category, icon, order: order ?? 0 } });
    res.status(201).json(skill);
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const { name, category, icon, order } = req.body;
    const skill = await prisma.skill.update({
        where: { id: Number(req.params.id) },
        data: { name, category, icon, order },
    });
    res.json(skill);
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    await prisma.skill.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
});

export default router;
