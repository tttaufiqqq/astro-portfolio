import { useState } from 'react';
import { iconMap, brandIconMap, resolveIcon, LUCIDE_ICON_NAMES, BRAND_ICON_NAMES } from '@/lib/icon-map';
import { cn } from '@/lib/utils';
import ThemedInput from './ThemedInput';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

function isEmoji(str: string) {
    return str.length > 0 && !LUCIDE_ICON_NAMES.includes(str.toLowerCase()) && !BRAND_ICON_NAMES.includes(str.toLowerCase());
}

export default function IconPicker({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<'lucide' | 'brand'>('brand');

    const PreviewIcon = resolveIcon(isEmoji(value) ? null : value);
    const showEmoji = value && isEmoji(value);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                {/* Live preview */}
                <div className="w-10 h-10 rounded-lg bg-space-cadet border border-yinmn-blue/30 flex items-center justify-center flex-shrink-0 text-lg">
                    {showEmoji
                        ? value
                        : <PreviewIcon size={18} className="text-cyan-accent" />
                    }
                </div>
                <ThemedInput
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Type icon name or emoji…"
                    className="flex-1"
                    onFocus={() => setOpen(true)}
                />
                {value && (
                    <button type="button" onClick={() => onChange('')}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
                        Clear
                    </button>
                )}
            </div>

            {/* Icon grid picker */}
            {open && (
                <div className="bg-space-cadet border border-yinmn-blue/30 rounded-xl p-3">
                    {/* Tab switcher */}
                    <div className="flex gap-2 mb-2">
                        <button type="button" onClick={() => setTab('brand')}
                            className={cn('text-xs px-2 py-1 rounded-md transition-colors',
                                tab === 'brand' ? 'bg-cyan-accent/20 text-cyan-accent' : 'text-slate-500 hover:text-slate-300')}>
                            Brand icons
                        </button>
                        <button type="button" onClick={() => setTab('lucide')}
                            className={cn('text-xs px-2 py-1 rounded-md transition-colors',
                                tab === 'lucide' ? 'bg-cyan-accent/20 text-cyan-accent' : 'text-slate-500 hover:text-slate-300')}>
                            Generic icons
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                        {tab === 'brand' ? 'Brand logos — React, Laravel, TypeScript, etc.' : 'Generic dev icons — or type an emoji above'}
                    </p>
                    <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                        {tab === 'brand'
                            ? BRAND_ICON_NAMES.map(name => {
                                const Icon = brandIconMap[name];
                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        title={name}
                                        onClick={() => { onChange(name); setOpen(false); }}
                                        className={cn(
                                            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                            value === name
                                                ? 'bg-cyan-accent/20 text-cyan-accent'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                        )}
                                    >
                                        <Icon size={16} />
                                    </button>
                                );
                            })
                            : LUCIDE_ICON_NAMES.map(name => {
                                const Icon = iconMap[name];
                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        title={name}
                                        onClick={() => { onChange(name); setOpen(false); }}
                                        className={cn(
                                            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                            value === name
                                                ? 'bg-cyan-accent/20 text-cyan-accent'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                        )}
                                    >
                                        <Icon size={16} />
                                    </button>
                                );
                            })
                        }
                    </div>
                    <button type="button" onClick={() => setOpen(false)}
                        className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
