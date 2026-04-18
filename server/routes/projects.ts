import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { deleteFile } from '../lib/storage';
import { requireFields } from '../lib/validate';

const router = Router();
const prisma = new PrismaClient();

function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Public — list projects (optional ?featured=true, ?status=published)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const featuredParam = _req.query.featured;
        const statusParam = _req.query.status;

        const projects = await prisma.project.findMany({
            where: {
                ...(featuredParam === 'true' ? { featured: true } : {}),
                ...(statusParam ? { status: String(statusParam) } : {}),
            },
            orderBy: { order: 'asc' },
            include: { contentBlocks: { orderBy: { order: 'asc' } } },
        });
        res.json(projects);
    } catch (err) {
        next(err);
    }
});

// Public — get by slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const project = await prisma.project.findUnique({
            where: { slug: String(req.params.slug) },
            include: { contentBlocks: { orderBy: { order: 'asc' } } },
        });
        if (!project) { res.status(404).json({ error: 'Not found' }); return; }

        const all = await prisma.project.findMany({
            where: { status: 'published' },
            orderBy: { order: 'asc' },
            select: { id: true, title: true, slug: true },
        });
        const idx = all.findIndex(p => p.id === project.id);
        const prev = idx > 0 ? all[idx - 1] : null;
        const next = idx < all.length - 1 ? all[idx + 1] : null;

        res.json({ project, prev, next });
    } catch (err) {
        next(err);
    }
});

// Protected — reorder (must be before /:id routes)
router.patch('/reorder', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items: { id: number; order: number }[] = req.body;
        if (!Array.isArray(items)) {
            res.status(400).json({ error: 'Body must be an array of { id, order }' });
            return;
        }
        await Promise.all(
            items.map(item => prisma.project.update({ where: { id: item.id }, data: { order: item.order } }))
        );
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

// Protected — create
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['title'])) return;
        const { title, summary, description, techStack, githubUrl, demoUrl, imageUrl, featured, status, order } = req.body;
        const slug = slugify(title);
        const project = await prisma.project.create({
            data: {
                title, slug, summary, description, techStack,
                githubUrl, demoUrl, imageUrl,
                featured: featured ?? false,
                status: status ?? 'published',
                order: order ?? 0,
            },
        });
        res.status(201).json(project);
    } catch (err) {
        next(err);
    }
});

// Protected — update
router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!requireFields(res, req.body, ['title'])) return;
        const { title, summary, description, techStack, githubUrl, demoUrl, imageUrl, featured, status, order } = req.body;
        const data: Record<string, unknown> = {
            title, summary, description, techStack,
            githubUrl, demoUrl, imageUrl, featured, status, order,
        };
        if (title) data.slug = slugify(title);

        const existing = await prisma.project.findUnique({ where: { id: Number(req.params.id) } });
        if (existing?.imageUrl && existing.imageUrl !== imageUrl) {
            await deleteFile(existing.imageUrl);
        }

        const project = await prisma.project.update({
            where: { id: Number(req.params.id) },
            data,
        });
        res.json(project);
    } catch (err) {
        next(err);
    }
});

// Protected — delete
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(req.params.id) },
            include: { contentBlocks: true },
        });
        if (project?.imageUrl) await deleteFile(project.imageUrl);
        for (const block of project?.contentBlocks ?? []) {
            if (block.imageUrl) await deleteFile(block.imageUrl);
        }
        await prisma.project.delete({ where: { id: Number(req.params.id) } });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
