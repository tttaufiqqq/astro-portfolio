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

export default function VideoRenderer({ block }: Props) {
    const { url, caption } = block.content;
    const embedUrl = url ? getEmbedUrl(url) : null;

    return (
        <figure>
            <div className="rounded-xl overflow-hidden bg-oxford-blue aspect-video">
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
            </div>
            {caption && (
                <figcaption className="mt-2 text-center text-sm text-slate-500 italic">{caption}</figcaption>
            )}
        </figure>
    );
}
