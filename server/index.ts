import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import skillsRouter from './routes/skills';
import experiencesRouter from './routes/experiences';
import messagesRouter from './routes/messages';
import blocksRouter from './routes/blocks';
import blockRouter from './routes/block';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Auth
app.use('/api/auth', authRouter);

// Data routes
app.use('/api/projects', projectsRouter);
app.use('/api/projects/:projectId/blocks', blocksRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/experiences', experiencesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/blocks', blockRouter);

// Serve React frontend
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
