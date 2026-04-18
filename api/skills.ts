import { apiFetch } from './client';
import type { Skill } from '@/types/models';

export interface SkillPayload {
    name: string;
    category: string;
    icon?: string | null;
    order?: number;
}

export const skills = {
    list(): Promise<Skill[]> {
        return apiFetch('/api/skills');
    },

    create(data: SkillPayload): Promise<Skill> {
        return apiFetch('/api/skills', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update(id: number, data: SkillPayload): Promise<Skill> {
        return apiFetch(`/api/skills/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    remove(id: number): Promise<void> {
        return apiFetch(`/api/skills/${id}`, { method: 'DELETE' });
    },

    reorder(items: { id: number; order: number }[]): Promise<{ ok: boolean }> {
        return apiFetch('/api/skills/reorder', {
            method: 'PATCH',
            body: JSON.stringify(items),
        });
    },
};
