import { beforeAll } from 'vitest';

// Set at module level so env vars are present when app.ts is imported
process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_PASSWORD_HASH =
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
process.env.NODE_ENV = 'test';
process.env.RESEND_API_KEY = 'test-resend-key';

beforeAll(() => {});
