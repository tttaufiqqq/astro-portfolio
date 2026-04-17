import type { HeadingBlock } from '@/types/models';

interface Props {
    block: HeadingBlock;
}

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

export default function HeadingRenderer({ block }: Props) {
    const { text, level } = block.content;
    const id = slugify(text);

    if (level === 3) {
        return (
            <h3 id={id} className="text-xl font-semibold text-slate-100 pt-2 pl-3 border-l-2 border-cyan-accent/50">
                {text}
            </h3>
        );
    }
    return (
        <h2 id={id} className="text-3xl font-bold text-white pt-4 pb-3 border-b border-yinmn-blue/30 flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-cyan-accent flex-shrink-0" aria-hidden="true" />
            {text}
        </h2>
    );
}
