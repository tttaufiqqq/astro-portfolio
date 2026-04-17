import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { VideoBlock } from '@/types/models';
import VideoRenderer from '@/components/public/blocks/VideoRenderer';

function makeBlock(url: string, caption = ''): VideoBlock {
    return {
        id: 1, projectId: 1, type: 'video', order: 0,
        content: { url, caption },
        language: null, imageUrl: null,
        createdAt: '', updatedAt: '',
    };
}

describe('VideoRenderer — YouTube (before play)', () => {
    it('does not render an iframe before the play button is clicked', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g')} />);
        expect(document.querySelector('iframe')).not.toBeInTheDocument();
    });

    it('renders the YouTube thumbnail image before clicking play', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g')} />);
        const img = screen.getByRole('img', { name: /video thumbnail/i });
        expect(img).toHaveAttribute('src', 'https://img.youtube.com/vi/OiTWeDRF10g/hqdefault.jpg');
    });

    it('renders a play button before clicking', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g')} />);
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    it('renders the "Watch on YouTube" link with correct href before clicking play', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g')} />);
        const link = screen.getByRole('link', { name: /watch on youtube/i });
        expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=OiTWeDRF10g');
        expect(link).toHaveAttribute('target', '_blank');
    });
});

describe('VideoRenderer — YouTube (after play clicked)', () => {
    it('renders an iframe with autoplay after clicking the play button (watch?v= link)', async () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g')} />);
        await userEvent.click(screen.getByRole('button', { name: /play/i }));
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        expect(iframe).toBeInTheDocument();
        expect(iframe.src).toBe('https://www.youtube-nocookie.com/embed/OiTWeDRF10g?autoplay=1');
    });

    it('renders an iframe with autoplay after clicking the play button (youtu.be link)', async () => {
        render(<VideoRenderer block={makeBlock('https://youtu.be/OiTWeDRF10g')} />);
        await userEvent.click(screen.getByRole('button', { name: /play/i }));
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        expect(iframe).toBeInTheDocument();
        expect(iframe.src).toBe('https://www.youtube-nocookie.com/embed/OiTWeDRF10g?autoplay=1');
    });

    it('renders an iframe with autoplay after clicking the play button (already-embedded link)', async () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube-nocookie.com/embed/OiTWeDRF10g')} />);
        await userEvent.click(screen.getByRole('button', { name: /play/i }));
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        expect(iframe).toBeInTheDocument();
        expect(iframe.src).toBe('https://www.youtube-nocookie.com/embed/OiTWeDRF10g?autoplay=1');
    });

    it('uses caption as iframe title after clicking play', async () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g', 'BuzzyHive Demo')} />);
        await userEvent.click(screen.getByRole('button', { name: /play/i }));
        expect(screen.getByTitle('BuzzyHive Demo')).toBeInTheDocument();
    });
});

describe('VideoRenderer — YouTube (caption)', () => {
    it('shows caption as figcaption', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g', 'BuzzyHive Demo')} />);
        expect(screen.getByText('BuzzyHive Demo')).toBeInTheDocument();
    });

    it('uses caption as thumbnail alt text', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g', 'BuzzyHive Demo')} />);
        const img = screen.getByRole('img', { name: 'BuzzyHive Demo' });
        expect(img).toBeInTheDocument();
    });
});

describe('VideoRenderer — Vimeo', () => {
    it('renders an iframe immediately with the correct Vimeo embed URL', () => {
        render(<VideoRenderer block={makeBlock('https://vimeo.com/123456789')} />);
        const iframe = screen.getByTitle('Video') as HTMLIFrameElement;
        expect(iframe.src).toBe('https://player.vimeo.com/video/123456789');
    });

    it('does not render a YouTube "Watch on YouTube" link for Vimeo', () => {
        render(<VideoRenderer block={makeBlock('https://vimeo.com/123456789')} />);
        expect(screen.queryByRole('link', { name: /watch on youtube/i })).not.toBeInTheDocument();
    });
});

describe('VideoRenderer — plain video URL', () => {
    it('renders a <video> element for a non-platform URL', () => {
        render(<VideoRenderer block={makeBlock('https://example.com/demo.mp4')} />);
        const video = document.querySelector('video')!;
        expect(video).toBeInTheDocument();
        expect(video.src).toBe('https://example.com/demo.mp4');
    });
});

describe('VideoRenderer — empty URL', () => {
    it('renders nothing inside the container when url is empty', () => {
        render(<VideoRenderer block={makeBlock('')} />);
        expect(document.querySelector('iframe')).not.toBeInTheDocument();
        expect(document.querySelector('video')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /watch on youtube/i })).not.toBeInTheDocument();
    });
});
