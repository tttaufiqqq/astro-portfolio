import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import skillsRouter from './routes/skills';
import experiencesRouter from './routes/experiences';
import messagesRouter from './routes/messages';
import blocksRouter from './routes/blocks';
import blockRouter from './routes/block';
import uploadRouter from './routes/upload';
import profileRouter from './routes/profile';

dotenv.config();

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https://taufiqportfolio.blob.core.windows.net', 'https://img.youtube.com', 'https://i.ytimg.com', 'https://i.vimeocdn.com'],
      'frame-src': ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://player.vimeo.com'],
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/projects/:projectId/blocks', blocksRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/experiences', experiencesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/blocks', blockRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/profile', profileRouter);

export default app;
