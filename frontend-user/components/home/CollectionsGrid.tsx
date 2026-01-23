"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
}

// Reusable 3D Card Component for Categories
const CategoryCard3D = ({ item }: { item: Category }) => {
    const ref = useRef<HTMLDivElement>(null);

    // Motion values for 3D tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial="initial"
            whileHover="hover"
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="group relative flex flex-col bg-white rounded-xl shadow-md border border-gray-100 will-change-transform h-full"
        >
            {/* Shader-based Glow Animation (Behind) */}
            <div
                className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"
            />

            <motion.div
                variants={{
                    initial: { scale: 1 },
                    hover: { scale: 1.05 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative flex flex-col h-full bg-white rounded-xl overflow-hidden aspect-square"
                style={{ transformStyle: "preserve-3d" }}
            >
                <Link
                    href={`/category/${item.slug}`}
                    className="relative w-full h-full block bg-primary/5"
                >
                    {/* Shimmer/Shine Overlay */}
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] transition-all duration-1000 group-hover:left-[200%]" />
                    </div>

                    <motion.div
                        variants={{
                            initial: { scale: 1 },
                            hover: { scale: 1.1 }
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                    >
                        <Image
                            src={item.image || "/ps4_sweets_hero_1.png"}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 transition-opacity duration-300" />

                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        {/* Text centered, removed the border box */}
                        <h3 className="serif text-white text-3xl md:text-4xl uppercase tracking-widest drop-shadow-md group-hover:text-primary transition-colors duration-300">{item.name}</h3>
                    </div>

                    {/* Border Fade Effect */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/20 transition-colors duration-500 pointer-events-none z-30" />
                </Link>
            </motion.div>
        </motion.div>
    );
};

import { API_URL } from "@/lib/api";
import { USE_STATIC_DATA, STATIC_CATEGORIES } from "@/lib/staticData";

export default function CollectionsGrid() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use static data for Cloudflare deployment
        if (USE_STATIC_DATA) {
            setCategories(STATIC_CATEGORIES);
            setLoading(false);
            return;
        }

        // Fetch from API (for when backend is available)
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/categories`);
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <section className="py-20 bg-background text-center">
            <div className="container mx-auto px-4">
                <h2 className="accent-font text-primary uppercase tracking-[0.4em] text-sm mb-4">Our Categories</h2>
                <h3 className="serif text-secondary text-4xl md:text-5xl mb-12">The PS4 Collections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse bg-primary/5 aspect-square rounded-xl" />
                        ))
                    ) : (
                        categories.map((item) => (
                            <CategoryCard3D key={item.id} item={item} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
