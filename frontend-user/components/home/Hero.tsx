"use client";

import { useState, useEffect } from "react";import { API_URL } from "@/lib/api";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";


import { formatImageUrl } from "@/lib/imageHelper";

// Fallback slides when no banners exist in DB
const fallbackSlides = [
    {
        image: "/hero_motichoor_laddu.jpg",
        displayTitle: "Signature Motichoor Laddu",
        displaySubtitle: "The Soul of Perambur Sri Srinivasa. Pure Ghee. Traditionally Crafted.",
        ctaText: "Order Now",
        link: "/product/motichur-laddu",
        slideInterval: 6,
    },
    {
        image: "/hero_kaju_katli.jpg",
        displayTitle: "Premium Kaju Katli",
        displaySubtitle: "Exquisite Cashew Delight. Melt-in-your-mouth Perfection.",
        ctaText: "Shop Now",
        link: "/product/kaju-katli",
        slideInterval: 6,
    },
];

interface BannerSlide {
    id?: string;
    image: string;
    displayTitle: string;
    displaySubtitle: string;
    ctaText: string;
    link: string;
    slideInterval: number;
}

export default function Hero() {
    const [slides, setSlides] = useState<BannerSlide[]>(fallbackSlides);
    const [current, setCurrent] = useState(0);
    const [loaded, setLoaded] = useState(false);

    // Fetch banners from API
    useEffect(() => {
        fetch(`${API_URL}/hero-banners/active`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const mapped: BannerSlide[] = data.map((b: any) => ({
                        id: b.id,
                        image: formatImageUrl(b.image),
                        displayTitle: b.displayTitle || "Welcome",
                        displaySubtitle: b.displaySubtitle || "",
                        ctaText: b.ctaText || "SHOP NOW",
                        link: b.link || "/",
                        slideInterval: b.slideInterval || 6,
                    }));
                    setSlides(mapped);
                }
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, []);

    // Auto-slide with dynamic interval
    useEffect(() => {
        const interval = (slides[current]?.slideInterval || 6) * 1000;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, interval);
        return () => clearInterval(timer);
    }, [current, slides]);

    return (
        <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden bg-secondary">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="relative h-full w-full"
                >
                    <Image
                        src={slides[current].image}
                        alt={slides[current].displayTitle}
                        fill
                        className="object-cover brightness-75 scale-105"
                        priority
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-4">
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white uppercase tracking-[0.3em] md:tracking-[0.6em] text-[9px] md:text-sm accent-font mb-4 md:mb-6"
                        >
                            SINCE 1981
                        </motion.p>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="serif text-white text-2xl sm:text-4xl md:text-5xl lg:text-8xl mb-4 md:mb-6 max-w-5xl leading-tight px-2"
                        >
                            {slides[current].displayTitle}
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-white/90 text-sm md:text-xl mb-8 md:mb-10 max-w-2xl font-light italic"
                        >
                            {slides[current].displaySubtitle}
                        </motion.p>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0"
                        >
                            <Link href={slides[current].link} className="btn-primary w-full sm:w-60 h-12 md:h-14 flex items-center justify-center text-[10px] md:text-sm font-bold uppercase tracking-widest">
                                {slides[current].ctaText}
                            </Link>
                            <Link href="/about" className="backdrop-blur-sm bg-white/20 border border-white/50 text-white hover:bg-white hover:text-secondary w-full sm:w-60 h-12 md:h-14 flex items-center justify-center text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all duration-300">
                                Our Story
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <button
                onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            >
                <ChevronLeft size={48} strokeWidth={1} />
            </button>
            <button
                onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            >
                <ChevronRight size={48} strokeWidth={1} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === current ? 'w-8 bg-primary' : 'bg-white/30'}`}
                    />
                ))}
            </div>
        </section>
    );
}
