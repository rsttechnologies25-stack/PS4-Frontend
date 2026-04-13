import { Metadata } from 'next';
export const runtime = 'edge';
import CategoryClientWrapper from "./CategoryClientWrapper";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const p = await params;
    const slug = p.slug;

    return {
        title: `${slug.replace(/-/g, ' ').toUpperCase()} | Perambur Srinivasa Sweets`,
        description: `Explore our authentic collection of ${slug}. Handcrafted with tradition since 1981 at Perambur Sri Srinivasa.`,
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const p = await params;
    const slug = p.slug;
    return <CategoryClientWrapper slug={slug} />;
}
