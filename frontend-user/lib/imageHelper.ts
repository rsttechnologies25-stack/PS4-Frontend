import { API_BASE_URL } from "./api";

/**
 * Formats a given image URL to ensure it has the correct base path.
 * If the URL is relative (starts with /products or /uploads), it prepends the API_BASE_URL.
 * If the URL is already absolute or a local placeholder, it returns it as is.
 */
export function formatImageUrl(url: string | null | undefined): string {
    if (!url) return "/hero_motichoor_laddu.jpg";

    let finalUrl = url;

    // Aggressively replace localhost hardcodes from database records
    if (finalUrl.includes("localhost:4000")) {
        const base = API_BASE_URL.replace(/\/$/, "");
        finalUrl = finalUrl.replace(/https?:\/\/localhost:4000/g, base);
    }

    // If it's already an absolute URL (http/https) and not localhost, return it
    if (finalUrl.startsWith("http")) return finalUrl;

    // If it starts with /products, /uploads, or /hero_, it's a backend static asset
    if (finalUrl.startsWith("/products") || finalUrl.startsWith("/uploads") || finalUrl.startsWith("/hero_")) {
        // Remove trailing slash from API_BASE_URL if it exists, and leading slash from url
        const base = API_BASE_URL.replace(/\/$/, "");
        const path = finalUrl.startsWith("/") ? finalUrl : `/${finalUrl}`;
        return `${base}${path}`;
    }

    // Otherwise, assume it's a local frontend asset (starts with /)
    return finalUrl;
}
