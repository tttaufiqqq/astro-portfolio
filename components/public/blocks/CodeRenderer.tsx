import hljs from 'highlight.js';
import type { CodeBlock } from '@/types/models';

interface Props {
    block: CodeBlock;
}

export default function CodeRenderer({ block }: Props) {
    const { code, language } = block.content;

    const highlighted = language
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value;

    return (
        <div className="rounded-xl overflow-hidden border border-yinmn-blue/30">
            {language && (
                <div className="px-4 py-2 bg-oxford-blue border-b border-yinmn-blue/30 text-xs font-mono text-slate-500 uppercase tracking-wider">
                    {language}
                </div>
            )}
            <pre className="bg-space-cadet overflow-x-auto p-4 text-sm">
                <code
                    className={language ? `language-${language}` : undefined}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />
            </pre>
        </div>
    );
}
