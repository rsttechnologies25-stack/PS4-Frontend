const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce.perambursrinivasa.co.in/api";
const cleanUrl = rawUrl.replace(/\/+$/, ""); // Remove trailing slashes
export const API_BASE_URL = cleanUrl.endsWith("/api") ? cleanUrl.replace(/\/api$/, "") : cleanUrl;
export const API_URL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
