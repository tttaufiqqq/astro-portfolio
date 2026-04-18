import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireFields, isValidBlockType } from '../lib/validate';
import * as blocks from '../services/blocks';

const router = Router();

router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['type'])) return;
        const { type, order, content, language, imageUrl } = req.body;
        if (!isValidBlockType(type)) {
            res.status(400).json({ error: 'Invalid block type. Must be one of: heading, text, image, video, code' });
            return;
        }
        res.json(await blocks.updateBlock(Number(req.params.id), { type, order, content, language, imageUrl }));
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await blocks.deleteBlock(Number(req.params.id));
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
