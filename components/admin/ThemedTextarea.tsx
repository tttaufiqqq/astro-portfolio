import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

const ThemedTextarea = forwardRef<HTMLTextAreaElement, Props>(({ className, error, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn(
            'w-full bg-space-cadet border rounded-lg',
            'text-slate-200 placeholder:text-slate-500',
            'focus:outline-none focus:ring-0',
            'px-4 py-3 text-sm transition-colors duration-200 resize-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
                ? 'border-red-500/60 focus:border-red-500/80'
                : 'border-yinmn-blue/30 focus:border-cyan-accent/50',
            className,
        )}
        {...props}
    />
));
ThemedTextarea.displayName = 'ThemedTextarea';
export default ThemedTextarea;
