import { apiFetch } from './client';

export const upload = {
    file(file: File, folder: string, name?: string): Promise<{ url: string }> {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', folder);
        if (name) fd.append('name', name);
        return apiFetch('/api/upload', { method: 'POST', body: fd });
    },
};
