import type { TextBlock } from '@/types/models';

interface Props {
    block: TextBlock;
}

export default function TextRenderer({ block }: Props) {
    return (
        <div
            className="prose prose-invert max-w-none text-slate-400 leading-relaxed [&_a]:text-cyan-accent [&_a:hover]:underline [&_strong]:text-slate-200 [&_strong]:font-semibold [&_p:not(:last-child)]:mb-4"
            dangerouslySetInnerHTML={{ __html: block.content.html }}
        />
    );
}
