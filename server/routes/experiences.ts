import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { requireFields } from '../lib/validate';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const experiences = await prisma.experience.findMany({ orderBy: { order: 'asc' } });
        res.json(experiences);
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
            items.map(item => prisma.experience.update({ where: { id: item.id }, data: { order: item.order } }))
        );
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['company', 'role', 'startDate'])) return;
        const { company, role, startDate, endDate, description, current, order } = req.body;

        const parsedStart = new Date(startDate);
        if (isNaN(parsedStart.getTime())) {
            res.status(400).json({ error: 'Invalid startDate' });
            return;
        }
        const parsedEnd = endDate ? new Date(endDate) : null;
        if (endDate && parsedEnd && isNaN(parsedEnd.getTime())) {
            res.status(400).json({ error: 'Invalid endDate' });
            return;
        }

        const experience = await prisma.experience.create({
            data: {
                company, role, description,
                startDate: parsedStart,
                endDate: parsedEnd,
                current: current ?? false,
                order: order ?? 0,
            },
        });
        res.status(201).json(experience);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['company', 'role', 'startDate'])) return;
        const { company, role, startDate, endDate, description, current, order } = req.body;

        const parsedStart = new Date(startDate);
        if (isNaN(parsedStart.getTime())) {
            res.status(400).json({ error: 'Invalid startDate' });
            return;
        }
        const parsedEnd = endDate ? new Date(endDate) : null;
        if (endDate && parsedEnd && isNaN(parsedEnd.getTime())) {
            res.status(400).json({ error: 'Invalid endDate' });
            return;
        }

        const experience = await prisma.experience.update({
            where: { id: Number(req.params.id) },
            data: {
                company, role, description,
                startDate: parsedStart,
                endDate: parsedEnd,
                current: current ?? false,
                order,
            },
        });
        res.json(experience);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.experience.delete({ where: { id: Number(req.params.id) } });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
