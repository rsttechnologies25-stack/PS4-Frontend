"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import Link from "next/link";
import ProductCard from "../ui/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
    id: string;
    name: string;
    price?: number;
    image: string;
    slug: string;
    description?: string;
    categoryId?: string;
    variants?: { id: string; weight: string; price: number; stock: number; isDefault: boolean; sortOrder: number }[];
}

interface ExploreTab {
    name: string;
    query: string;
}

export default function ExploreSection() {
    const [tabs, setTabs] = useState<ExploreTab[]>([
        { name: "BEST SELLERS", query: "isBestSeller=true" },
        { name: "NEW LAUNCHES", query: "isNewLaunch=true" }
    ]);
    const [activeTab, setActiveTab] = useState<ExploreTab>(tabs[0]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/categories`);
                if (res.ok) {
                    const data = await res.json();
                    // Get first 4 main categories for tabs
                    const mainCats = data.filter((c: any) => !c.parentId).slice(0, 4);
                    const dynamicTabs = mainCats.map((cat: any) => ({
                        name: cat.name.toUpperCase(),
                        query: `category=${cat.slug}&includeChildren=true`
                    }));
                    
                    setTabs(prev => {
                        const baseTabs = prev.slice(0, 2);
                        return [...baseTabs, ...dynamicTabs];
                    });
                }
            } catch (error) {
                console.error("Failed to fetch categories for ExploreSection:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/products?${activeTab.query}`);
                const data = await res.json();
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab) fetchProducts();
    }, [activeTab]);

    return (
        <section className="py-20">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="accent-font text-primary uppercase tracking-[0.4em] text-sm mb-4">Discover Our Craft</h2>
                    <h3 className="serif text-secondary text-3xl md:text-5xl mb-12">Taste the Tradition</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex lg:justify-center justify-start gap-6 sm:gap-8 mb-12 overflow-x-auto pb-4 no-scrollbar px-4"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab)}
                            className={`text-[13px] tracking-[0.2em] font-bold transition-all border-b-2 py-2 whitespace-nowrap accent-font ${activeTab?.name === tab.name ? "border-primary text-secondary" : "border-transparent text-text-muted hover:text-primary"
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-full grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full"
                            >
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="animate-pulse bg-primary/5 aspect-square p-4 flex flex-col items-center">
                                        <div className="w-full h-full bg-primary/10 mb-4" />
                                        <div className="h-4 bg-primary/10 w-2/3 mb-2" />
                                        <div className="h-4 bg-primary/10 w-1/3" />
                                    </div>
                                ))}
                            </motion.div>
                        ) : products.length > 0 ? (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="col-span-full grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full"
                            >
                                {products.slice(0, 12).map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        name={product.name}
                                        price={product.variants?.find(v => v.isDefault)?.price || product.variants?.[0]?.price || product.price || 0}
                                        image={product.image}
                                        slug={product.slug}
                                        description={product.description}
                                        variants={product.variants}
                                        categoryName={(product as any).category?.name}
                                        categoryId={product.categoryId}
                                        isVeg={true}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-full py-20 text-text-muted italic"
                            >
                                No products found in this category.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {products.length > 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-16"
                    >
                        <Link
                            href={
                                activeTab.query.includes('category=') 
                                    ? `/category/${activeTab.query.split('category=')[1].split('&')[0]}`
                                    : activeTab.name === "BEST SELLERS" ? "/shop?filter=best-seller" :
                                      activeTab.name === "NEW LAUNCHES" ? "/shop?filter=new-launch" :
                                      "/shop"
                            }
                            className="inline-flex items-center gap-3 group"
                        >
                            <span className="serif text-xl md:text-2xl text-secondary group-hover:text-primary transition-colors border-b border-primary/30 group-hover:border-primary pb-1">
                                Explore Full Collection
                            </span>
                            <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-primary group-hover:text-white transition-colors"
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
