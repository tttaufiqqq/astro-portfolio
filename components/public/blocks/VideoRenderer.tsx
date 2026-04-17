import { useState } from 'react';
import ReactPlayer from 'react-player';
import type { VideoBlock } from '@/types/models';

interface Props {
    block: VideoBlock;
}

function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match?.[1] ?? null;
}

export default function VideoRenderer({ block }: Props) {
    const { url, caption } = block.content;
    const ytId = url ? getYouTubeId(url) : null;
    const [embedError, setEmbedError] = useState(false);

    return (
        <figure>
            <div className="rounded-xl overflow-hidden bg-oxford-blue aspect-video relative">
                {!url ? null : embedError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white text-center px-6 bg-black/40">
                        <svg className="w-12 h-12 opacity-60" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <span className="text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                            This video can&apos;t be embedded
                        </span>
                        {ytId && (
                            <a
                                href={`https://www.youtube.com/watch?v=${ytId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-full"
                            >
                                Watch on YouTube ↗
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="absolute inset-0">
                        <ReactPlayer
                            url={url}
                            width="100%"
                            height="100%"
                            light={!!ytId}
                            controls
                            onError={() => setEmbedError(true)}
                        />
                    </div>
                )}
            </div>

            <div className="mt-2 flex items-center justify-between gap-4">
                {caption && (
                    <figcaption className="text-sm text-slate-500 italic">{caption}</figcaption>
                )}
                {ytId && !embedError && (
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
