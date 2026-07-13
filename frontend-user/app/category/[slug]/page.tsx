import { Metadata } from 'next';
export const runtime = 'edge';
import CategoryClientWrapper from "./CategoryClientWrapper";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const p = await params;
    const slug = p.slug;
    
    const titleName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        title: `${titleName} | Perambur Srinivasa Sweets`,
        description: `Indulge in the richness of our ${slug.replace(/-/g, ' ')} and snacks, crafted with pure ingredients and traditional recipes since 1981.`,
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const p = await params;
    const slug = p.slug;
    return <CategoryClientWrapper slug={slug} />;
}
