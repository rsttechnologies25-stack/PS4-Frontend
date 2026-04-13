"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { formatImageUrl } from "@/lib/imageHelper";

interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
    parentId?: string | null;
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
                            src={formatImageUrl(item.image)}
                            alt={`${item.name} Collection from Perambur Srinivasa Sweets`}
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 transition-opacity duration-300" />

                    <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
                        {/* Text centered, responsive size to prevent cropping */}
                        <h3 className="serif text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl uppercase tracking-wider md:tracking-widest drop-shadow-md group-hover:text-primary transition-colors duration-300 text-center leading-tight break-words max-w-full">{item.name}</h3>
                    </div>

                    {/* Border Fade Effect */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/20 transition-colors duration-500 pointer-events-none z-30" />
                </Link>
            </motion.div>
        </motion.div>
    );
};

import { API_URL } from "@/lib/api";
import { STATIC_CATEGORIES } from "@/lib/staticData";

export default function CollectionsGrid() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        // Fetch from API (for when backend is available)
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/categories`);
                const data = await res.json();

                // Custom sort order based on slug
                const order = [
                    "sweets",
                    "savouries",
                    "sev",
                    "pickle",
                    "podi",
                    "cookies",
                    "gifting",
                    "outdoor-catering"
                ];

                // Only show top-level categories on the home grid
                const topLevel = Array.isArray(data)
                    ? data.filter((cat: Category) => !cat.parentId)
                    : [];

                // Sort topLevel based on the defined order
                const sorted = topLevel.sort((a, b) => {
                    const indexA = order.indexOf(a.slug);
                    const indexB = order.indexOf(b.slug);

                    // If a slug is not in the order array, put it at the end
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;

                    return indexA - indexB;
                });

                setCategories(sorted);
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
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="accent-font text-primary uppercase tracking-[0.4em] text-sm mb-4">Our Categories</h2>
                    <h3 className="serif text-secondary text-3xl md:text-5xl mb-12">The PS4 Collections</h3>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.15 }
                        }
                    }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
                >
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <motion.div
                                variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
                                key={i}
                                className="animate-pulse bg-primary/5 aspect-square rounded-xl"
                            />
                        ))
                    ) : (
                        categories.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={{
                                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                                    show: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: { type: "spring", stiffness: 200, damping: 20 }
                                    }
                                }}
                                className="h-full"
                            >
                                <CategoryCard3D item={item} />
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </section>
    );
}
