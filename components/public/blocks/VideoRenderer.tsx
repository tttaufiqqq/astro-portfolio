import { useState, useEffect, useRef } from 'react';
import type { VideoBlock } from '@/types/models';

interface Props {
    block: VideoBlock;
}

function getEmbedUrl(url: string): string | null {
    const ytMatch = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch?.[1]) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?enablejsapi=1`;

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return null;
}

function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match?.[1] ?? null;
}

const PlayIcon = () => (
    <svg
        className="relative z-10 w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-150"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
    >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

export default function VideoRenderer({ block }: Props) {
    const { url, caption } = block.content;
    const embedUrl = url ? getEmbedUrl(url) : null;
    const ytId = url ? getYouTubeId(url) : null;
    const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
    const [playing, setPlaying] = useState(false);
    const [embedError, setEmbedError] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!playing || !ytId) return;

        function onMessage(e: MessageEvent) {
            if (!iframeRef.current) return;
            if (e.source !== iframeRef.current.contentWindow) return;
            try {
                const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                if (data?.event === 'error' && (data.info === 150 || data.info === 153)) {
                    setEmbedError(true);
                }
            } catch { /* non-JSON messages from other frames */ }
        }

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [playing, ytId]);

    const showIframe = playing && !embedError;

    return (
        <figure>
            <div className="rounded-xl overflow-hidden bg-oxford-blue aspect-video relative group">
                {ytId && embedUrl ? (
                    showIframe ? (
                        <iframe
                            ref={iframeRef}
                            src={`${embedUrl}&autoplay=1`}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title={caption || 'Video'}
                        />
                    ) : (
                        <>
                            {thumbnailUrl && (
                                <img
                                    src={thumbnailUrl}
                                    alt={caption || 'Video thumbnail'}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/30" />

                            {embedError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white text-center px-6">
                                    <PlayIcon />
                                    <span className="text-sm font-medium drop-shadow bg-black/50 px-3 py-1 rounded-full">
                                        This video can&apos;t be embedded
                                    </span>
                                    <a
                                        href={`https://www.youtube.com/watch?v=${ytId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-full"
                                    >
                                        Watch on YouTube ↗
                                    </a>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setPlaying(true)}
                                    className="absolute inset-0 w-full h-full flex items-center justify-center group-hover:bg-black/10 transition-colors"
                                    aria-label={`Play${caption ? `: ${caption}` : ''}`}
                                >
                                    <PlayIcon />
                                </button>
                            )}
                        </>
                    )
                ) : embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={caption || 'Video'}
                    />
                ) : url ? (
                    <video src={url} controls className="w-full h-full" preload="metadata" />
                ) : null}
            </div>

            <div className="mt-2 flex items-center justify-between gap-4">
                {caption && (
                    <figcaption className="text-sm text-slate-500 italic">{caption}</figcaption>
                )}
                {ytId && (
                    <a
                        href={`https://www.youtube.com/watch?v=${ytId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-cyan-accent transition-colors ml-auto shrink-0"
                        aria-label="Watch on YouTube"
                    >
                        Watch on YouTube ↗
                    </a>
                )}
            </div>
        </figure>
    );
}
