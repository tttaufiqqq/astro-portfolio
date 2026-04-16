import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Skill } from '@/types/models';

// Render motion.div as a plain div — avoids animation/RAF issues in jsdom
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      <div className={className}>{children}</div>,
  },
}));

import SkillBadge from '@/components/public/SkillBadge';

function makeSkill(overrides: Partial<Skill> = {}): Skill {
  return { id: 1, name: 'Test Skill', category: 'Testing', icon: null, order: 0, ...overrides };
}

describe('SkillBadge', () => {
  it('renders the skill name and category', () => {
    render(<SkillBadge skill={makeSkill({ name: 'TypeScript', category: 'Language' })} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('renders an emoji span when icon is an emoji character', () => {
    render(<SkillBadge skill={makeSkill({ icon: '🐍' })} />);
    const emoji = screen.getByText('🐍');
    expect(emoji.tagName).toBe('SPAN');
  });

  it('does not render an emoji span for a named icon', () => {
    render(<SkillBadge skill={makeSkill({ icon: 'python' })} />);
    expect(screen.queryByText('python')).not.toBeInTheDocument();
  });

  it('renders an SVG icon element for a known brand icon name', () => {
    const { container } = render(<SkillBadge skill={makeSkill({ icon: 'react' })} />);
    // react-icons renders an <svg> element
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the Circle fallback SVG when icon is null', () => {
    // resolveIcon(null) returns Circle — always renders an icon
    const { container } = render(<SkillBadge skill={makeSkill({ icon: null })} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    // No emoji span (only name/category text spans)
    expect(screen.queryByText('null')).not.toBeInTheDocument();
  });
});
