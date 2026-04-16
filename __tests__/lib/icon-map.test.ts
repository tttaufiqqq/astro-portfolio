import { describe, it, expect } from 'vitest';
import { Circle, Database } from 'lucide-react';
import { SiLaravel, SiPython } from 'react-icons/si';
import { resolveIcon } from '@/lib/icon-map';

describe('resolveIcon', () => {
  it('returns the matching brand icon for a known brand name', () => {
    expect(resolveIcon('laravel')).toBe(SiLaravel);
  });

  it('is case-insensitive for brand names', () => {
    expect(resolveIcon('Laravel')).toBe(SiLaravel);
    expect(resolveIcon('LARAVEL')).toBe(SiLaravel);
  });

  it('returns the matching Lucide icon for a generic name', () => {
    expect(resolveIcon('database')).toBe(Database);
  });

  it('returns Circle for an unknown name', () => {
    expect(resolveIcon('totally-unknown-icon')).toBe(Circle);
  });

  it('returns Circle for null', () => {
    expect(resolveIcon(null)).toBe(Circle);
  });

  it('returns Circle for undefined', () => {
    expect(resolveIcon(undefined)).toBe(Circle);
  });

  it('returns Circle for empty string', () => {
    expect(resolveIcon('')).toBe(Circle);
  });

  it('checks brand map before Lucide map', () => {
    // 'python' is a brand icon — should return SiPython, not Circle
    expect(resolveIcon('python')).toBe(SiPython);
  });
});
