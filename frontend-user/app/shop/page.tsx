"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { Loader2, Filter, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

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
    category?: {
        name: string;
        slug: string;
    }
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch All Categories
                const catRes = await fetch(`${API_URL}/categories`);
                const catData = await catRes.json();
                setCategories(catData);

                // Fetch All Products
                const prodRes = await fetch(`${API_URL}/products`);
                const prodData = await prodRes.json();
                setProducts(prodData);
            } catch (error) {
                console.error("Failed to fetch shop data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProducts = selectedCategory === "all"
        ? products
        : products.filter(p => p.category?.slug === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <main className="bg-[#FFFBF5] bg-pattern min-h-screen pb-20 pt-24 md:pt-32">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="text-center mb-12 md:mb-16 relative">
                    <h1 className="text-4xl md:text-6xl font-black accent-font text-primary mb-4 uppercase tracking-wider">
                        The Full Collection
                    </h1>
                    <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
                    <p className="text-text-muted max-w-2xl mx-auto italic text-lg opacity-80">
                        Explore our entire range of handcrafted sweets, snacks, and savouries.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-primary/5 shadow-sm">
                    <div className="flex items-center gap-3 text-secondary font-bold text-sm uppercase tracking-widest">
                        <Filter size={18} className="text-primary" /> Filter By:
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === "all" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-text-muted hover:text-primary border border-gray-100'}`}
                        >
                            All Products
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.slug)}
                                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat.slug ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-text-muted hover:text-primary border border-gray-100'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="text-xs font-bold text-text-muted uppercase tracking-widest">
                        {filteredProducts.length} Items Found
                    </div>
                </div>

                {/* Product Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                            <ShoppingBag size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-secondary mb-2">No products found</h2>
                        <p className="text-text-muted">Try selecting a different category.</p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    layout
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ProductCard
                                        id={product.id}
                                        name={product.name}
                                        price={product.price}
                                        description={product.description}
                                        image={product.image}
                                        slug={product.slug}
                                        categoryName={product.category?.name || "Product"}
                                        isVeg={true}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
