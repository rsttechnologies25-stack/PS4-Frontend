import { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://perambursrinivasa.com';

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
        url: `${baseUrl}/category/${cat.slug.replaceAll('&', '%26')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...routes, ...categoryRoutes];
}
