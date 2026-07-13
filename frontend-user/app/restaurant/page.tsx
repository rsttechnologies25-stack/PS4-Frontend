"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { formatImageUrl } from "@/lib/imageHelper";
import { motion } from "framer-motion";
import { UtensilsCrossed, Loader2, MapPin, ArrowRight } from "lucide-react";

export default function RestaurantPage() {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_URL}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.aboutPageContent?.restaurant) {
                        setContent(data.aboutPageContent.restaurant);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch restaurant content:", err);
            }
            
            // Fallback content if fetch fails or is empty
            setContent({
                isVisible: true,
                title: "Our Restaurant",
                titleAccent: "Authentic Flavors",
                description: "Experience the ultimate dining experience at Perambur Srinivasa. We serve traditional South Indian meals, delicious sweets, and premium savories in a warm, family-friendly ambiance.",
                image: null
            });
            setLoading(false);
        };
        fetchContent();
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    if (loading) {
        return (
            <div className="min-h-[85vh] bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-text-muted text-sm tracking-wider">Loading restaurant details...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-[85vh] flex items-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src={content?.image ? formatImageUrl(content.image) : "/hero_motichoor_laddu.jpg"} 
                    fill 
                    className="object-cover scale-105 filter brightness-75" 
                    alt="Restaurant Background" 
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent backdrop-blur-[1px]" />
            </div>

            {/* Content Container */}
            <div className="container relative z-10 px-4 mx-auto py-20">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    <motion.div
                        className="lg:col-span-7 bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-16 rounded-[3rem] shadow-2xl"
                        initial="initial"
                        animate="animate"
                        variants={fadeIn}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary mb-8 border border-secondary/20">
                            <UtensilsCrossed size={32} />
                        </div>
                        
                        <h1 className="serif text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                            {content?.title || "Our Restaurant"} <br />
                            <span className="text-secondary italic font-light">{content?.titleAccent || "Authentic Ambiance"}</span>
                        </h1>
                        
                        <div className="h-1 w-20 bg-secondary mb-8" />
                        
                        <div className="space-y-6 text-white/90 text-lg font-light leading-relaxed mb-10 max-w-xl">
                            <p>{content?.description || "Our restaurant offers a warm ambiance, exceptional service, and delicious South Indian culinary delights. Visit us for an authentic dining experience."}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                href="/branches"
                                className="inline-flex items-center justify-center gap-2 bg-secondary text-primary font-bold px-8 py-4 rounded-xl hover:bg-secondary/90 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                            >
                                <MapPin size={18} />
                                Find a Branch
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="/shop"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-8 py-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                            >
                                Browse Sweets
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
