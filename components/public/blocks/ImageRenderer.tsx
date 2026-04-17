import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ImageBlock } from '@/types/models';

interface Props {
    block: ImageBlock;
}

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
                    <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
            <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
            />
        </div>,
        document.body
    );
}

export default function ImageRenderer({ block }: Props) {
    const { alt, caption, url } = block.content;
    const src = url ?? block.imageUrl;
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!src) return null;

    return (
        <figure>
            <div
                className="rounded-xl overflow-hidden bg-oxford-blue cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
                title="Click to enlarge"
            >
                <img
                    src={src}
                    alt={alt || caption || 'Project image'}
                    loading="lazy"
                    className="w-full h-auto hover:scale-[1.01] transition-transform duration-200"
                />
            </div>
            {caption && (
                <figcaption className="mt-2 text-center text-sm text-slate-500 italic">{caption}</figcaption>
            )}
            {lightboxOpen && (
                <ImageLightbox
                    src={src}
                    alt={alt || caption || 'Project image'}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </figure>
    );
}
