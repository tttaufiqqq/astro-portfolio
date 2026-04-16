import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import ProfileTab from '@/pages/admin/ProfileTab';

const baseProfile = {
  id: 1,
  name: 'Muhammad Taufiq',
  role: 'Software Engineer',
  bio: 'IT undergrad at UTeM',
  githubUrl: 'https://github.com/tttaufiqqq',
  linkedinUrl: null,
  twitterUrl: null,
  avatarUrl: null,
  resumeUrl: null,
};

function stubFetch(profile: typeof baseProfile, deleteOk = true) {
  vi.stubGlobal('fetch', vi.fn((url: string, opts?: RequestInit) => {
    if (url === '/api/profile' && !opts?.method) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(profile) });
    }
    if (opts?.method === 'DELETE') {
      return Promise.resolve({ ok: deleteOk });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(profile) });
  }));
}

describe('ProfileTab — avatar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does NOT show Remove photo button when avatarUrl is null', async () => {
    stubFetch({ ...baseProfile, avatarUrl: null });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    // The Remove button for avatar is only rendered when avatarUrl is set
    const removes = screen.queryAllByRole('button', { name: /remove/i });
    expect(removes).toHaveLength(0);
  });

  it('shows Remove photo button when avatarUrl is set', async () => {
    stubFetch({ ...baseProfile, avatarUrl: 'https://blob.example.com/avatar.jpg' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('calls DELETE /api/profile/avatar when Remove photo is clicked', async () => {
    stubFetch({ ...baseProfile, avatarUrl: 'https://blob.example.com/avatar.jpg' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/profile/avatar',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('hides Remove photo button after successful removal', async () => {
    stubFetch({ ...baseProfile, avatarUrl: 'https://blob.example.com/avatar.jpg' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument());
  });
});

describe('ProfileTab — resume', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does NOT show Remove resume button when resumeUrl is null', async () => {
    stubFetch({ ...baseProfile, resumeUrl: null });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('shows Remove resume button when resumeUrl is set', async () => {
    stubFetch({ ...baseProfile, resumeUrl: 'https://blob.example.com/cv.pdf' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('calls DELETE /api/profile/resume when Remove is clicked', async () => {
    stubFetch({ ...baseProfile, resumeUrl: 'https://blob.example.com/cv.pdf' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/profile/resume',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
