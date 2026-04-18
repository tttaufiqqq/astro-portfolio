import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireFields } from '../lib/validate';
import * as profile from '../services/profile';

const router = Router();

router.get('/', async (_req, res, next) => {
    try {
        res.json(await profile.getOrCreateProfile());
    } catch (err) {
        next(err);
    }
});

router.put('/', requireAuth, async (req, res, next) => {
    try {
        if (!requireFields(res, req.body, ['name'])) return;
        res.json(await profile.updateProfile(req.body));
    } catch (err) {
        next(err);
    }
});

router.delete('/resume', requireAuth, async (_req, res, next) => {
    try {
        await profile.removeResume();
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

router.delete('/avatar', requireAuth, async (_req, res, next) => {
    try {
        await profile.removeAvatar();
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

export default router;
