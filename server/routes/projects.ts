import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { deleteFromBlob } from '../lib/blob';

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
router.get('/', async (req: Request, res: Response) => {
    const featuredParam = req.query.featured;
    const statusParam = req.query.status;

    const projects = await prisma.project.findMany({
        where: {
            ...(featuredParam === 'true' ? { featured: true } : {}),
            ...(statusParam ? { status: String(statusParam) } : {}),
        },
        orderBy: { order: 'asc' },
        include: { contentBlocks: { orderBy: { order: 'asc' } } },
    });
    res.json(projects);
});

// Public — get by slug
router.get('/:slug', async (req: Request, res: Response) => {
    const project = await prisma.project.findUnique({
        where: { slug: String(req.params.slug) },
        include: { contentBlocks: { orderBy: { order: 'asc' } } },
    });
    if (!project) { res.status(404).json({ error: 'Not found' }); return; }

    // Find prev/next for navigation
    const all = await prisma.project.findMany({
        where: { status: 'published' },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, slug: true },
    });
    const idx = all.findIndex(p => p.id === project.id);
    const prev = idx > 0 ? all[idx - 1] : null;
    const next = idx < all.length - 1 ? all[idx + 1] : null;

    res.json({ project, prev, next });
});

// Protected — reorder (must be before /:id routes)
router.patch('/reorder', requireAuth, async (req: Request, res: Response) => {
    const items: { id: number; order: number }[] = req.body;
    await Promise.all(
        items.map(item => prisma.project.update({ where: { id: item.id }, data: { order: item.order } }))
    );
    res.json({ ok: true });
});

// Protected — create
router.post('/', requireAuth, async (req: Request, res: Response) => {
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
});

// Protected — update
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const { title, summary, description, techStack, githubUrl, demoUrl, imageUrl, featured, status, order } = req.body;
    const data: Record<string, unknown> = {
        title, summary, description, techStack,
        githubUrl, demoUrl, imageUrl, featured, status, order,
    };
    if (title) data.slug = slugify(title);

    const existing = await prisma.project.findUnique({ where: { id: Number(req.params.id) } });
    if (existing?.imageUrl && existing.imageUrl !== imageUrl) {
        await deleteFromBlob(existing.imageUrl);
    }

    const project = await prisma.project.update({
        where: { id: Number(req.params.id) },
        data,
    });
    res.json(project);
});

// Protected — delete
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    const project = await prisma.project.findUnique({
        where: { id: Number(req.params.id) },
        include: { contentBlocks: true },
    });
    if (project?.imageUrl) await deleteFromBlob(project.imageUrl);
    for (const block of project?.contentBlocks ?? []) {
        if (block.imageUrl) await deleteFromBlob(block.imageUrl);
    }
    await prisma.project.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
});

export default router;
