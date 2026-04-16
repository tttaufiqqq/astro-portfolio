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
        return <h3 id={id} className="text-2xl font-bold text-white pt-2">{text}</h3>;
    }
    return <h2 id={id} className="text-3xl font-bold text-white pt-4 border-b border-yinmn-blue/30 pb-3">{text}</h2>;
}
