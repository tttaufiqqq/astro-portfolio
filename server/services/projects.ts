import prisma from '../lib/prisma';
import { deleteFile } from '../lib/storage';
import { serializeBlock } from '../lib/blocks';

function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export async function listProjects(filters: { featured?: boolean; status?: string } = {}) {
    const projects = await prisma.project.findMany({
        where: {
            ...(filters.featured != null ? { featured: filters.featured } : {}),
            ...(filters.status ? { status: filters.status } : {}),
        },
        orderBy: { order: 'asc' },
        include: { contentBlocks: { orderBy: { order: 'asc' } } },
    });
    return projects.map(p => ({ ...p, contentBlocks: p.contentBlocks.map(serializeBlock) }));
}

export async function getProjectBySlug(slug: string) {
    const project = await prisma.project.findUnique({
        where: { slug },
        include: { contentBlocks: { orderBy: { order: 'asc' } } },
    });
    if (!project) return null;

    const all = await prisma.project.findMany({
        where: { status: 'published' },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, slug: true },
    });
    const idx = all.findIndex(p => p.id === project.id);
    return {
        project: { ...project, contentBlocks: project.contentBlocks.map(serializeBlock) },
        prev: idx > 0 ? all[idx - 1] : null,
        next: idx < all.length - 1 ? all[idx + 1] : null,
    };
}

export async function createProject(data: {
    title: string;
    summary?: string;
    description?: string;
    techStack?: string;
    githubUrl?: string;
    demoUrl?: string;
    imageUrl?: string;
    featured?: boolean;
    status?: string;
    order?: number;
}) {
    return prisma.project.create({
        data: {
            ...data,
            slug: slugify(data.title),
            featured: data.featured ?? false,
            status: data.status ?? 'published',
            order: data.order ?? 0,
        },
    });
}

export async function updateProject(id: number, data: {
    title?: string;
    summary?: string;
    description?: string;
    techStack?: string;
    githubUrl?: string;
    demoUrl?: string;
    imageUrl?: string;
    featured?: boolean;
    status?: string;
    order?: number;
}) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (existing?.imageUrl && data.imageUrl && data.imageUrl !== existing.imageUrl) {
        await deleteFile(existing.imageUrl);
    }
    return prisma.project.update({
        where: { id },
        data: { ...data, ...(data.title ? { slug: slugify(data.title) } : {}) },
    });
}

export async function deleteProject(id: number) {
    const project = await prisma.project.findUnique({
        where: { id },
        include: { contentBlocks: true },
    });
    if (project?.imageUrl) await deleteFile(project.imageUrl);
    for (const block of project?.contentBlocks ?? []) {
        if (block.imageUrl) await deleteFile(block.imageUrl);
    }
    await prisma.project.delete({ where: { id } });
}

export async function reorderProjects(items: { id: number; order: number }[]) {
    await Promise.all(
        items.map(item => prisma.project.update({ where: { id: item.id }, data: { order: item.order } }))
    );
}
