import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Skill } from '@/types/models';
import ModalShell from './ModalShell';
import FormField from './FormField';
import ThemedInput from './ThemedInput';
import ThemedButton from './ThemedButton';
import IconPicker from './IconPicker';
import ThemedSelect from './ThemedSelect';

const SKILL_CATEGORIES = [
    { value: 'Frontend',  label: 'Frontend'  },
    { value: 'Backend',   label: 'Backend'   },
    { value: 'Database',  label: 'Database'  },
    { value: 'DevOps',    label: 'DevOps'    },
    { value: 'Mobile',    label: 'Mobile'    },
    { value: 'Tools',     label: 'Tools'     },
    { value: 'Other',     label: 'Other'     },
];

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: (skill: Skill) => void;
    skill?: Skill | null;
}

interface FormState {
    name: string;
    category: string;
    icon: string;
    order: string;
}

const empty: FormState = { name: '', category: '', icon: '', order: '0' };

export default function SkillFormModal({ open, onClose, onSaved, skill }: Props) {
    const [form, setForm] = useState<FormState>(empty);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (skill) {
            setForm({ name: skill.name, category: skill.category, icon: skill.icon ?? '', order: String(skill.order) });
        } else {
            setForm(empty);
        }
    }, [skill, open]);

    function set(key: keyof FormState, value: string) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const body = { ...form, order: parseInt(form.order, 10) || 0, icon: form.icon || null };
        try {
            const url = skill ? `/api/skills/${skill.id}` : '/api/skills';
            const method = skill ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Save failed');
            const saved: Skill = await res.json();
            toast.success(skill ? 'Skill updated' : 'Skill created');
            onSaved(saved);
            onClose();
        } catch {
            toast.error('Failed to save skill');
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModalShell open={open} onClose={onClose} title={skill ? 'Edit Skill' : 'New Skill'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Name" required>
                        <ThemedInput value={form.name} onChange={e => set('name', e.target.value)} required />
                    </FormField>
                    <FormField label="Category" required>
                        <ThemedSelect
                            value={form.category}
                            onChange={v => set('category', v)}
                            options={SKILL_CATEGORIES}
                            placeholder="Select category…"
                        />
                    </FormField>
                </div>

                <FormField label="Icon" hint="Click to pick a Lucide icon, or type an emoji directly">
                    <IconPicker value={form.icon} onChange={v => set('icon', v)} />
                </FormField>

                <FormField label="Order">
                    <ThemedInput type="number" value={form.order} onChange={e => set('order', e.target.value)} />
                </FormField>

                <div className="flex justify-end gap-3 pt-2">
                    <ThemedButton type="button" variant="secondary" onClick={onClose}>Cancel</ThemedButton>
                    <ThemedButton type="submit" disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : (skill ? 'Update' : 'Create')}
                    </ThemedButton>
                </div>
            </form>
        </ModalShell>
    );
}
