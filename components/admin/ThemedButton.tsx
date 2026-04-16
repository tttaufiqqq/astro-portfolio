import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
    primary:   'bg-cyan-accent text-space-cadet font-bold rounded-lg px-8 py-3 hover:opacity-90 transition shadow-lg shadow-cyan-accent/10',
    secondary: 'border border-yinmn-blue text-slate-200 rounded-lg px-6 py-2.5 hover:border-cyan-accent/30 hover:text-cyan-accent transition-colors',
    danger:    'border border-red-500/30 text-red-400 rounded-lg px-6 py-2.5 hover:bg-red-500/10 hover:border-red-400 transition-colors',
};

export default function ThemedButton({ variant = 'primary', className, children, ...props }: Props) {
    return (
        <button className={cn(variantClasses[variant], 'disabled:opacity-50 disabled:cursor-not-allowed', className)} {...props}>
            {children}
        </button>
    );
}
