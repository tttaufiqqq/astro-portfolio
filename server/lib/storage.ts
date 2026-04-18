import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { uploadToBlob, deleteFromBlob } from './blob';

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function uploadLocal(buffer: Buffer, originalName: string, folder: string, name?: string): Promise<string> {
  const uploadDir = process.env.LOCAL_UPLOAD_DIR ?? 'uploads';
  const ext = path.extname(originalName).toLowerCase();
  const shortId = randomUUID().replace(/-/g, '').slice(0, 4);
  const base = name ? slugify(name) : 'file';
  const filename = `${base}-${shortId}${ext}`;
  const dir = path.resolve(uploadDir, folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}

async function deleteLocal(url: string): Promise<void> {
  try {
    const uploadDir = process.env.LOCAL_UPLOAD_DIR ?? 'uploads';
    const relative = url.replace(/^\/uploads\//, '');
    const filePath = path.resolve(uploadDir, relative);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}

export async function upload(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  folder = 'uploads',
  name?: string
): Promise<string> {
  if (process.env.NODE_ENV === 'production') {
    return uploadToBlob(buffer, originalName, contentType, folder, name);
  }
  return uploadLocal(buffer, originalName, folder, name);
}

export async function deleteFile(url: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    return deleteFromBlob(url);
  }
  return deleteLocal(url);
}
