"use client";

import { useState, useEffect } from "react";
import ProductCard from "../ui/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
    { name: "BEST SELLERS", query: "isBestSeller=true" },
    { name: "NEW LAUNCHES", query: "isNewLaunch=true" },
    { name: "SWEETS", query: "category=sweets" },
    { name: "SAVOURIES", query: "category=savouries" }
];

import { API_URL } from "@/lib/api";
import { USE_STATIC_DATA, STATIC_PRODUCTS, getProductsByCategory, getBestSellers, getNewLaunches } from "@/lib/staticData";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    description?: string;
}

export default function ExploreSection() {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use static data for Cloudflare deployment
        if (USE_STATIC_DATA) {
            setLoading(true);
            let filteredProducts: Product[] = [];

            if (activeTab.query === "isBestSeller=true") {
                filteredProducts = getBestSellers();
            } else if (activeTab.query === "isNewLaunch=true") {
                filteredProducts = getNewLaunches();
            } else if (activeTab.query.startsWith("category=")) {
                const categorySlug = activeTab.query.split("=")[1];
                filteredProducts = getProductsByCategory(categorySlug);
            } else {
                filteredProducts = STATIC_PRODUCTS.slice(0, 8);
            }

            setProducts(filteredProducts);
            setLoading(false);
            return;
        }

        // Fetch from API (for when backend is available)
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

        fetchProducts();
    }, [activeTab]);

    return (
        <section className="py-20">
            <div className="container mx-auto px-4 text-center">
                <h2 className="accent-font text-primary uppercase tracking-[0.4em] text-sm mb-4">Discover Our Craft</h2>
                <h3 className="serif text-secondary text-4xl md:text-5xl mb-12">Taste the Tradition</h3>
                <div className="flex justify-center gap-8 mb-12 overflow-x-auto pb-4 no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab)}
                            className={`text-[13px] tracking-[0.2em] font-bold transition-all border-b-2 py-2 whitespace-nowrap accent-font ${activeTab.name === tab.name ? "border-primary text-secondary" : "border-transparent text-text-muted hover:text-primary"
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse bg-primary/5 aspect-square p-4 flex flex-col items-center">
                                    <div className="w-full h-full bg-primary/10 mb-4" />
                                    <div className="h-4 bg-primary/10 w-2/3 mb-2" />
                                    <div className="h-4 bg-primary/10 w-1/3" />
                                </div>
                            ))
                        ) : products.length > 0 ? (
                            products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <ProductCard {...product} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-text-muted italic">
                                No products found in this category.
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
