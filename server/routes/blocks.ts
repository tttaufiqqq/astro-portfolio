import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireFields, isValidBlockType } from '../lib/validate';
import * as blocks from '../services/blocks';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await blocks.listBlocks(Number(req.params.projectId)));
    } catch (err) {
        next(err);
    }
});

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['type'])) return;
        const { type, order, content, language, imageUrl } = req.body;
        if (!isValidBlockType(type)) {
            res.status(400).json({ error: 'Invalid block type. Must be one of: heading, text, image, video, code' });
            return;
        }
        res.status(201).json(await blocks.createBlock(Number(req.params.projectId), { type, order, content, language, imageUrl }));
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
        await blocks.reorderBlocks(items);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

export default router;
