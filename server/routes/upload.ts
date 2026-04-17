import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { uploadToBlob } from '../lib/blob';

const router = Router();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        cb(null, ALLOWED_TYPES.includes(file.mimetype));
    },
});

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }
        const folder = typeof req.body.folder === 'string' ? req.body.folder : 'uploads';
        const name = typeof req.body.name === 'string' ? req.body.name : undefined;
        const url = await uploadToBlob(req.file.buffer, req.file.originalname, req.file.mimetype, folder, name);
        res.json({ url });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Upload error:', message);
        res.status(500).json({ error: message });
    }
});

export default router;
