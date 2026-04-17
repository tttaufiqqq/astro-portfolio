import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('VideoRenderer — YouTube', () => {
    it('renders an iframe with the correct embed URL for a watch?v= link', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g')} />);
        const iframe = screen.getByTitle('Video') as HTMLIFrameElement;
        expect(iframe.src).toBe('https://www.youtube.com/embed/OiTWeDRF10g');
    });

    it('renders an iframe with the correct embed URL for a youtu.be short link', () => {
        render(<VideoRenderer block={makeBlock('https://youtu.be/OiTWeDRF10g')} />);
        const iframe = screen.getByTitle('Video') as HTMLIFrameElement;
        expect(iframe.src).toBe('https://www.youtube.com/embed/OiTWeDRF10g');
    });

    it('renders an iframe with the correct embed URL for an already-embedded link', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/embed/OiTWeDRF10g')} />);
        const iframe = screen.getByTitle('Video') as HTMLIFrameElement;
        expect(iframe.src).toBe('https://www.youtube.com/embed/OiTWeDRF10g');
    });

    it('renders the "Watch on YouTube" fallback overlay with correct href', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g')} />);
        const link = screen.getByRole('link', { name: /watch on youtube/i });
        expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=OiTWeDRF10g');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders the YouTube thumbnail img with correct src', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g')} />);
        const img = screen.getByRole('img', { name: /video thumbnail/i });
        expect(img).toHaveAttribute('src', 'https://img.youtube.com/vi/OiTWeDRF10g/hqdefault.jpg');
    });

    it('uses caption as iframe title and figcaption when provided', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g', 'BuzzyHive Demo')} />);
        expect(screen.getByTitle('BuzzyHive Demo')).toBeInTheDocument();
        expect(screen.getByText('BuzzyHive Demo')).toBeInTheDocument();
    });

    it('uses caption as thumbnail alt text when provided', () => {
        render(<VideoRenderer block={makeBlock('https://www.youtube.com/watch?v=OiTWeDRF10g', 'BuzzyHive Demo')} />);
        const img = screen.getByRole('img', { name: 'BuzzyHive Demo' });
        expect(img).toBeInTheDocument();
    });
});

describe('VideoRenderer — Vimeo', () => {
    it('renders an iframe with the correct Vimeo embed URL', () => {
        render(<VideoRenderer block={makeBlock('https://vimeo.com/123456789')} />);
        const iframe = screen.getByTitle('Video') as HTMLIFrameElement;
        expect(iframe.src).toBe('https://player.vimeo.com/video/123456789');
    });

    it('does not render a YouTube fallback overlay for Vimeo links', () => {
        render(<VideoRenderer block={makeBlock('https://vimeo.com/123456789')} />);
        expect(screen.queryByRole('link', { name: /watch on youtube/i })).not.toBeInTheDocument();
    });
});

describe('VideoRenderer — plain video URL', () => {
    it('renders a <video> element for a non-platform URL', () => {
        render(<VideoRenderer block={makeBlock('https://example.com/demo.mp4')} />);
        // jsdom doesn't assign an ARIA role to <video>, query directly
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
        expect(screen.queryByRole('link', { name: /watch on youtube/i })).not.toBeInTheDocument();
    });
});
