import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Project } from '@/types/models';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import ProjectFormModal from '@/components/admin/ProjectFormModal';

const sampleProject: Project = {
  id: 1,
  title: 'My Project',
  slug: 'my-project',
  summary: 'A short summary',
  description: 'A longer description',
  techStack: 'React, TypeScript',
  githubUrl: null,
  demoUrl: null,
  imageUrl: 'https://blob.example.com/projects/cover.jpg',
  featured: false,
  status: 'published',
  order: 0,
  contentBlocks: [],
};

describe('ProjectFormModal — image removal', () => {
  it('shows image preview when project has imageUrl', () => {
    render(
      <ProjectFormModal
        open={true}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        project={sampleProject}
      />
    );
    const preview = screen.getByAltText('Preview');
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute('src', sampleProject.imageUrl!);
  });

  it('shows Remove image button when imageUrl is set', () => {
    render(
      <ProjectFormModal
        open={true}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        project={sampleProject}
      />
    );
    // The standalone "Remove" text button (not the overlay X)
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('hides image preview after clicking Remove button', () => {
    render(
      <ProjectFormModal
        open={true}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        project={sampleProject}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  });

  it('does not show Remove button when project has no imageUrl', () => {
    render(
      <ProjectFormModal
        open={true}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        project={{ ...sampleProject, imageUrl: null }}
      />
    );
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <ProjectFormModal
        open={false}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        project={sampleProject}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
