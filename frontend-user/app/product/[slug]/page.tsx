import { Metadata } from 'next';
export const runtime = 'edge';
import ProductClientWrapper from "./ProductClientWrapper";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const p = await params;
    const slug = p.slug;

    return {
        title: `${slug.replace(/-/g, ' ').toUpperCase()} | Perambur Srinivasa Sweets`,
        description: `Buy ${slug.replace(/-/g, ' ')} online from Perambur Srinivasa Sweets. Authentic South Indian taste since 1981.`,
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const p = await params;
    const { slug } = p;
    return <ProductClientWrapper slug={slug} />;
}
