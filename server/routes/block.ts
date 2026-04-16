import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// PUT /api/blocks/:id — update a block
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const { type, order, content, language, imageUrl } = req.body;
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
});

// DELETE /api/blocks/:id — delete a block
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    await prisma.contentBlock.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
});

export default router;
