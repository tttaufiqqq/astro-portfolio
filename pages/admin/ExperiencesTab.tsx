import { useState, useEffect } from 'react';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import type { Experience } from '@/types/models';
import SortableRow from '@/components/admin/SortableRow';
import ConfirmDelete from '@/components/admin/ConfirmDelete';
import ThemedButton from '@/components/admin/ThemedButton';
import ExperienceFormModal from '@/components/admin/ExperienceFormModal';

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Present';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ExperiencesTab() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Experience | null>(null);

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        fetch('/api/experiences', { credentials: 'include' })
            .then(r => r.json())
            .then((data: Experience[]) => setExperiences(data))
            .catch(() => toast.error('Failed to load experiences'))
            .finally(() => setLoading(false));
    }, []);

    function handleDragEnd(event: import('@dnd-kit/core').DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = experiences.findIndex(e => e.id === active.id);
        const newIndex = experiences.findIndex(e => e.id === over.id);
        const reordered = arrayMove(experiences, oldIndex, newIndex);
        setExperiences(reordered);
        fetch('/api/experiences/reorder', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reordered.map((e, i) => ({ id: e.id, order: i + 1 }))),
        }).catch(() => toast.error('Reorder failed'));
    }

    function handleSaved(saved: Experience) {
        setExperiences(prev => {
            const idx = prev.findIndex(e => e.id === saved.id);
            if (idx !== -1) {
                const next = [...prev];
                next[idx] = saved;
                return next;
            }
            return [...prev, saved];
        });
    }

    function handleDelete(id: number) {
        fetch(`/api/experiences/${id}`, { method: 'DELETE', credentials: 'include' })
            .then(r => {
                if (!r.ok) throw new Error();
                setExperiences(prev => prev.filter(e => e.id !== id));
                toast.success('Experience deleted');
            })
            .catch(() => toast.error('Delete failed'));
    }

    function openCreate() { setEditing(null); setModalOpen(true); }
    function openEdit(exp: Experience) { setEditing(exp); setModalOpen(true); }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-cyan-accent" size={24} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-white">Experience</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{experiences.length} entr{experiences.length !== 1 ? 'ies' : 'y'} · drag to reorder</p>
                </div>
                <ThemedButton onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm">
                    <Plus size={14} />
                    New Experience
                </ThemedButton>
            </div>

            {experiences.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <p>No experience entries yet.</p>
                    <button onClick={openCreate} className="mt-2 text-sm text-cyan-accent hover:underline">Add your first entry</button>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={experiences.map(e => e.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {experiences.map(exp => (
                                <SortableRow key={exp.id} id={exp.id} align="start">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-white">{exp.role}</span>
                                            {exp.current && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-accent/10 text-cyan-accent font-medium">
                                                    current
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">{exp.company}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </p>
                                        {exp.description && (
                                            <p className="text-xs text-slate-600 mt-1 truncate">{exp.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                                        <button type="button" onClick={() => openEdit(exp)}
                                            className="text-slate-400 hover:text-cyan-accent transition-colors p-1.5 rounded-lg hover:bg-cyan-accent/5">
                                            <Pencil size={14} />
                                        </button>
                                        <ConfirmDelete onConfirm={() => handleDelete(exp.id)} prompt="Delete this entry?" />
                                    </div>
                                </SortableRow>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <ExperienceFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
                experience={editing}
            />
        </div>
    );
}
