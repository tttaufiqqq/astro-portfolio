import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// GET /api/projects/:projectId/blocks — list blocks for a project (protected)
router.get('/', requireAuth, async (req: Request, res: Response) => {
    const blocks = await prisma.contentBlock.findMany({
        where: { projectId: Number(req.params.projectId) },
        orderBy: { order: 'asc' },
    });
    res.json(blocks);
});

// POST /api/projects/:projectId/blocks — create a block
router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { type, order, content, language, imageUrl } = req.body;
    const block = await prisma.contentBlock.create({
        data: {
            projectId: Number(req.params.projectId),
            type,
            order: order ?? 0,
            content: typeof content === 'string' ? content : JSON.stringify(content),
            language,
            imageUrl,
        },
    });
    res.status(201).json(block);
});

// PATCH /api/projects/:projectId/blocks/reorder — reorder blocks
router.patch('/reorder', requireAuth, async (req: Request, res: Response) => {
    const items: { id: number; order: number }[] = req.body;
    await Promise.all(
        items.map(item => prisma.contentBlock.update({ where: { id: item.id }, data: { order: item.order } }))
    );
    res.json({ ok: true });
});

export default router;
