import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { requireFields } from '../lib/validate';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const skills = await prisma.skill.findMany({ orderBy: { order: 'asc' } });
        res.json(skills);
    } catch (err) {
        next(err);
    }
});

router.patch('/reorder', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items: { id: number; order: number }[] = req.body;
        if (!Array.isArray(items)) {
            res.status(400).json({ error: 'Body must be an array of { id, order }' });
            return;
        }
        await Promise.all(
            items.map(item => prisma.skill.update({ where: { id: item.id }, data: { order: item.order } }))
        );
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['name', 'category'])) return;
        const { name, category, icon, order } = req.body;
        const skill = await prisma.skill.create({ data: { name, category, icon, order: order ?? 0 } });
        res.status(201).json(skill);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['name', 'category'])) return;
        const { name, category, icon, order } = req.body;
        const skill = await prisma.skill.update({
            where: { id: Number(req.params.id) },
            data: { name, category, icon, order },
        });
        res.json(skill);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.skill.delete({ where: { id: Number(req.params.id) } });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
