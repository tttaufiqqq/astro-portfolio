import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireFields } from '../lib/validate';
import * as experiences from '../services/experiences';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await experiences.listExperiences());
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
        await experiences.reorderExperiences(items);
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

        res.status(201).json(await experiences.createExperience({
            company, role, description, startDate: parsedStart, endDate: parsedEnd, current, order,
        }));
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

        res.json(await experiences.updateExperience(Number(req.params.id), {
            company, role, description, startDate: parsedStart, endDate: parsedEnd, current, order,
        }));
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await experiences.deleteExperience(Number(req.params.id));
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
