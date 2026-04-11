export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const API_URL = `${API_BASE_URL}/api`;

export async function fetchWithAuth(url: string, options: RequestInit & { isFormData?: boolean } = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const { isFormData, ...fetchOptions } = options;

    const headers: Record<string, string> = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, { ...fetchOptions, headers });

    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            window.location.href = '/login';
        }
    }

    return response;
}
