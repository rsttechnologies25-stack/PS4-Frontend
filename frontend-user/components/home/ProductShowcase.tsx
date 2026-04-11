"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "../ui/ProductCard";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";
import { USE_STATIC_DATA, STATIC_PRODUCTS, getProductsByCategory, getBestSellers, getNewLaunches } from "@/lib/staticData";

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

interface ProductShowcaseProps {
    title: string;
    subtitle?: string;
    categorySlug?: string;
    filter?: "isBestSeller" | "isNewLaunch";
    limit?: number;
    viewAllHref?: string;
    dark?: boolean;
}

export default function ProductShowcase({
    title,
    subtitle,
    categorySlug,
    filter,
    limit = 4,
    viewAllHref,
    dark = false
}: ProductShowcaseProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (USE_STATIC_DATA) {
            let filteredProducts: Product[] = [];

            if (filter === "isBestSeller") {
                filteredProducts = getBestSellers();
            } else if (filter === "isNewLaunch") {
                filteredProducts = getNewLaunches();
            } else if (categorySlug) {
                filteredProducts = getProductsByCategory(categorySlug);
            } else {
                filteredProducts = STATIC_PRODUCTS.slice(0, limit);
            }

            setProducts(filteredProducts.slice(0, limit));
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {
                let query = "";
                if (filter === "isBestSeller") query = "isBestSeller=true";
                else if (filter === "isNewLaunch") query = "isNewLaunch=true";
                else if (categorySlug) query = `category=${categorySlug}&includeChildren=true`;

                const res = await fetch(`${API_URL}/products?${query}&limit=${limit}`);
                const data = await res.json();
                const productsArray = Array.isArray(data) ? data : (data?.data || []);
                setProducts(productsArray);
            } catch (error) {
                console.error(`Failed to fetch products for ${title}:`, error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categorySlug, filter, limit, title]);

    if (!loading && products.length === 0) return null;

    return (
        <section className={`py-20 ${dark ? "bg-secondary text-white" : "bg-background"}`}>
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    {subtitle && <h2 className={`accent-font uppercase tracking-[0.4em] text-sm mb-4 ${dark ? "text-primary-light opacity-80" : "text-primary"}`}>{subtitle}</h2>}
                    <h3 className={`serif text-3xl md:text-5xl ${dark ? "text-white" : "text-secondary"}`}>{title}</h3>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {loading ? (
                        Array(limit).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse bg-primary/5 aspect-[4/5] rounded-xl" />
                        ))
                    ) : (
                        products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.variants?.find(v => v.isDefault)?.price || product.variants?.[0]?.price || product.price || 0}
                                image={product.image}
                                slug={product.slug}
                                description={product.description}
                                variants={product.variants}
                                categoryId={product.categoryId}
                                isVeg={true}
                            />
                        ))
                    )}
                </div>

                {viewAllHref && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-16"
                    >
                        <Link
                            href={viewAllHref}
                            className="inline-flex items-center gap-3 group"
                        >
                            <span className={`serif text-xl md:text-2xl ${dark ? "text-white group-hover:text-primary" : "text-secondary group-hover:text-primary"} transition-colors border-b border-primary/30 group-hover:border-primary pb-1`}>
                                View All Collections
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
                                    className={`${dark ? "text-white" : "text-primary"} group-hover:text-white transition-colors`}
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
