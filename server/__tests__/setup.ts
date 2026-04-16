import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  // bcrypt hash of 'testpassword' — used in auth route tests
  process.env.ADMIN_PASSWORD_HASH =
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  process.env.NODE_ENV = 'test';
});
