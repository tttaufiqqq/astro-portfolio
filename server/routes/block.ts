import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { deleteFile } from '../lib/storage';
import { requireFields, isValidBlockType } from '../lib/validate';

const router = Router();
const prisma = new PrismaClient();

// PUT /api/blocks/:id
router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['type'])) return;
        const { type, order, content, language, imageUrl } = req.body;

        if (!isValidBlockType(type)) {
            res.status(400).json({ error: 'Invalid block type. Must be one of: heading, text, image, video, code' });
            return;
        }

        const existing = await prisma.contentBlock.findUnique({ where: { id: Number(req.params.id) } });
        if (existing?.imageUrl && existing.imageUrl !== imageUrl) {
            await deleteFile(existing.imageUrl);
        }

        const block = await prisma.contentBlock.update({
            where: { id: Number(req.params.id) },
            data: {
                type,
                order,
                content: typeof content === 'string' ? content : JSON.stringify(content),
                language,
                imageUrl,
            },
        });
        res.json(block);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/blocks/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const block = await prisma.contentBlock.findUnique({ where: { id: Number(req.params.id) } });
        if (block?.imageUrl) await deleteFile(block.imageUrl);
        await prisma.contentBlock.delete({ where: { id: Number(req.params.id) } });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
