import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Project } from '@/types/models';
import ModalShell from './ModalShell';
import FormField from './FormField';
import ThemedInput from './ThemedInput';
import ThemedTextarea from './ThemedTextarea';
import ThemedButton from './ThemedButton';

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: (project: Project) => void;
    project?: Project | null;
}

interface FormState {
    title: string;
    summary: string;
    description: string;
    techStack: string;
    githubUrl: string;
    demoUrl: string;
    imageUrl: string;
    featured: boolean;
    status: 'draft' | 'published';
    order: string;
}

const empty: FormState = {
    title: '', summary: '', description: '', techStack: '',
    githubUrl: '', demoUrl: '', imageUrl: '',
    featured: false, status: 'draft', order: '0',
};

export default function ProjectFormModal({ open, onClose, onSaved, project }: Props) {
    const [form, setForm] = useState<FormState>(empty);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (project) {
            setForm({
                title: project.title,
                summary: project.summary ?? '',
                description: project.description,
                techStack: project.techStack,
                githubUrl: project.githubUrl ?? '',
                demoUrl: project.demoUrl ?? '',
                imageUrl: project.imageUrl ?? '',
                featured: project.featured,
                status: project.status,
                order: String(project.order),
            });
        } else {
            setForm(empty);
        }
    }, [project, open]);

    function set(key: keyof FormState, value: string | boolean) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const body = {
            ...form,
            order: parseInt(form.order, 10) || 0,
            summary: form.summary || null,
            githubUrl: form.githubUrl || null,
            demoUrl: form.demoUrl || null,
            imageUrl: form.imageUrl || null,
        };
        try {
            const url = project ? `/api/projects/${project.id}` : '/api/projects';
            const method = project ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Save failed');
            const saved: Project = await res.json();
            toast.success(project ? 'Project updated' : 'Project created');
            onSaved(saved);
            onClose();
        } catch {
            toast.error('Failed to save project');
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModalShell open={open} onClose={onClose} title={project ? 'Edit Project' : 'New Project'} maxWidth="2xl">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Title" required>
                        <ThemedInput value={form.title} onChange={e => set('title', e.target.value)} required />
                    </FormField>
                    <FormField label="Order" hint="Position in the list">
                        <ThemedInput type="number" value={form.order} onChange={e => set('order', e.target.value)} />
                    </FormField>
                </div>

                <FormField label="Summary" hint="Short one-liner shown on cards">
                    <ThemedInput value={form.summary} onChange={e => set('summary', e.target.value)} />
                </FormField>

                <FormField label="Description" required>
                    <ThemedTextarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} required />
                </FormField>

                <FormField label="Tech Stack" hint="Comma-separated: React, TypeScript, Node.js" required>
                    <ThemedInput value={form.techStack} onChange={e => set('techStack', e.target.value)} placeholder="React, TypeScript, Node.js" required />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="GitHub URL">
                        <ThemedInput type="url" value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} placeholder="https://github.com/…" />
                    </FormField>
                    <FormField label="Demo URL">
                        <ThemedInput type="url" value={form.demoUrl} onChange={e => set('demoUrl', e.target.value)} placeholder="https://…" />
                    </FormField>
                </div>

                <FormField label="Image URL">
                    <ThemedInput type="url" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Status">
                        <select
                            value={form.status}
                            onChange={e => set('status', e.target.value as 'draft' | 'published')}
                            className="w-full bg-space-cadet border border-yinmn-blue/30 rounded-lg px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyan-accent/50 transition-colors"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </FormField>

                    <FormField label="Featured">
                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={e => set('featured', e.target.checked)}
                                className="w-4 h-4 accent-cyan-500 rounded"
                            />
                            <span className="text-sm text-slate-300">Show on home page</span>
                        </label>
                    </FormField>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <ThemedButton type="button" variant="secondary" onClick={onClose}>Cancel</ThemedButton>
                    <ThemedButton type="submit" disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : (project ? 'Update' : 'Create')}
                    </ThemedButton>
                </div>
            </form>
        </ModalShell>
    );
}
