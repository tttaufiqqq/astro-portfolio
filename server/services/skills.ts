import prisma from '../lib/prisma';

export async function listSkills() {
    return prisma.skill.findMany({ orderBy: { order: 'asc' } });
}

export async function createSkill(data: { name: string; category: string; icon?: string | null; order?: number }) {
    return prisma.skill.create({ data: { ...data, order: data.order ?? 0 } });
}

export async function updateSkill(id: number, data: { name: string; category: string; icon?: string | null; order?: number }) {
    return prisma.skill.update({ where: { id }, data });
}

export async function deleteSkill(id: number) {
    return prisma.skill.delete({ where: { id } });
}

export async function reorderSkills(items: { id: number; order: number }[]) {
    await Promise.all(
        items.map(item => prisma.skill.update({ where: { id: item.id }, data: { order: item.order } }))
    );
}
