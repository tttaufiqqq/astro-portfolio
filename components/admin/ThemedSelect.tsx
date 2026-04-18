import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
    value: string;
    label: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    error?: string;
}

export default function ThemedSelect({ value, onChange, options, placeholder = 'Select…', error }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={cn(
                    'w-full flex items-center justify-between gap-2 bg-space-cadet border rounded-lg px-4 py-3 text-sm text-left focus:outline-none transition-colors duration-200',
                    error
                        ? 'border-red-500/60 focus:border-red-500/80'
                        : 'border-yinmn-blue/30 focus:border-cyan-accent/50',
                )}
            >
                <span className={selected ? 'text-slate-200' : 'text-slate-500'}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    size={14}
                    className={cn('text-slate-400 flex-shrink-0 transition-transform duration-150', open && 'rotate-180')}
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-oxford-blue border border-yinmn-blue/30 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={cn(
                                'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors',
                                opt.value === value
                                    ? 'text-cyan-accent bg-yinmn-blue/10 hover:bg-yinmn-blue/20'
                                    : 'text-slate-300 hover:bg-yinmn-blue/20'
                            )}
                        >
                            {opt.label}
                            {opt.value === value && <Check size={13} className="text-cyan-accent flex-shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
