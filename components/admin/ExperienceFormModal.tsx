import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Experience } from '@/types/models';
import ModalShell from './ModalShell';
import FormField from './FormField';
import ThemedInput from './ThemedInput';
import ThemedTextarea from './ThemedTextarea';
import ThemedButton from './ThemedButton';

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: (exp: Experience) => void;
    experience?: Experience | null;
}

interface FormState {
    company: string;
    role: string;
    description: string;
    startDate: string;
    endDate: string;
    current: boolean;
    order: string;
}

const empty: FormState = {
    company: '', role: '', description: '',
    startDate: '', endDate: '', current: false, order: '0',
};

/** Convert ISO date string or null to YYYY-MM-DD for <input type="date"> */
function toDateInput(val: string | null | undefined): string {
    if (!val) return '';
    return val.slice(0, 10);
}

export default function ExperienceFormModal({ open, onClose, onSaved, experience }: Props) {
    const [form, setForm] = useState<FormState>(empty);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (experience) {
            setForm({
                company: experience.company,
                role: experience.role,
                description: experience.description,
                startDate: toDateInput(experience.startDate),
                endDate: toDateInput(experience.endDate),
                current: experience.current,
                order: String(experience.order),
            });
        } else {
            setForm(empty);
        }
    }, [experience, open]);

    function set(key: keyof FormState, value: string | boolean) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const body = {
            ...form,
            order: parseInt(form.order, 10) || 0,
            endDate: form.current ? null : (form.endDate || null),
            startDate: form.startDate,
        };
        try {
            const url = experience ? `/api/experiences/${experience.id}` : '/api/experiences';
            const method = experience ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Save failed');
            const saved: Experience = await res.json();
            toast.success(experience ? 'Experience updated' : 'Experience created');
            onSaved(saved);
            onClose();
        } catch {
            toast.error('Failed to save experience');
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModalShell open={open} onClose={onClose} title={experience ? 'Edit Experience' : 'New Experience'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Company" required>
                        <ThemedInput value={form.company} onChange={e => set('company', e.target.value)} required />
                    </FormField>
                    <FormField label="Role" required>
                        <ThemedInput value={form.role} onChange={e => set('role', e.target.value)} required />
                    </FormField>
                </div>

                <FormField label="Description">
                    <ThemedTextarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Start Date" required>
                        <ThemedInput type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
                    </FormField>
                    {!form.current && (
                        <FormField label="End Date">
                            <ThemedInput type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                        </FormField>
                    )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form.current}
                        onChange={e => set('current', e.target.checked)}
                        className="w-4 h-4 accent-cyan-500 rounded"
                    />
                    <span className="text-sm text-slate-300">Currently working here</span>
                </label>

                <FormField label="Order">
                    <ThemedInput type="number" value={form.order} onChange={e => set('order', e.target.value)} />
                </FormField>

                <div className="flex justify-end gap-3 pt-2">
                    <ThemedButton type="button" variant="secondary" onClick={onClose}>Cancel</ThemedButton>
                    <ThemedButton type="submit" disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : (experience ? 'Update' : 'Create')}
                    </ThemedButton>
                </div>
            </form>
        </ModalShell>
    );
}
