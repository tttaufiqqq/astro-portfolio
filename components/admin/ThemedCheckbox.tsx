import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children: React.ReactNode;
}

export default function ThemedCheckbox({ checked, onChange, children }: Props) {
    return (
        <div
            onClick={() => onChange(!checked)}
            className="flex items-center gap-3 cursor-pointer select-none group"
        >
            <div
                className={cn(
                    'w-5 h-5 flex-shrink-0 rounded-md border transition-all duration-150 flex items-center justify-center',
                    checked
                        ? 'bg-cyan-accent/20 border-cyan-accent/70'
                        : 'bg-space-cadet border-yinmn-blue/30 group-hover:border-yinmn-blue/60',
                )}
            >
                {checked && <Check size={12} className="text-cyan-accent" strokeWidth={2.5} />}
            </div>
            <span className="text-sm text-slate-300">{children}</span>
        </div>
    );
}
