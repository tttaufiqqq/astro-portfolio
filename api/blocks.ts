import { apiFetch } from './client';

export type BlockType = 'heading' | 'text' | 'image' | 'video' | 'code';

export interface BlockPayload {
    type: BlockType;
    order?: number;
    content: Record<string, unknown> | string;
    language?: string | null;
    imageUrl?: string | null;
}

export interface AdminBlock {
    id: number;
    projectId: number;
    type: BlockType;
    order: number;
    content: string;
    language: string | null;
    imageUrl: string | null;
}

export const blocks = {
    list(projectId: number): Promise<AdminBlock[]> {
        return apiFetch(`/api/projects/${projectId}/blocks`);
    },

    create(projectId: number, data: BlockPayload): Promise<AdminBlock> {
        return apiFetch(`/api/projects/${projectId}/blocks`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update(id: number, data: BlockPayload): Promise<AdminBlock> {
        return apiFetch(`/api/blocks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    remove(id: number): Promise<void> {
        return apiFetch(`/api/blocks/${id}`, { method: 'DELETE' });
    },

    reorder(projectId: number, items: { id: number; order: number }[]): Promise<{ ok: boolean }> {
        return apiFetch(`/api/projects/${projectId}/blocks/reorder`, {
            method: 'PATCH',
            body: JSON.stringify(items),
        });
    },
};
