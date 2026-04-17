import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, ChevronDown, ChevronUp, Loader2, Check, Upload, X, Type, AlignLeft, Image, Video, Code2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import ModalShell from './ModalShell';
import SortableRow from './SortableRow';
import ConfirmDelete from './ConfirmDelete';
import ThemedInput from './ThemedInput';
import ThemedTextarea from './ThemedTextarea';
import ThemedButton from './ThemedButton';
import FormField from './FormField';
import { cn } from '@/lib/utils';
import ThemedSelect from './ThemedSelect';

const HEADING_LEVELS = [
    { value: '2', label: 'H2 — Section heading'    },
    { value: '3', label: 'H3 — Subsection heading' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BlockType = 'heading' | 'text' | 'image' | 'video' | 'code';

interface AdminBlock {
    id: number;
    projectId: number;
    type: BlockType;
    order: number;
    content: string;    // raw JSON string from DB
    language: string | null;
    imageUrl: string | null;
}

interface HeadingForm  { text: string; level: '2' | '3' }
interface TextForm     { html: string }
interface ImageForm    { alt: string; caption: string; imageUrl: string }
interface VideoForm    { url: string; caption: string }
interface CodeForm     { code: string; language: string }
type AnyForm = HeadingForm | TextForm | ImageForm | VideoForm | CodeForm;

interface Props {
    open: boolean;
    onClose: () => void;
    projectId: number;
    projectTitle: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeParse(raw: string): Record<string, unknown> {
    try { return JSON.parse(raw); } catch { return {}; }
}

function blockToForm(block: AdminBlock): AnyForm {
    const c = safeParse(block.content);
    switch (block.type) {
        case 'heading': return { text: String(c.text ?? ''), level: String(c.level ?? '2') as '2' | '3' };
        case 'text':    return { html: String(c.html ?? '') };
        case 'image':   return { alt: String(c.alt ?? ''), caption: String(c.caption ?? ''), imageUrl: block.imageUrl ?? '' };
        case 'video':   return { url: String(c.url ?? ''), caption: String(c.caption ?? '') };
        case 'code':    return { code: String(c.code ?? ''), language: block.language ?? String(c.language ?? '') };
    }
}

function formToPayload(type: BlockType, form: AnyForm): { content: object; language?: string | null; imageUrl?: string | null } {
    switch (type) {
        case 'heading': {
            const f = form as HeadingForm;
            return { content: { text: f.text, level: parseInt(f.level) } };
        }
        case 'text': {
            const f = form as TextForm;
            return { content: { html: f.html } };
        }
        case 'image': {
            const f = form as ImageForm;
            return { content: { alt: f.alt, caption: f.caption }, imageUrl: f.imageUrl || null };
        }
        case 'video': {
            const f = form as VideoForm;
            return { content: { url: f.url, caption: f.caption } };
        }
        case 'code': {
            const f = form as CodeForm;
            return { content: { code: f.code, language: f.language }, language: f.language || null };
        }
    }
}

function emptyForm(type: BlockType): AnyForm {
    switch (type) {
        case 'heading': return { text: '', level: '2' };
        case 'text':    return { html: '' };
        case 'image':   return { alt: '', caption: '', imageUrl: '' };
        case 'video':   return { url: '', caption: '' };
        case 'code':    return { code: '', language: 'typescript' };
    }
}

function contentPreview(block: AdminBlock): string {
    const c = safeParse(block.content);
    switch (block.type) {
        case 'heading': return `H${c.level ?? 2}: ${c.text ?? ''}`;
        case 'text':    return String(c.html ?? '').replace(/<[^>]+>/g, '').slice(0, 80) || '(empty)';
        case 'image':   return `Image — ${c.alt ?? c.caption ?? block.imageUrl ?? ''}`;
        case 'video':   return `Video — ${c.url ?? ''}`;
        case 'code':    return `Code (${block.language ?? c.language ?? '?'}) — ${String(c.code ?? '').split('\n')[0].slice(0, 60)}`;
    }
}

const TYPE_LABELS: Record<BlockType, string> = {
    heading: 'Heading', text: 'Text', image: 'Image', video: 'Video', code: 'Code',
};
const TYPE_COLORS: Record<BlockType, string> = {
    heading: 'bg-purple-500/10 text-purple-400',
    text:    'bg-blue-500/10 text-blue-400',
    image:   'bg-green-500/10 text-green-400',
    video:   'bg-orange-500/10 text-orange-400',
    code:    'bg-yellow-500/10 text-yellow-400',
};
const TYPE_ICONS: Record<BlockType, React.ReactNode> = {
    heading: <Type size={12} />,
    text:    <AlignLeft size={12} />,
    image:   <Image size={12} />,
    video:   <Video size={12} />,
    code:    <Code2 size={12} />,
};

function BlockTypePicker({ value, onChange }: { value: BlockType; onChange: (t: BlockType) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 bg-oxford-blue border border-yinmn-blue/30 rounded-lg px-3 py-1.5 hover:border-cyan-accent/50 focus:outline-none focus:border-cyan-accent/50 transition-colors"
            >
                <span className={cn('flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium', TYPE_COLORS[value])}>
                    {TYPE_ICONS[value]}
                    {TYPE_LABELS[value]}
                </span>
                <ChevronDown size={12} className={cn('text-slate-400 transition-transform duration-150', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1.5 bg-oxford-blue border border-yinmn-blue/30 rounded-xl shadow-2xl z-50 py-1.5 min-w-[140px]">
                    {(Object.keys(TYPE_LABELS) as BlockType[]).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => { onChange(t); setOpen(false); }}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-yinmn-blue/20 transition-colors',
                                t === value && 'bg-yinmn-blue/10'
                            )}
                        >
                            <span className={cn('flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium', TYPE_COLORS[t])}>
                                {TYPE_ICONS[t]}
                                {TYPE_LABELS[t]}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Block inline form
// ---------------------------------------------------------------------------

function BlockForm({ type, form, onChange }: { type: BlockType; form: AnyForm; onChange: (f: AnyForm) => void }) {
    const [uploading, setUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    function set(key: string, value: string) {
        onChange({ ...form, [key]: value } as AnyForm);
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'blocks');
            const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
            if (!res.ok) throw new Error();
            const { url } = await res.json();
            set('imageUrl', url);
        } catch {
            toast.error('Image upload failed');
        } finally {
            setUploading(false);
            if (imageInputRef.current) imageInputRef.current.value = '';
        }
    }

    switch (type) {
        case 'heading': {
            const f = form as HeadingForm;
            return (
                <div className="space-y-3">
                    <FormField label="Level">
                        <ThemedSelect
                            value={f.level}
                            onChange={v => set('level', v)}
                            options={HEADING_LEVELS}
                        />
                    </FormField>
                    <FormField label="Text" required>
                        <ThemedInput value={f.text} onChange={e => set('text', e.target.value)} required />
                    </FormField>
                </div>
            );
        }
        case 'text': {
            const f = form as TextForm;
            return (
                <FormField label="Content" hint="Supports HTML — e.g. <strong>bold</strong>, <a href='…'>link</a>">
                    <ThemedTextarea value={f.html} onChange={e => set('html', e.target.value)} rows={5} />
                </FormField>
            );
        }
        case 'image': {
            const f = form as ImageForm;
            return (
                <div className="space-y-3">
                    <FormField label="Image">
                        <div className="space-y-2">
                            {f.imageUrl && (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-yinmn-blue/30">
                                    <img src={f.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => set('imageUrl', '')}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <div className="flex items-center gap-2">
                                <button type="button" disabled={uploading} onClick={() => imageInputRef.current?.click()}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs border border-yinmn-blue/40 rounded-lg text-slate-400 hover:text-slate-200 hover:border-cyan-accent/40 transition-colors disabled:opacity-50">
                                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                    {uploading ? 'Uploading…' : f.imageUrl ? 'Replace image' : 'Upload image'}
                                </button>
                                {f.imageUrl && (
                                    <button type="button" onClick={() => set('imageUrl', '')}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs border border-yinmn-blue/40 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-400/40 transition-colors">
                                        <X size={12} /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </FormField>
                    <FormField label="Alt text">
                        <ThemedInput value={f.alt} onChange={e => set('alt', e.target.value)} placeholder="Describe the image" />
                    </FormField>
                    <FormField label="Caption">
                        <ThemedInput value={f.caption} onChange={e => set('caption', e.target.value)} />
                    </FormField>
                </div>
            );
        }
        case 'video': {
            const f = form as VideoForm;
            return (
                <div className="space-y-3">
                    <FormField label="Video URL" required>
                        <ThemedInput type="url" value={f.url} onChange={e => set('url', e.target.value)} placeholder="https://youtube.com/… or direct mp4" required />
                    </FormField>
                    <FormField label="Caption">
                        <ThemedInput value={f.caption} onChange={e => set('caption', e.target.value)} />
                    </FormField>
                </div>
            );
        }
        case 'code': {
            const f = form as CodeForm;
            return (
                <div className="space-y-3">
                    <FormField label="Language">
                        <ThemedInput value={f.language} onChange={e => set('language', e.target.value)} placeholder="typescript, python, bash…" />
                    </FormField>
                    <FormField label="Code" required>
                        <ThemedTextarea value={f.code} onChange={e => set('code', e.target.value)} rows={8}
                            className="font-mono text-xs" required />
                    </FormField>
                </div>
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function BlockEditorModal({ open, onClose, projectId, projectTitle }: Props) {
    const [blocks, setBlocks] = useState<AdminBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [editForms, setEditForms] = useState<Record<number, AnyForm>>({});
    const [savingId, setSavingId] = useState<number | null>(null);

    const [newType, setNewType] = useState<BlockType>('text');
    const [newForm, setNewForm] = useState<AnyForm>(emptyForm('text'));
    const [addingNew, setAddingNew] = useState(false);
    const [savingNew, setSavingNew] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        if (!open || !projectId) return;
        setLoading(true);
        setExpanded(null);
        setEditForms({});
        setAddingNew(false);
        setNewType('text');
        setNewForm(emptyForm('text'));
        fetch(`/api/projects/${projectId}/blocks`, { credentials: 'include' })
            .then(r => r.json())
            .then((data: AdminBlock[]) => setBlocks([...data].sort((a, b) => a.order - b.order)))
            .catch(() => toast.error('Failed to load blocks'))
            .finally(() => setLoading(false));
    }, [open, projectId]);

    // Sync edit form when a block is expanded
    function toggleExpand(block: AdminBlock) {
        if (expanded === block.id) {
            setExpanded(null);
        } else {
            setExpanded(block.id);
            if (!editForms[block.id]) {
                setEditForms(prev => ({ ...prev, [block.id]: blockToForm(block) }));
            }
        }
    }

    function updateEditForm(id: number, form: AnyForm) {
        setEditForms(prev => ({ ...prev, [id]: form }));
    }

    async function handleSave(block: AdminBlock) {
        const form = editForms[block.id];
        if (!form) return;
        setSavingId(block.id);
        const { content, language, imageUrl } = formToPayload(block.type, form);
        try {
            const res = await fetch(`/api/blocks/${block.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: block.type, order: block.order, content, language, imageUrl }),
            });
            if (!res.ok) throw new Error();
            const updated: AdminBlock = await res.json();
            setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b));
            setExpanded(null);
            toast.success('Block saved');
        } catch {
            toast.error('Failed to save block');
        } finally {
            setSavingId(null);
        }
    }

    async function handleDelete(id: number) {
        const res = await fetch(`/api/blocks/${id}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) { toast.error('Delete failed'); return; }
        setBlocks(prev => prev.filter(b => b.id !== id));
        if (expanded === id) setExpanded(null);
        toast.success('Block deleted');
    }

    function handleDragEnd(event: import('@dnd-kit/core').DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = blocks.findIndex(b => b.id === active.id);
        const newIndex = blocks.findIndex(b => b.id === over.id);
        const reordered = arrayMove(blocks, oldIndex, newIndex);
        setBlocks(reordered);
        fetch(`/api/projects/${projectId}/blocks/reorder`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reordered.map((b, i) => ({ id: b.id, order: i + 1 }))),
        }).catch(() => toast.error('Reorder failed'));
    }

    async function handleAddBlock(e: React.FormEvent) {
        e.preventDefault();
        setSavingNew(true);
        const { content, language, imageUrl } = formToPayload(newType, newForm);
        try {
            const res = await fetch(`/api/projects/${projectId}/blocks`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: newType, order: blocks.length + 1, content, language, imageUrl }),
            });
            if (!res.ok) throw new Error();
            const created: AdminBlock = await res.json();
            setBlocks(prev => [...prev, created]);
            setAddingNew(false);
            setNewForm(emptyForm(newType));
            toast.success('Block added');
        } catch {
            toast.error('Failed to add block');
        } finally {
            setSavingNew(false);
        }
    }

    return (
        <ModalShell open={open} onClose={onClose} title={`Blocks — ${projectTitle}`} maxWidth="2xl">
            <div className="p-6 space-y-4">
                {/* Block list */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-cyan-accent" size={20} />
                    </div>
                ) : blocks.length === 0 && !addingNew ? (
                    <p className="text-sm text-slate-500 text-center py-6">No blocks yet. Add your first block below.</p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {blocks.map(block => (
                                    <SortableRow key={block.id} id={block.id} align="start">
                                        <div className="flex-1 min-w-0">
                                            {/* Row header */}
                                            <div className="flex items-center gap-2">
                                                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', TYPE_COLORS[block.type])}>
                                                    {TYPE_LABELS[block.type]}
                                                </span>
                                                <span className="text-xs text-slate-400 truncate flex-1">{contentPreview(block)}</span>
                                                <button type="button" onClick={() => toggleExpand(block)}
                                                    className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
                                                    {expanded === block.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                                <button type="button" onClick={() => toggleExpand(block)}
                                                    className="text-slate-400 hover:text-cyan-accent transition-colors p-1 rounded flex-shrink-0">
                                                    <Pencil size={13} />
                                                </button>
                                                <ConfirmDelete onConfirm={() => handleDelete(block.id)} prompt="Delete block?" />
                                            </div>

                                            {/* Expanded edit form */}
                                            {expanded === block.id && editForms[block.id] && (
                                                <div className="mt-3 pt-3 border-t border-yinmn-blue/20 space-y-3">
                                                    <BlockForm
                                                        type={block.type}
                                                        form={editForms[block.id]}
                                                        onChange={f => updateEditForm(block.id, f)}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <ThemedButton type="button" variant="secondary"
                                                            className="px-3 py-1.5 text-xs"
                                                            onClick={() => setExpanded(null)}>
                                                            Cancel
                                                        </ThemedButton>
                                                        <ThemedButton type="button"
                                                            className="px-3 py-1.5 text-xs flex items-center gap-1.5"
                                                            disabled={savingId === block.id}
                                                            onClick={() => handleSave(block)}>
                                                            {savingId === block.id
                                                                ? <Loader2 size={12} className="animate-spin" />
                                                                : <Check size={12} />}
                                                            Save
                                                        </ThemedButton>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </SortableRow>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                {/* Add new block */}
                {addingNew ? (
                    <form onSubmit={handleAddBlock}
                        className="bg-space-cadet border border-cyan-accent/20 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-cyan-accent font-medium">New block</span>
                            <BlockTypePicker
                                value={newType}
                                onChange={t => { setNewType(t); setNewForm(emptyForm(t)); }}
                            />
                        </div>

                        <BlockForm type={newType} form={newForm} onChange={setNewForm} />

                        <div className="flex justify-end gap-2">
                            <ThemedButton type="button" variant="secondary" className="px-3 py-1.5 text-xs"
                                onClick={() => setAddingNew(false)}>
                                Cancel
                            </ThemedButton>
                            <ThemedButton type="submit" disabled={savingNew}
                                className="px-4 py-1.5 text-xs flex items-center gap-1.5">
                                {savingNew ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                Add block
                            </ThemedButton>
                        </div>
                    </form>
                ) : (
                    <button type="button" onClick={() => setAddingNew(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-yinmn-blue/40 rounded-xl text-slate-500 hover:text-cyan-accent hover:border-cyan-accent/30 transition-colors text-sm">
                        <Plus size={14} />
                        Add block
                    </button>
                )}

                <div className="flex justify-end pt-2 border-t border-yinmn-blue/20">
                    <ThemedButton type="button" variant="secondary" onClick={onClose}>Done</ThemedButton>
                </div>
            </div>
        </ModalShell>
    );
}
