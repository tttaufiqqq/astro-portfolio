import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import * as messages from '../services/messages';

const router = Router();

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Too many messages sent. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', contactLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            res.status(400).json({ error: 'name, email, and message are required' });
            return;
        }
        if (!EMAIL_RE.test(email)) {
            res.status(400).json({ error: 'Invalid email address' });
            return;
        }
        if (message.length > 5000) {
            res.status(400).json({ error: 'Message must be 5000 characters or fewer' });
            return;
        }
        const msg = await messages.createMessage({ name, email, message });
        messages.notifyTelegram(name, email, message);
        res.status(201).json(msg);
    } catch (err) {
        next(err);
    }
});

router.get('/unread-count', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json({ count: await messages.getUnreadCount() });
    } catch (err) {
        next(err);
    }
});

router.post('/read-all', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        await messages.markAllRead();
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

router.get('/', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await messages.listMessages());
    } catch (err) {
        next(err);
    }
});

router.post('/:id/reply', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req.body;
        if (!body) {
            res.status(400).json({ error: 'body is required' });
            return;
        }
        const result = await messages.replyToMessage(Number(req.params.id), body);
        if (!result) {
            res.status(404).json({ error: 'Message not found' });
            return;
        }
        res.status(204).send();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to send reply';
        console.error('[Reply] error:', err);
        res.status(500).json({ error: message });
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await messages.deleteMessage(Number(req.params.id));
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
