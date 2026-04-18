/**
 * Base API client.
 *
 * All requests include credentials (httpOnly cookie auth).
 * Non-ok responses are thrown as ApiError with the server's { error } message.
 * 204 No Content responses return undefined.
 */

export class ApiError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;

    const res = await fetch(url, {
        credentials: 'include',
        ...(!isFormData && options.body !== undefined
            ? { headers: { 'Content-Type': 'application/json', ...options.headers } }
            : { headers: options.headers }),
        ...options,
    });

    if (!res.ok) {
        let message = `Request failed: ${res.status}`;
        try {
            const body = await res.json();
            if (typeof body?.error === 'string') message = body.error;
        } catch { /* body not JSON */ }
        throw new ApiError(res.status, message);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}
