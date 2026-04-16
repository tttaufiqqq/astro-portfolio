import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Reset fetch mock between tests
afterEach(() => {
  vi.restoreAllMocks();
});
