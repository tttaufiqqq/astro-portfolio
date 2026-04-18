import prisma from '../lib/prisma';
import { deleteFile } from '../lib/storage';
import { sanitizeBlockContent } from '../lib/sanitize';
import { serializeBlock } from '../lib/blocks';

export async function listBlocks(projectId: number) {
    const blocks = await prisma.contentBlock.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
    });
    return blocks.map(serializeBlock);
}

export async function createBlock(projectId: number, data: {
    type: string;
    order?: number;
    content: unknown;
    language?: string | null;
    imageUrl?: string | null;
}) {
    const rawContent = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
    const block = await prisma.contentBlock.create({
        data: {
            projectId,
            type: data.type,
            order: data.order ?? 0,
            content: sanitizeBlockContent(data.type, rawContent),
            language: data.language,
            imageUrl: data.imageUrl,
        },
    });
    return serializeBlock(block);
}

export async function updateBlock(id: number, data: {
    type: string;
    order?: number;
    content: unknown;
    language?: string | null;
    imageUrl?: string | null;
}) {
    const existing = await prisma.contentBlock.findUnique({ where: { id } });
    if (existing?.imageUrl && data.imageUrl && data.imageUrl !== existing.imageUrl) {
        await deleteFile(existing.imageUrl);
    }
    const rawContent = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
    const block = await prisma.contentBlock.update({
        where: { id },
        data: {
            type: data.type,
            order: data.order,
            content: sanitizeBlockContent(data.type, rawContent),
            language: data.language,
            imageUrl: data.imageUrl,
        },
    });
    return serializeBlock(block);
}

export async function deleteBlock(id: number) {
    const block = await prisma.contentBlock.findUnique({ where: { id } });
    if (block?.imageUrl) await deleteFile(block.imageUrl);
    await prisma.contentBlock.delete({ where: { id } });
}

export async function reorderBlocks(items: { id: number; order: number }[]) {
    await Promise.all(
        items.map(item => prisma.contentBlock.update({ where: { id: item.id }, data: { order: item.order } }))
    );
}
