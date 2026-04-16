import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    id: number;
    align?: 'center' | 'start';
    children: React.ReactNode;
}

export default function SortableRow({ id, align = 'center', children }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style}
            className={cn('flex gap-3 p-4 bg-oxford-blue border border-yinmn-blue/30 rounded-xl hover:border-yinmn-blue/50 transition-colors',
                align === 'start' ? 'items-start' : 'items-center')}>
            <button type="button" {...attributes} {...listeners} aria-label="Drag to reorder"
                className={cn('text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none', align === 'start' && 'mt-0.5')}>
                <GripVertical size={16} />
            </button>
            {children}
        </div>
    );
}
