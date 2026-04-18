import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { requireFields, isValidBlockType } from '../lib/validate';
import { sanitizeBlockContent } from '../lib/sanitize';
import { serializeBlock } from '../lib/blocks';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// GET /api/projects/:projectId/blocks
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const blocks = await prisma.contentBlock.findMany({
            where: { projectId: Number(req.params.projectId) },
            orderBy: { order: 'asc' },
        });
        res.json(blocks.map(serializeBlock));
    } catch (err) {
        next(err);
    }
});

// POST /api/projects/:projectId/blocks
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['type'])) return;
        const { type, order, content, language, imageUrl } = req.body;

        if (!isValidBlockType(type)) {
            res.status(400).json({ error: 'Invalid block type. Must be one of: heading, text, image, video, code' });
            return;
        }

        const rawContent = typeof content === 'string' ? content : JSON.stringify(content);
        const block = await prisma.contentBlock.create({
            data: {
                projectId: Number(req.params.projectId),
                type,
                order: order ?? 0,
                content: sanitizeBlockContent(type, rawContent),
                language,
                imageUrl,
            },
        });
        res.status(201).json(serializeBlock(block));
    } catch (err) {
        next(err);
    }
});

// PATCH /api/projects/:projectId/blocks/reorder
router.patch('/reorder', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items: { id: number; order: number }[] = req.body;
        if (!Array.isArray(items)) {
            res.status(400).json({ error: 'Body must be an array of { id, order }' });
            return;
        }
        await Promise.all(
            items.map(item => prisma.contentBlock.update({ where: { id: item.id }, data: { order: item.order } }))
        );
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

export default router;
