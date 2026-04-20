import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Experience } from '@/types/models';
import ModalShell from './ModalShell';
import FormField from './FormField';
import ThemedInput from './ThemedInput';
import ThemedTextarea from './ThemedTextarea';
import ThemedButton from './ThemedButton';
import ThemedSelect from './ThemedSelect';
import ThemedCheckbox from './ThemedCheckbox';
import ThemedNumberInput from './ThemedNumberInput';

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
    type: 'work' | 'education';
    order: string;
}

const empty: FormState = {
    company: '', role: '', description: '',
    startDate: '', endDate: '', current: false, type: 'work', order: '0',
};

interface FormErrors {
    company?: string;
    role?: string;
    startDate?: string;
}

function validate(form: FormState): FormErrors {
    const e: FormErrors = {};
    if (!form.company.trim()) e.company = 'Company is required';
    if (!form.role.trim()) e.role = 'Role is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    return e;
}

/** Convert ISO date string or null to YYYY-MM-DD for <input type="date"> */
function toDateInput(val: string | null | undefined): string {
    if (!val) return '';
    return val.slice(0, 10);
}

export default function ExperienceFormModal({ open, onClose, onSaved, experience }: Props) {
    const [form, setForm] = useState<FormState>(empty);
    const [errors, setErrors] = useState<FormErrors>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setErrors({});
        if (experience) {
            setForm({
                company: experience.company,
                role: experience.role,
                description: experience.description,
                startDate: toDateInput(experience.startDate),
                endDate: toDateInput(experience.endDate),
                current: experience.current,
                type: experience.type ?? 'work',
                order: String(experience.order),
            });
        } else {
            setForm(empty);
        }
    }, [experience, open]);

    function set(key: keyof FormState, value: string | boolean) {
        setForm(f => ({ ...f, [key]: value }));
        if (key in errors) setErrors(e => ({ ...e, [key]: undefined }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSaving(true);
        const body = {
            ...form,
            order: parseInt(form.order, 10) || 0,
            endDate: form.current ? null : (form.endDate || null),
            startDate: form.startDate,
            type: form.type,
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
            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
                <FormField label="Type">
                    <ThemedSelect
                        value={form.type}
                        onChange={v => set('type', v as 'work' | 'education')}
                        options={[
                            { value: 'work', label: 'Work / Project' },
                            { value: 'education', label: 'Education' },
                        ]}
                    />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label={form.type === 'education' ? 'Institution' : 'Company'} required error={errors.company}>
                        <ThemedInput value={form.company} onChange={e => set('company', e.target.value)} error={errors.company} />
                    </FormField>
                    <FormField label={form.type === 'education' ? 'Degree / Qualification' : 'Role'} required error={errors.role}>
                        <ThemedInput value={form.role} onChange={e => set('role', e.target.value)} error={errors.role} />
                    </FormField>
                </div>

                <FormField label="Description">
                    <ThemedTextarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Start Date" required error={errors.startDate}>
                        <ThemedInput type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} error={errors.startDate} />
                    </FormField>
                    {!form.current && (
                        <FormField label="End Date">
                            <ThemedInput type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                        </FormField>
                    )}
                </div>

                <ThemedCheckbox checked={form.current} onChange={v => set('current', v)}>
                    {form.type === 'education' ? 'Currently studying here' : 'Currently working here'}
                </ThemedCheckbox>

                <FormField label="Order">
                    <ThemedNumberInput value={form.order} onChange={v => set('order', v)} min={0} />
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
