import { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.perambursrinivasa.com';

    // Static routes
    const routes = [
        '',
        '/shop',
        '/branches',
        '/about',
        '/contact',
        '/shipping',
        '/refund',
        '/privacy',
        '/terms',
        '/delete-account',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // Dynamic category routes
    let categories: any[] = [];
    try {
        const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
        if (res.ok) {
            categories = await res.json();
        }
    } catch (err) {
        console.error('Sitemap category fetch failed:', err);
    }

    const categoryRoutes = categories.map(cat => ({
        url: `${baseUrl}/category/${encodeURIComponent(cat.slug)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic product routes
    let products: any[] = [];
    try {
        const res = await fetch(`${API_URL}/products?limit=1000`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            products = Array.isArray(data) ? data : (data?.data || []);
        }
    } catch (err) {
        console.error('Sitemap product fetch failed:', err);
    }

    const productRoutes = products
        .filter((p: any) => !p.isDisabled)
        .map((p: any) => ({
            url: `${baseUrl}/product/${p.slug}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt || Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

    return [...routes, ...categoryRoutes, ...productRoutes];
}
