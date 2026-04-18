import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { deleteFile } from '../lib/storage';
import { requireFields } from '../lib/validate';

const router = Router();

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
        if (!requireFields(res, req.body, ['name'])) return;
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
        if (existing?.avatarUrl && avatarUrlBody && avatarUrlBody !== existing.avatarUrl) {
            await deleteFile(existing.avatarUrl);
        }
        if (existing?.resumeUrl && resumeUrlBody && resumeUrlBody !== existing.resumeUrl) {
            await deleteFile(existing.resumeUrl);
        }
        const profile = existing
            ? await prisma.profile.update({ where: { id: existing.id }, data: updateData })
            : await prisma.profile.create({ data: { name, role, bio, ...updateData } });

        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// DELETE /api/profile/resume — protected
router.delete('/resume', requireAuth, async (_req, res) => {
    try {
        const profile = await prisma.profile.findFirst();
        if (profile?.resumeUrl) {
            await deleteFile(profile.resumeUrl);
            await prisma.profile.update({ where: { id: profile.id }, data: { resumeUrl: null } });
        }
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove resume' });
    }
});

// DELETE /api/profile/avatar — protected
router.delete('/avatar', requireAuth, async (_req, res) => {
    try {
        const profile = await prisma.profile.findFirst();
        if (profile?.avatarUrl) {
            await deleteFile(profile.avatarUrl);
            await prisma.profile.update({ where: { id: profile.id }, data: { avatarUrl: null } });
        }
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove avatar' });
    }
});

export default router;
