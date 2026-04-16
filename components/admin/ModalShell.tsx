import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const maxWidthMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' } as const;

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    maxWidth?: keyof typeof maxWidthMap;
    children: React.ReactNode;
}

export default function ModalShell({ open, onClose, title, maxWidth = 'lg', children }: Props) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className={cn('relative w-full max-h-[90vh] overflow-y-auto bg-oxford-blue border border-yinmn-blue/30 rounded-xl shadow-xl', maxWidthMap[maxWidth])}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-yinmn-blue/30 sticky top-0 bg-oxford-blue z-10">
                    <h2 className="text-white font-bold text-lg">{title}</h2>
                    <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
