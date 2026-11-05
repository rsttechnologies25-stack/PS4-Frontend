import { Metadata } from 'next';
import ProductClientWrapper from "./ProductClientWrapper";
import { API_URL } from "@/lib/api";
import { formatImageUrl } from "@/lib/imageHelper";

async function getProduct(slug: string) {
    try {
        const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}`, {
            next: { revalidate: 3600 }
        });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error(`[ProductSSR] Failed to fetch product ${slug}:`, e);
    }
    return null;
}

export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_URL}/products?limit=1000`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const products = Array.isArray(data) ? data : (data?.data || []);
        return products.map((p: any) => ({ slug: p.slug }));
    } catch (e) {
        console.error('[generateStaticParams] Error fetching product slugs:', e);
        return [];
    }
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        const formatted = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return {
            title: formatted,
            description: `Order authentic ${formatted} online from Perambur Srinivasa Sweets. Handcrafted South Indian taste since 1981.`,
        };
    }

    const defaultVariant = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
    const priceText = defaultVariant?.price ? ` (₹${defaultVariant.price})` : '';
    const cleanImageUrl = product.image ? formatImageUrl(product.image) : 'https://www.perambursrinivasa.com/hero_motichoor_laddu.jpg';
    const cleanDesc = product.description?.replace(/\s+/g, ' ').trim().slice(0, 160) || `Buy fresh ${product.name} online from Perambur Srinivasa Sweets. Authentic South Indian sweets & snacks.`;

    return {
        title: `${product.name}${priceText}`,
        description: cleanDesc,
        openGraph: {
            title: `${product.name} | Perambur Srinivasa Sweets`,
            description: cleanDesc,
            url: `https://www.perambursrinivasa.com/product/${slug}`,
            siteName: 'Perambur Srinivasa Sweets',
            images: [
                {
                    url: cleanImageUrl,
                    width: 800,
                    height: 800,
                    alt: product.name,
                }
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Perambur Srinivasa Sweets`,
            description: cleanDesc,
            images: [cleanImageUrl],
        }
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    const defaultVariant = product?.variants?.find((v: any) => v.isDefault) || product?.variants?.[0];

    const productSchema = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images && product.images.length > 0
            ? product.images.map((img: any) => formatImageUrl(img.url))
            : [formatImageUrl(product.image)],
        "description": product.description || `Authentic ${product.name} from Perambur Srinivasa Sweets.`,
        "sku": product.id,
        "brand": {
            "@type": "Brand",
            "name": "Perambur Srinivasa Sweets"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://www.perambursrinivasa.com/product/${slug}`,
            "priceCurrency": "INR",
            "price": defaultVariant?.price || product.price || 0,
            "availability": (product.isSoldOut || (defaultVariant && defaultVariant.stock <= 0))
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
                "@type": "Organization",
                "name": "Perambur Srinivasa Sweets"
            }
        }
    } : null;

    return (
        <>
            {productSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
                />
            )}
            <ProductClientWrapper slug={slug} />
        </>
    );
}
