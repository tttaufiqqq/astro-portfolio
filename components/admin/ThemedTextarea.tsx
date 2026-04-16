import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

const ThemedTextarea = forwardRef<HTMLTextAreaElement, Props>(({ className, error: _error, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn(
            'w-full bg-space-cadet border border-yinmn-blue/30 rounded-lg',
            'text-slate-200 placeholder:text-slate-500',
            'focus:border-cyan-accent/50 focus:outline-none focus:ring-0',
            'px-4 py-3 text-sm transition-colors duration-200 resize-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
        )}
        {...props}
    />
));
ThemedTextarea.displayName = 'ThemedTextarea';
export default ThemedTextarea;
