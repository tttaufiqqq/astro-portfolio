import { apiFetch } from './client';
import type { Experience } from '@/types/models';

export interface ExperiencePayload {
    company: string;
    role: string;
    startDate: string;
    endDate?: string | null;
    description?: string;
    current?: boolean;
    order?: number;
}

export const experiences = {
    list(): Promise<Experience[]> {
        return apiFetch('/api/experiences');
    },

    create(data: ExperiencePayload): Promise<Experience> {
        return apiFetch('/api/experiences', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update(id: number, data: ExperiencePayload): Promise<Experience> {
        return apiFetch(`/api/experiences/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    remove(id: number): Promise<void> {
        return apiFetch(`/api/experiences/${id}`, { method: 'DELETE' });
    },

    reorder(items: { id: number; order: number }[]): Promise<{ ok: boolean }> {
        return apiFetch('/api/experiences/reorder', {
            method: 'PATCH',
            body: JSON.stringify(items),
        });
    },
};
