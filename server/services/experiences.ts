import prisma from '../lib/prisma';

export async function listExperiences() {
    return prisma.experience.findMany({ orderBy: { order: 'asc' } });
}

interface ExperienceData {
    company: string;
    role: string;
    startDate: Date;
    endDate: Date | null;
    description: string;
    current?: boolean;
    type?: string;
    order?: number;
}

export async function createExperience(data: ExperienceData) {
    return prisma.experience.create({
        data: { ...data, current: data.current ?? false, order: data.order ?? 0 },
    });
}

export async function updateExperience(id: number, data: ExperienceData) {
    return prisma.experience.update({ where: { id }, data });
}

export async function deleteExperience(id: number) {
    return prisma.experience.delete({ where: { id } });
}

export async function reorderExperiences(items: { id: number; order: number }[]) {
    await Promise.all(
        items.map(item => prisma.experience.update({ where: { id: item.id }, data: { order: item.order } }))
    );
}
