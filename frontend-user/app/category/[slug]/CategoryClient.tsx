"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { getCategoryBySlug, getProductsByCategory, STATIC_CATEGORIES } from "@/lib/staticData";

interface Product {
    id: string;
    name: string;
    slug: string;
    price?: number;
    description: string;
    image: string;
    isBestSeller: boolean;
    isNewLaunch: boolean;
    isSoldOut: boolean;
    categoryId: string;
    variants?: { id: string; weight: string; price: number; stock: number; isDefault: boolean; sortOrder: number }[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    parentId?: string;
}

interface CategoryClientProps {
    slug: string;
}

export default function CategoryClient({ slug }: CategoryClientProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [activeSubId, setActiveSubId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        // Fetch from API (for when backend is available)
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Category Details
                const catRes = await fetch(`${API_URL}/categories/${slug}`);
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategory(catData);

                    // Fetch Sub-categories (only those belonging to this parent)
                    const subsRes = await fetch(`${API_URL}/categories?parent=${catData.id}`);
                    if (subsRes.ok) {
                        const subsData = await subsRes.json();
                        setSubCategories(subsData);
                    }

                    // Fetch Products in Category (including all sub-categories)
                    const prodRes = await fetch(`${API_URL}/products?category=${slug}&includeChildren=true&limit=1000`);
                    if (prodRes.ok) {
                        const prodData = await prodRes.json();
                        const productsArray = Array.isArray(prodData) ? prodData : (prodData?.data || []);
                        setProducts(productsArray);
                        setFilteredProducts(productsArray);
                    }
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

    useEffect(() => {
        if (!activeSubId) {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.categoryId === activeSubId));
        }
    }, [activeSubId, products]);

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
        <main className="bg-[#FFFBF5] min-h-screen pb-20 pt-24 md:pt-32">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="text-center mb-8 md:mb-12 relative">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black accent-font text-primary mb-3 md:mb-4 uppercase tracking-wider">
                        {category.name}
                    </h1>
                    <div className="w-16 md:w-24 h-1 bg-secondary mx-auto mb-4 md:mb-6" />
                    <p className="text-text-muted max-w-2xl mx-auto italic text-sm md:text-lg">
                        Handcrafted {category.name.toLowerCase()} made with love and tradition.
                    </p>
                </div>

                {/* Sub-category Filter Tabs */}
                {subCategories.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-10 md:mb-16">
                        <button
                            onClick={() => setActiveSubId(null)}
                            className={`px-6 py-2 rounded-full border text-sm font-bold uppercase tracking-wider transition-all duration-300 ${!activeSubId ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white text-primary border-primary/20 hover:border-primary'}`}
                        >
                            All
                        </button>
                        {subCategories.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setActiveSubId(sub.id)}
                                className={`px-6 py-2 rounded-full border text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeSubId === sub.id ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white text-primary border-primary/20 hover:border-primary'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Product Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center text-text-muted py-20">
                        <p>No products found in this selection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.variants?.find((v: any) => v.isDefault)?.price || product.variants?.[0]?.price || product.price || 0}
                                description={product.description}
                                image={product.image}
                                slug={product.slug}
                                variants={product.variants}
                                categoryName={category.name}
                                categoryId={product.categoryId}
                                isVeg={true}
                                isSoldOut={product.isSoldOut}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
