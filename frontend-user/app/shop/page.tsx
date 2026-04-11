"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { Loader2, Filter, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";
import { USE_STATIC_DATA, STATIC_CATEGORIES, getProductsWithCategory } from "@/lib/staticData";

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
    category?: {
        id: string;
        name: string;
        slug: string;
        parentId?: string;
    }
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

function ShopContent() {
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get("filter") || "all";
    
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [globalFilter, setGlobalFilter] = useState(initialFilter);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Sync state with URL change
    useEffect(() => {
        const filter = searchParams.get("filter") || "all";
        setGlobalFilter(filter);
    }, [searchParams]);

    useEffect(() => {
        // Use static data for Cloudflare deployment
        if (USE_STATIC_DATA) {
            setCategories(STATIC_CATEGORIES.filter(cat => !cat.parentId));
            setProducts(getProductsWithCategory() as Product[]);
            setLoading(false);
            return;
        }

        // Fetch from API (for when backend is available)
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Main Categories
                const catRes = await fetch(`${API_URL}/categories`);
                const catData = await catRes.json();
                setCategories(Array.isArray(catData) ? catData.filter((cat: any) => !cat.parentId) : []);

                // Fetch All Products
                const prodRes = await fetch(`${API_URL}/products?limit=1000`);
                const prodData = await prodRes.json();
                setProducts(Array.isArray(prodData) ? prodData : (prodData?.data || []));
            } catch (error) {
                console.error("Failed to fetch shop data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProducts = products.filter(p => {
        // 1. Global Filter (Best Seller / New Launch)
        if (globalFilter === "best-seller" && !p.isBestSeller) return false;
        if (globalFilter === "new-launch" && !p.isNewLaunch) return false;

        // 2. Category Filter
        if (selectedCategory === "all") return true;
        if (p.category?.slug === selectedCategory) return true;
        const selectedCat = categories.find(c => c.slug === selectedCategory);
        return p.category?.parentId === selectedCat?.id;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    const pageTitle = globalFilter === "best-seller" ? "Best Sellers" : 
                     globalFilter === "new-launch" ? "New Launches" : 
                     "The Full Collection";

    return (
        <main className="bg-[#FFFBF5] min-h-screen pb-20 pt-24 md:pt-32">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="text-center mb-12 md:mb-16 relative">
                    <h1 className="text-4xl md:text-6xl font-black accent-font text-primary mb-4 uppercase tracking-wider">
                        {pageTitle}
                    </h1>
                    <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
                    <p className="text-text-muted max-w-2xl mx-auto italic text-lg opacity-80">
                        {globalFilter === "best-seller" ? "Our most loved and popular treats, chosen by you." : 
                         globalFilter === "new-launch" ? "Exciting new additions to our traditional kitchen." :
                         "Explore our entire range of handcrafted sweets, snacks, and savouries."}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-3xl border border-primary/5 shadow-sm">
                    {/* Filter Toggle Button (Mobile) */}
                    <div className="flex items-center justify-between md:hidden group">
                        <button 
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="flex items-center gap-3 text-secondary font-bold text-sm uppercase tracking-widest bg-white px-5 py-3 rounded-2xl border border-primary/10 shadow-sm grow"
                        >
                            <Filter size={18} className="text-primary" /> 
                            <span>Filter By: <span className="text-primary ml-1">{selectedCategory === "all" ? "All Products" : categories.find(c => c.slug === selectedCategory)?.name}</span></span>
                            <div className="ml-auto">
                                {showMobileFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-3 text-secondary font-bold text-sm uppercase tracking-widest">
                        <Filter size={18} className="text-primary" /> Filter By:
                    </div>

                    <AnimatePresence mode="wait">
                        {(showMobileFilters || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                            <motion.div 
                                initial={showMobileFilters ? { height: 0, opacity: 0 } : undefined}
                                animate={showMobileFilters ? { height: "auto", opacity: 1 } : undefined}
                                exit={showMobileFilters ? { height: 0, opacity: 0 } : undefined}
                                className={`flex flex-wrap justify-center md:flex md:flex-wrap md:justify-center gap-2 md:gap-3 overflow-hidden ${!showMobileFilters ? 'hidden md:flex' : 'flex'}`}
                            >
                                <button
                                    onClick={() => {
                                        setSelectedCategory("all");
                                        setShowMobileFilters(false);
                                    }}
                                    className={`px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto ${selectedCategory === "all" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-text-muted hover:text-primary border border-gray-100'}`}
                                >
                                    All Products
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat.slug);
                                            setShowMobileFilters(false);
                                        }}
                                        className={`px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto ${selectedCategory === cat.slug ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-text-muted hover:text-primary border border-gray-100'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="hidden md:block text-xs font-bold text-text-muted uppercase tracking-widest">
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
                        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
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
                                        price={product.variants?.find((v: any) => v.isDefault)?.price || product.variants?.[0]?.price || product.price || 0}
                                        description={product.description}
                                        image={product.image}
                                        slug={product.slug}
                                        variants={product.variants}
                                        categoryName={product.category?.name || "Product"}
                                        categoryId={product.categoryId}
                                        isVeg={true}
                                        isSoldOut={product.isSoldOut}
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

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
