import { apiFetch } from './client';

export const auth = {
    check(): Promise<{ authenticated: boolean }> {
        return apiFetch('/api/auth/check');
    },

    login(password: string): Promise<{ message: string }> {
        return apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ password }),
        });
    },

    logout(): Promise<{ message: string }> {
        return apiFetch('/api/auth/logout', { method: 'POST' });
    },
};
