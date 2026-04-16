import { useState, useEffect } from 'react';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import type { Skill } from '@/types/models';
import { resolveIcon } from '@/lib/icon-map';
import SortableRow from '@/components/admin/SortableRow';
import ConfirmDelete from '@/components/admin/ConfirmDelete';
import ThemedButton from '@/components/admin/ThemedButton';
import SkillFormModal from '@/components/admin/SkillFormModal';

function isEmoji(str: string | null | undefined): boolean {
    if (!str) return false;
    const codePoint = str.codePointAt(0);
    return codePoint !== undefined && codePoint > 127;
}

export default function SkillsTab() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Skill | null>(null);

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        fetch('/api/skills', { credentials: 'include' })
            .then(r => r.json())
            .then((data: Skill[]) => setSkills(data))
            .catch(() => toast.error('Failed to load skills'))
            .finally(() => setLoading(false));
    }, []);

    function handleDragEnd(event: import('@dnd-kit/core').DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = skills.findIndex(s => s.id === active.id);
        const newIndex = skills.findIndex(s => s.id === over.id);
        const reordered = arrayMove(skills, oldIndex, newIndex);
        setSkills(reordered);
        fetch('/api/skills/reorder', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reordered.map((s, i) => ({ id: s.id, order: i + 1 }))),
        }).catch(() => toast.error('Reorder failed'));
    }

    function handleSaved(saved: Skill) {
        setSkills(prev => {
            const idx = prev.findIndex(s => s.id === saved.id);
            if (idx !== -1) {
                const next = [...prev];
                next[idx] = saved;
                return next;
            }
            return [...prev, saved];
        });
    }

    function handleDelete(id: number) {
        fetch(`/api/skills/${id}`, { method: 'DELETE', credentials: 'include' })
            .then(r => {
                if (!r.ok) throw new Error();
                setSkills(prev => prev.filter(s => s.id !== id));
                toast.success('Skill deleted');
            })
            .catch(() => toast.error('Delete failed'));
    }

    function openCreate() { setEditing(null); setModalOpen(true); }
    function openEdit(skill: Skill) { setEditing(skill); setModalOpen(true); }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-cyan-accent" size={24} />
            </div>
        );
    }

    // Group by category for display
    const categories = Array.from(new Set(skills.map(s => s.category)));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-white">Skills</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{skills.length} skill{skills.length !== 1 ? 's' : ''} · drag to reorder</p>
                </div>
                <ThemedButton onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm">
                    <Plus size={14} />
                    New Skill
                </ThemedButton>
            </div>

            {skills.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <p>No skills yet.</p>
                    <button onClick={openCreate} className="mt-2 text-sm text-cyan-accent hover:underline">Add your first skill</button>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {skills.map(skill => {
                                const useEmoji = isEmoji(skill.icon);
                                const Icon = useEmoji ? null : resolveIcon(skill.icon);
                                return (
                                    <SortableRow key={skill.id} id={skill.id}>
                                        <div className="w-8 h-8 rounded-lg bg-space-cadet border border-yinmn-blue/30 flex items-center justify-center flex-shrink-0 text-sm">
                                            {useEmoji
                                                ? skill.icon
                                                : Icon && <Icon size={15} className="text-cyan-accent" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-white">{skill.name}</span>
                                            <span className="ml-2 text-xs text-slate-500">{skill.category}</span>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button type="button" onClick={() => openEdit(skill)}
                                                className="text-slate-400 hover:text-cyan-accent transition-colors p-1.5 rounded-lg hover:bg-cyan-accent/5">
                                                <Pencil size={14} />
                                            </button>
                                            <ConfirmDelete onConfirm={() => handleDelete(skill.id)} prompt="Delete this skill?" />
                                        </div>
                                    </SortableRow>
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Category summary */}
            {categories.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-yinmn-blue/20 text-slate-400 border border-yinmn-blue/20">
                            {cat} · {skills.filter(s => s.category === cat).length}
                        </span>
                    ))}
                </div>
            )}

            <SkillFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
                skill={editing}
            />
        </div>
    );
}
