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

// ─── Avatar ──────────────────────────────────────────────────────────────────

describe('ProfileTab — avatar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does NOT show Remove photo button when avatarUrl is null', async () => {
    stubFetch({ ...baseProfile, avatarUrl: null });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /remove photo/i })).not.toBeInTheDocument();
  });

  it('shows Remove photo button when avatarUrl is set', async () => {
    stubFetch({ ...baseProfile, avatarUrl: 'https://blob.example.com/avatar.jpg' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /remove photo/i })).toBeInTheDocument();
  });

  it('calls DELETE /api/profile/avatar when Remove photo is clicked', async () => {
    stubFetch({ ...baseProfile, avatarUrl: 'https://blob.example.com/avatar.jpg' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: /remove photo/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /remove photo/i }));
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
    await waitFor(() => expect(screen.getByRole('button', { name: /remove photo/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /remove photo/i }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /remove photo/i })).not.toBeInTheDocument());
  });

  it('shows hover overlay with Upload text when no avatar', async () => {
    stubFetch({ ...baseProfile, avatarUrl: null });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: /upload photo/i })).toBeInTheDocument());
  });

  it('shows hover overlay with Replace text when avatar is set', async () => {
    stubFetch({ ...baseProfile, avatarUrl: 'https://blob.example.com/avatar.jpg' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: /replace photo/i })).toBeInTheDocument());
  });
});

// ─── Resume ──────────────────────────────────────────────────────────────────

describe('ProfileTab — resume', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does NOT show Remove resume button when resumeUrl is null', async () => {
    stubFetch({ ...baseProfile, resumeUrl: null });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument();
  });

  it('shows View, Replace, Remove inline when resumeUrl is set', async () => {
    stubFetch({ ...baseProfile, resumeUrl: 'https://blob.example.com/cv.pdf' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /replace/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^remove$/i })).toBeInTheDocument();
  });

  it('View link points to the resume URL', async () => {
    stubFetch({ ...baseProfile, resumeUrl: 'https://blob.example.com/cv.pdf' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByRole('link', { name: /view/i })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /view/i })).toHaveAttribute('href', 'https://blob.example.com/cv.pdf');
  });

  it('calls DELETE /api/profile/resume when Remove is clicked', async () => {
    stubFetch({ ...baseProfile, resumeUrl: 'https://blob.example.com/cv.pdf' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: /^remove$/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /^remove$/i }));
    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/profile/resume',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('hides View and Remove after successful removal', async () => {
    stubFetch({ ...baseProfile, resumeUrl: 'https://blob.example.com/cv.pdf' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: /^remove$/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /^remove$/i }));
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /view/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument();
    });
  });
});

// ─── Dirty state ─────────────────────────────────────────────────────────────

describe('ProfileTab — dirty state', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does NOT show unsaved banner on initial load', async () => {
    stubFetch(baseProfile);
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    expect(screen.queryByTestId('unsaved-banner')).not.toBeInTheDocument();
  });

  it('shows unsaved banner when a field is changed', async () => {
    stubFetch(baseProfile);
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByDisplayValue('Muhammad Taufiq')).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue('Muhammad Taufiq'), { target: { value: 'Taufiq Edited' } });
    expect(screen.getByTestId('unsaved-banner')).toBeInTheDocument();
  });

  it('hides unsaved banner after successful save', async () => {
    stubFetch(baseProfile);
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByDisplayValue('Muhammad Taufiq')).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue('Muhammad Taufiq'), { target: { value: 'Taufiq Edited' } });
    expect(screen.getByTestId('unsaved-banner')).toBeInTheDocument();
    fireEvent.submit(screen.getByRole('button', { name: /save profile/i }).closest('form')!);
    await waitFor(() => expect(screen.queryByTestId('unsaved-banner')).not.toBeInTheDocument());
  });

  it('banner disappears when field is reverted to original value', async () => {
    stubFetch(baseProfile);
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByDisplayValue('Muhammad Taufiq')).toBeInTheDocument());
    const input = screen.getByDisplayValue('Muhammad Taufiq');
    fireEvent.change(input, { target: { value: 'Taufiq Edited' } });
    expect(screen.getByTestId('unsaved-banner')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Muhammad Taufiq' } });
    expect(screen.queryByTestId('unsaved-banner')).not.toBeInTheDocument();
  });
});

// ─── Bio character count ─────────────────────────────────────────────────────

describe('ProfileTab — bio character count', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows character count for loaded bio', async () => {
    stubFetch({ ...baseProfile, bio: 'IT undergrad at UTeM' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByTestId('bio-char-count')).toBeInTheDocument());
    expect(screen.getByTestId('bio-char-count')).toHaveTextContent('20 / 1000');
  });

  it('updates character count as user types', async () => {
    stubFetch({ ...baseProfile, bio: '' });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByTestId('bio-char-count')).toHaveTextContent('0 / 1000'));
    fireEvent.change(screen.getByPlaceholderText(/tell visitors/i), { target: { value: 'Hello' } });
    expect(screen.getByTestId('bio-char-count')).toHaveTextContent('5 / 1000');
  });

  it('shows count in red when at max length', async () => {
    const longBio = 'a'.repeat(1000);
    stubFetch({ ...baseProfile, bio: longBio });
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByTestId('bio-char-count')).toHaveTextContent('1000 / 1000'));
    expect(screen.getByTestId('bio-char-count')).toHaveClass('text-red-400');
  });
});

// ─── Social icons ────────────────────────────────────────────────────────────

describe('ProfileTab — social link icons', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders GitHub, LinkedIn, X labels', async () => {
    stubFetch(baseProfile);
    render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    expect(screen.getByText(/github url/i)).toBeInTheDocument();
    expect(screen.getByText(/linkedin url/i)).toBeInTheDocument();
    expect(screen.getByText(/x \(twitter\) url/i)).toBeInTheDocument();
  });
});

// ─── Section separators ──────────────────────────────────────────────────────

describe('ProfileTab — section separators', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders horizontal rule separators', async () => {
    stubFetch(baseProfile);
    const { container } = render(<ProfileTab />);
    await waitFor(() => expect(screen.getByText('Save Profile')).toBeInTheDocument());
    const hrs = container.querySelectorAll('hr');
    expect(hrs.length).toBeGreaterThanOrEqual(3);
  });
});
