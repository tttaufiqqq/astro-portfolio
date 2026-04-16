import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { deleteFromBlob } from '../lib/blob';

const router = Router();
const prisma = new PrismaClient();

// GET /api/profile — public
router.get('/', async (_req, res) => {
    try {
        let profile = await prisma.profile.findFirst();
        if (!profile) {
            profile = await prisma.profile.create({
                data: {
                    name: 'Muhammad Taufiq',
                    role: 'Software Engineer & Full-Stack Developer',
                    bio: 'IT undergrad at UTeM, building full-stack web and IoT solutions. Passionate about clean code, scalable architecture, and shipping things that work.',
                },
            });
        }
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/profile — protected
router.put('/', requireAuth, async (req, res) => {
    try {
        const { name, role, bio, githubUrl, linkedinUrl, twitterUrl, avatarUrl: avatarUrlBody, resumeUrl: resumeUrlBody } = req.body;

        const updateData: Record<string, string | null> = {
            name,
            role,
            bio,
            githubUrl: githubUrl || null,
            linkedinUrl: linkedinUrl || null,
            twitterUrl: twitterUrl || null,
            avatarUrl: avatarUrlBody || null,
            resumeUrl: resumeUrlBody || null,
        };

        const existing = await prisma.profile.findFirst();
        const profile = existing
            ? await prisma.profile.update({ where: { id: existing.id }, data: updateData })
            : await prisma.profile.create({ data: { name, role, bio, ...updateData } });

        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// DELETE /api/profile/avatar — protected
router.delete('/avatar', requireAuth, async (_req, res) => {
    try {
        const profile = await prisma.profile.findFirst();
        if (profile?.avatarUrl) {
            await deleteFromBlob(profile.avatarUrl);
            await prisma.profile.update({ where: { id: profile.id }, data: { avatarUrl: null } });
        }
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove avatar' });
    }
});

export default router;
