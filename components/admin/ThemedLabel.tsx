import { cn } from '@/lib/utils';

interface Props extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export default function ThemedLabel({ className, children, ...props }: Props) {
    return (
        <label className={cn('block text-sm font-medium text-slate-300 mb-1', className)} {...props}>
            {children}
        </label>
    );
}
