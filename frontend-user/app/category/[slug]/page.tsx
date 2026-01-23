"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { USE_STATIC_DATA, getCategoryBySlug, getProductsByCategory } from "@/lib/staticData";

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    image: string;
    isBestSeller: boolean;
    isNewLaunch: boolean;
    categoryId: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use static data for Cloudflare deployment
        if (USE_STATIC_DATA) {
            const staticCategory = getCategoryBySlug(slug);
            const staticProducts = getProductsByCategory(slug);
            setCategory(staticCategory || null);
            setProducts(staticProducts as Product[]);
            setLoading(false);
            return;
        }

        // Fetch from API (for when backend is available)
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Category Details
                const catRes = await fetch(`${API_URL}/categories/${slug}`);
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategory(catData);
                }

                // Fetch Products in Category
                const prodRes = await fetch(`${API_URL}/products?category=${slug}`);
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setProducts(prodData);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchData();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF5] text-center p-4">
                <h1 className="text-3xl accent-font text-primary mb-4">Category Not Found</h1>
                <p className="text-text-muted">The category you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <main className="bg-[#FFFBF5] bg-pattern min-h-screen pb-20 pt-24 md:pt-32">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="text-center mb-8 md:mb-16 relative">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black accent-font text-primary mb-3 md:mb-4 uppercase tracking-wider">
                        {category.name}
                    </h1>
                    <div className="w-16 md:w-24 h-1 bg-secondary mx-auto mb-4 md:mb-6" />
                    <p className="text-text-muted max-w-2xl mx-auto italic text-sm md:text-lg">
                        Handcrafted {category.name.toLowerCase()} made with love and tradition.
                    </p>
                </div>

                {/* Product Grid */}
                {products.length === 0 ? (
                    <div className="text-center text-text-muted py-20">
                        <p>No products found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                description={product.description}
                                image={product.image}
                                slug={product.slug}
                                categoryName={category.name}
                                isVeg={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
