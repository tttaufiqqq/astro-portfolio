import { Response } from 'express';

const BLOCK_TYPES = ['heading', 'text', 'image', 'video', 'code'] as const;

/**
 * Checks that all required fields are present and non-empty in the request body.
 * Sends a 400 response and returns false if any are missing.
 */
export function requireFields(
  res: Response,
  body: Record<string, unknown>,
  fields: string[]
): boolean {
  const missing = fields.filter(f => {
    const v = body[f];
    return v === undefined || v === null || v === '';
  });
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    return false;
  }
  return true;
}

export function isValidBlockType(type: unknown): type is typeof BLOCK_TYPES[number] {
  return typeof type === 'string' && (BLOCK_TYPES as readonly string[]).includes(type);
}
