import { useState, useEffect } from 'react';
import { Plus, Pencil, ExternalLink, Loader2, LayoutList } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import type { Project } from '@/types/models';
import SortableRow from '@/components/admin/SortableRow';
import ConfirmDelete from '@/components/admin/ConfirmDelete';
import ThemedButton from '@/components/admin/ThemedButton';
import ProjectFormModal from '@/components/admin/ProjectFormModal';
import BlockEditorModal from '@/components/admin/BlockEditorModal';

export default function ProjectsTab() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [blockProject, setBlockProject] = useState<Project | null>(null);

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        fetch('/api/projects', { credentials: 'include' })
            .then(r => r.json())
            .then((data: Project[]) => setProjects(data))
            .catch(() => toast.error('Failed to load projects'))
            .finally(() => setLoading(false));
    }, []);

    function handleDragEnd(event: import('@dnd-kit/core').DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = projects.findIndex(p => p.id === active.id);
        const newIndex = projects.findIndex(p => p.id === over.id);
        const reordered = arrayMove(projects, oldIndex, newIndex);
        setProjects(reordered);
        fetch('/api/projects/reorder', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reordered.map((p, i) => ({ id: p.id, order: i + 1 }))),
        }).catch(() => toast.error('Reorder failed'));
    }

    function handleSaved(saved: Project) {
        setProjects(prev => {
            const idx = prev.findIndex(p => p.id === saved.id);
            if (idx !== -1) {
                const next = [...prev];
                next[idx] = saved;
                return next;
            }
            return [...prev, saved];
        });
    }

    function handleDelete(id: number) {
        fetch(`/api/projects/${id}`, { method: 'DELETE', credentials: 'include' })
            .then(r => {
                if (!r.ok) throw new Error();
                setProjects(prev => prev.filter(p => p.id !== id));
                toast.success('Project deleted');
            })
            .catch(() => toast.error('Delete failed'));
    }

    function openCreate() { setEditing(null); setModalOpen(true); }
    function openEdit(project: Project) { setEditing(project); setModalOpen(true); }
    function openBlocks(project: Project) { setBlockProject(project); }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-cyan-accent" size={24} />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-white">Projects</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
                </div>
                <ThemedButton onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm">
                    <Plus size={14} />
                    New Project
                </ThemedButton>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <p>No projects yet.</p>
                    <button onClick={openCreate} className="mt-2 text-sm text-cyan-accent hover:underline">Add your first project</button>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {projects.map(project => (
                                <SortableRow key={project.id} id={project.id}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-white truncate">{project.title}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                project.status === 'published'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : 'bg-slate-700 text-slate-400'
                                            }`}>
                                                {project.status}
                                            </span>
                                            {project.featured && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-accent/10 text-cyan-accent font-medium">
                                                    featured
                                                </span>
                                            )}
                                        </div>
                                        {project.summary && (
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{project.summary}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {project.demoUrl && (
                                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                                                className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-white/5">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                        <button type="button" onClick={() => openBlocks(project)}
                                            title="Edit content blocks"
                                            className="text-slate-400 hover:text-purple-400 transition-colors p-1.5 rounded-lg hover:bg-purple-400/5">
                                            <LayoutList size={14} />
                                        </button>
                                        <button type="button" onClick={() => openEdit(project)}
                                            className="text-slate-400 hover:text-cyan-accent transition-colors p-1.5 rounded-lg hover:bg-cyan-accent/5">
                                            <Pencil size={14} />
                                        </button>
                                        <ConfirmDelete onConfirm={() => handleDelete(project.id)} prompt="Delete this project?" />
                                    </div>
                                </SortableRow>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <ProjectFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
                project={editing}
            />

            <BlockEditorModal
                open={blockProject !== null}
                onClose={() => setBlockProject(null)}
                projectId={blockProject?.id ?? 0}
                projectTitle={blockProject?.title ?? ''}
            />
        </div>
    );
}
