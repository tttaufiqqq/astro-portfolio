import { apiFetch } from './client';
import type { Profile } from '@/types/models';

export interface ProfilePayload {
    name: string;
    role?: string;
    bio?: string;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    avatarUrl?: string | null;
    resumeUrl?: string | null;
}

export const profile = {
    get(): Promise<Profile> {
        return apiFetch('/api/profile');
    },

    update(data: ProfilePayload): Promise<Profile> {
        return apiFetch('/api/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    removeAvatar(): Promise<{ ok: boolean }> {
        return apiFetch('/api/profile/avatar', { method: 'DELETE' });
    },

    removeResume(): Promise<{ ok: boolean }> {
        return apiFetch('/api/profile/resume', { method: 'DELETE' });
    },
};
