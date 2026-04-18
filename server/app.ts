import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

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
      'script-src': ["'self'", 'https://www.youtube.com'],
      'img-src': ["'self'", 'data:', 'https://taufiqportfolio.blob.core.windows.net', 'https://img.youtube.com', 'https://i.ytimg.com', 'https://i.vimeocdn.com', ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:8080'] : [])],
      'frame-src': ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://player.vimeo.com'],
      'connect-src': ["'self'", 'https://noembed.com'],
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  const uploadDir = process.env.LOCAL_UPLOAD_DIR ?? 'uploads';
  app.use('/uploads', express.static(path.resolve(uploadDir)));
}

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
