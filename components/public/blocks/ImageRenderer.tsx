import type { ImageBlock } from '@/types/models';

interface Props {
    block: ImageBlock;
}

export default function ImageRenderer({ block }: Props) {
    const { alt, caption, url } = block.content;
    const src = url ?? block.imageUrl;

    if (!src) return null;

    return (
        <figure>
            <div className="rounded-xl overflow-hidden bg-oxford-blue">
                <img src={src} alt={alt || ''} loading="lazy" className="w-full h-auto" />
            </div>
            {caption && (
                <figcaption className="mt-2 text-center text-sm text-slate-500 italic">{caption}</figcaption>
            )}
        </figure>
    );
}
