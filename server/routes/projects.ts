import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireFields } from '../lib/validate';
import * as projects from '../services/projects';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
        const status = req.query.status ? String(req.query.status) : undefined;
        res.json(await projects.listProjects({ featured, status }));
    } catch (err) {
        next(err);
    }
});

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await projects.getProjectBySlug(String(req.params.slug));
        if (!result) { res.status(404).json({ error: 'Not found' }); return; }
        res.json(result);
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
        await projects.reorderProjects(items);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['title'])) return;
        res.status(201).json(await projects.createProject(req.body));
    } catch (err) {
        next(err);
    }
});

router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['title'])) return;
        res.json(await projects.updateProject(Number(req.params.id), req.body));
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await projects.deleteProject(Number(req.params.id));
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
