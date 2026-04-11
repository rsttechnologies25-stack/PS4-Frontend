import { Metadata } from 'next';
import { API_URL } from "@/lib/api";
import { getProductBySlug, STATIC_PRODUCTS, USE_STATIC_DATA } from "@/lib/staticData";
import ProductClient from "./ProductClient";

async function getProduct(slug: string) {
    if (USE_STATIC_DATA) {
        return getProductBySlug(slug);
    }
    try {
        const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 3600 } });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Error fetching product for metadata:", e);
    }
    return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: "Product Not Found",
        };
    }

    const title = `${product.name} | Perambur Srinivasa Sweets`;
    const description = product.description?.slice(0, 160) || `Buy ${product.name} online from Perambur Srinivasa Sweets. Authentic South Indian taste since 1981.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            images: [
                {
                    url: product.image,
                    width: 800,
                    height: 800,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [product.image],
        },
    };
}

// Generate static params for all products
export async function generateStaticParams() {
    return STATIC_PRODUCTS.map((product) => ({
        slug: product.slug,
    }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <ProductClient slug={slug} />;
}
