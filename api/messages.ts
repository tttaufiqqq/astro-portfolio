import { apiFetch } from './client';
import type { Message } from '@/types/models';

export interface ContactPayload {
    name: string;
    email: string;
    message: string;
}

export const messages = {
    list(): Promise<Message[]> {
        return apiFetch('/api/messages');
    },

    unreadCount(): Promise<{ count: number }> {
        return apiFetch('/api/messages/unread-count');
    },

    send(data: ContactPayload): Promise<Message> {
        return apiFetch('/api/messages', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    reply(id: number, body: string): Promise<void> {
        return apiFetch(`/api/messages/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ body }),
        });
    },

    markAllRead(): Promise<void> {
        return apiFetch('/api/messages/read-all', { method: 'POST' });
    },

    remove(id: number): Promise<void> {
        return apiFetch(`/api/messages/${id}`, { method: 'DELETE' });
    },
};
