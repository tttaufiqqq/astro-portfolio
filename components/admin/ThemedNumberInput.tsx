import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    value: string;
    onChange: (value: string) => void;
    min?: number;
    max?: number;
    error?: string;
}

export default function ThemedNumberInput({ value, onChange, min, max, error }: Props) {
    const num = parseInt(value, 10) || 0;

    function decrement() {
        if (min !== undefined && num <= min) return;
        onChange(String(num - 1));
    }

    function increment() {
        if (max !== undefined && num >= max) return;
        onChange(String(num + 1));
    }

    return (
        <div className={cn(
            'flex items-center bg-space-cadet border rounded-lg overflow-hidden transition-colors duration-200',
            error ? 'border-red-500/60' : 'border-yinmn-blue/30',
        )}>
            <button
                type="button"
                onClick={decrement}
                className="px-3 py-3 text-slate-400 hover:text-slate-200 hover:bg-yinmn-blue/20 transition-colors border-r border-yinmn-blue/30"
            >
                <Minus size={13} />
            </button>
            <input
                type="number"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="flex-1 bg-transparent text-center text-sm text-slate-200 py-3 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
                type="button"
                onClick={increment}
                className="px-3 py-3 text-slate-400 hover:text-slate-200 hover:bg-yinmn-blue/20 transition-colors border-l border-yinmn-blue/30"
            >
                <Plus size={13} />
            </button>
        </div>
    );
}
