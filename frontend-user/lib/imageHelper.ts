import { API_BASE_URL } from "./api";

/**
 * Formats a given image URL to ensure it has the correct base path.
 * If the URL is relative (starts with /products or /uploads), it prepends the API_BASE_URL.
 * If the URL is already absolute or a local placeholder, it returns it as is.
 */
export function formatImageUrl(url: string | null | undefined): string {
    if (!url) return "/hero_motichoor_laddu.jpg";

    // If it's already an absolute URL (http/https), return it
    if (url.startsWith("http")) return url;

    // If it starts with /products, /uploads, or /hero_, it's a backend static asset
    if (url.startsWith("/products") || url.startsWith("/uploads") || url.startsWith("/hero_")) {
        // Remove trailing slash from API_BASE_URL if it exists, and leading slash from url
        const base = API_BASE_URL.replace(/\/$/, "");
        const path = url.startsWith("/") ? url : `/${url}`;
        return `${base}${path}`;
    }

    // Otherwise, assume it's a local frontend asset (starts with /)
    return url;
}
