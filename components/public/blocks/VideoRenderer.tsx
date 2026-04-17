import type { VideoBlock } from '@/types/models';

interface Props {
    block: VideoBlock;
}

function getEmbedUrl(url: string): string | null {
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch?.[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return null;
}

function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match?.[1] ?? null;
}

export default function VideoRenderer({ block }: Props) {
    const { url, caption } = block.content;
    const embedUrl = url ? getEmbedUrl(url) : null;
    const ytId = url ? getYouTubeId(url) : null;
    const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

    return (
        <figure>
            <div className="rounded-xl overflow-hidden bg-oxford-blue aspect-video relative group">
                {embedUrl ? (
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

                {/* Fallback overlay — shown on top if iframe fails to play (e.g. Error 153) */}
                {ytId && (
                    <a
                        href={`https://www.youtube.com/watch?v=${ytId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        aria-label="Watch on YouTube"
                    >
                        {thumbnailUrl && (
                            <img
                                src={thumbnailUrl}
                                alt={caption || 'Video thumbnail'}
                                className="absolute inset-0 w-full h-full object-cover -z-10"
                            />
                        )}
                        <svg className="w-16 h-16 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span className="mt-2 text-white text-sm font-medium drop-shadow">Watch on YouTube</span>
                    </a>
                )}
            </div>
            {caption && (
                <figcaption className="mt-2 text-center text-sm text-slate-500 italic">{caption}</figcaption>
            )}
        </figure>
    );
}
