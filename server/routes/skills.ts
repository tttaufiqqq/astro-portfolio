import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireFields } from '../lib/validate';
import * as skills from '../services/skills';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await skills.listSkills());
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
        await skills.reorderSkills(items);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['name', 'category'])) return;
        const { name, category, icon, order } = req.body;
        res.status(201).json(await skills.createSkill({ name, category, icon, order }));
    } catch (err) {
        next(err);
    }
});

router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['name', 'category'])) return;
        const { name, category, icon, order } = req.body;
        res.json(await skills.updateSkill(Number(req.params.id), { name, category, icon, order }));
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await skills.deleteSkill(Number(req.params.id));
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
