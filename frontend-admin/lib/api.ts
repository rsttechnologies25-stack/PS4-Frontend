const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce.perambursrinivasa.co.in/api";
const cleanUrl = rawUrl.replace(/\/+$/, "");
export const API_BASE_URL = cleanUrl.endsWith("/api") ? cleanUrl.replace(/\/api$/, "") : cleanUrl;
export const API_URL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

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
