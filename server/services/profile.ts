import prisma from '../lib/prisma';
import { deleteFile } from '../lib/storage';

const DEFAULT_PROFILE = {
    name: 'Muhammad Taufiq',
    role: 'Software Engineer & Full-Stack Developer',
    bio: 'IT undergrad at UTeM, building full-stack web and IoT solutions. Passionate about clean code, scalable architecture, and shipping things that work.',
};

export async function getOrCreateProfile() {
    const existing = await prisma.profile.findFirst();
    return existing ?? await prisma.profile.create({ data: DEFAULT_PROFILE });
}

export async function updateProfile(data: {
    name: string;
    role?: string;
    bio?: string;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    avatarUrl?: string | null;
    resumeUrl?: string | null;
}) {
    const existing = await prisma.profile.findFirst();
    if (existing?.avatarUrl && data.avatarUrl && data.avatarUrl !== existing.avatarUrl) {
        await deleteFile(existing.avatarUrl);
    }
    if (existing?.resumeUrl && data.resumeUrl && data.resumeUrl !== existing.resumeUrl) {
        await deleteFile(existing.resumeUrl);
    }
    const updateData = {
        ...data,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        twitterUrl: data.twitterUrl || null,
        avatarUrl: data.avatarUrl || null,
        resumeUrl: data.resumeUrl || null,
    };
    return existing
        ? await prisma.profile.update({ where: { id: existing.id }, data: updateData })
        : await prisma.profile.create({ data: { ...DEFAULT_PROFILE, ...updateData } });
}

export async function removeAvatar() {
    const profile = await prisma.profile.findFirst();
    if (profile?.avatarUrl) {
        await deleteFile(profile.avatarUrl);
        await prisma.profile.update({ where: { id: profile.id }, data: { avatarUrl: null } });
    }
}

export async function removeResume() {
    const profile = await prisma.profile.findFirst();
    if (profile?.resumeUrl) {
        await deleteFile(profile.resumeUrl);
        await prisma.profile.update({ where: { id: profile.id }, data: { resumeUrl: null } });
    }
}
