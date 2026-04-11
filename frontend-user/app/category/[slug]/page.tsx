import { Metadata } from 'next';
import { API_URL } from "@/lib/api";
import { getCategoryBySlug, STATIC_CATEGORIES, USE_STATIC_DATA } from "@/lib/staticData";
import CategoryClient from "./CategoryClient";

async function getCategory(slug: string) {
    if (USE_STATIC_DATA) {
        return getCategoryBySlug(slug);
    }
    try {
        const res = await fetch(`${API_URL}/categories/${slug}`, { next: { revalidate: 3600 } });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Error fetching category for metadata:", e);
    }
    return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategory(slug);

    if (!category) {
        return {
            title: "Category Not Found",
        };
    }

    const title = `${category.name} | Perambur Srinivasa Sweets`;
    const description = `Explore our authentic collection of ${category.name}. Handcrafted with tradition since 1981 at Perambur Sri Srinivasa.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: category.image ? [{ url: category.image }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: category.image ? [category.image] : [],
        },
    };
}

export function generateStaticParams() {
    return STATIC_CATEGORIES.map((category) => ({
        slug: category.slug,
    }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <CategoryClient slug={slug} />;
}
