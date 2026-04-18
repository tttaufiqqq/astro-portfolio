import { apiFetch } from './client';
import type { Project } from '@/types/models';

export interface ProjectDetailResponse {
    project: Project;
    prev: Pick<Project, 'id' | 'title' | 'slug'> | null;
    next: Pick<Project, 'id' | 'title' | 'slug'> | null;
}

export interface ProjectPayload {
    title: string;
    summary?: string | null;
    description?: string;
    techStack?: string;
    githubUrl?: string | null;
    demoUrl?: string | null;
    imageUrl?: string | null;
    featured?: boolean;
    status?: 'draft' | 'published';
    order?: number;
}

export const projects = {
    list(params?: { featured?: boolean; status?: string }): Promise<Project[]> {
        const qs = new URLSearchParams();
        if (params?.featured !== undefined) qs.set('featured', String(params.featured));
        if (params?.status) qs.set('status', params.status);
        const query = qs.toString() ? `?${qs}` : '';
        return apiFetch(`/api/projects${query}`);
    },

    get(slug: string): Promise<ProjectDetailResponse> {
        return apiFetch(`/api/projects/${slug}`);
    },

    create(data: ProjectPayload): Promise<Project> {
        return apiFetch('/api/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update(id: number, data: ProjectPayload): Promise<Project> {
        return apiFetch(`/api/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    remove(id: number): Promise<void> {
        return apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    },

    reorder(items: { id: number; order: number }[]): Promise<{ ok: boolean }> {
        return apiFetch('/api/projects/reorder', {
            method: 'PATCH',
            body: JSON.stringify(items),
        });
    },
};
