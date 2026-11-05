import { Metadata } from 'next';
import CategoryClientWrapper from "./CategoryClientWrapper";
import { API_URL } from "@/lib/api";

async function getCategory(slug: string) {
    try {
        const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const categories = await res.json();
            return categories.find((c: any) => c.slug === slug) || null;
        }
    } catch (e) {
        console.error(`[CategorySSR] Failed to fetch category ${slug}:`, e);
    }
    return null;
}

export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const categories = await res.json();
        return categories.map((cat: any) => ({ slug: cat.slug }));
    } catch (e) {
        console.error('[generateStaticParams] Error fetching category slugs:', e);
        return [];
    }
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategory(slug);

    const titleName = category?.name || slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        title: titleName,
        description: `Indulge in the richness of our authentic ${titleName} and snacks, crafted with pure ingredients and traditional recipes since 1981.`,
        openGraph: {
            title: `${titleName} | Perambur Srinivasa Sweets`,
            description: `Explore authentic ${titleName} crafted fresh daily at Perambur Srinivasa Sweets.`,
            url: `https://www.perambursrinivasa.com/category/${slug}`,
            siteName: 'Perambur Srinivasa Sweets',
            type: 'website',
        }
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <CategoryClientWrapper slug={slug} />;
}
