"use client";

import { motion } from "framer-motion";
import {
    MapPin,
    Phone,
    Mail,
    ExternalLink,
    Clock,
    Heart,
    ChevronRight,
    Building2,
    HeadphonesIcon,
    Loader2
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ContactPage() {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_URL}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setContent(data.contactPageContent);
                }
            } catch (err) {
                console.error("Failed to fetch contact content:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8 }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!content) return null;

    return (
        <main className="min-h-screen bg-[#FFFBF5] overflow-hidden">
            {/* Minimalist Hero */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 scale-110">
                    <Image
                        src={content.hero.image || "/ps4_sweets_hero_1.png"}
                        alt="Contact PS4"
                        fill
                        className="object-cover blur-[2px] opacity-40"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFFBF5]/80 to-[#FFFBF5]" />
                </div>

                <div className="container relative z-10 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="space-y-4"
                    >
                        <span className="accent-font text-secondary text-2xl md:text-3xl mb-2 block uppercase tracking-[0.3em] font-black">{content.hero.badge}</span>
                        <h1 className="serif text-5xl md:text-8xl text-secondary font-bold tracking-tighter">{content.hero.title}</h1>
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <div className="h-[1px] w-20 bg-primary" />
                            <div className="w-3 h-3 rounded-full bg-secondary" />
                            <div className="h-[1px] w-20 bg-primary" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Split Content Section - The Balanced Duo */}
            <section className="pb-32 relative">
                <div className="container px-4 mx-auto">
                    <div className="grid lg:grid-cols-2 gap-0 rounded-[4rem] overflow-hidden shadow-2xl border border-secondary/5">

                        {/* Left Side: Corporate (BROWN) */}
                        <motion.div
                            {...fadeIn}
                            className="bg-secondary p-12 md:p-24 text-white relative group"
                        >

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-12 w-fit">
                                    <Building2 size={16} /> {content.hq.badge}
                                </div>

                                <h2 className="serif text-5xl md:text-6xl font-bold mb-12 leading-tight">
                                    {content.hq.title.replace(content.hq.titleAccent, "")}
                                    <br />
                                    <span className="text-primary italic">{content.hq.titleAccent}</span>
                                </h2>

                                <div className="space-y-12 flex-grow">
                                    <div className="flex gap-8 group/item">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all duration-500">
                                            <MapPin size={32} />
                                        </div>
                                        <div>
                                            <p className="text-white/40 uppercase tracking-widest text-xs font-black mb-2">Location</p>
                                            <address className="not-italic text-xl font-light leading-relaxed max-w-xs">
                                                {content.hq.address}
                                            </address>
                                            <a href={content.hq.mapsLink} target="_blank" className="inline-flex items-center gap-2 text-primary mt-4 hover:gap-4 transition-all">
                                                View on Maps <ChevronRight size={16} />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex gap-8 group/item">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all duration-500">
                                            <HeadphonesIcon size={32} />
                                        </div>
                                        <div>
                                            <p className="text-white/40 uppercase tracking-widest text-xs font-black mb-2">Support</p>
                                            <p className="text-xl font-light mb-1">{content.hq.phone}</p>
                                            <p className="text-xl font-light">{content.hq.email}</p>
                                            <div className="flex gap-6 mt-6">
                                                <a href={`tel:${content.hq.phone}`} className="text-primary hover:text-white transition-colors uppercase text-xs font-black tracking-widest">Call Us</a>
                                                <a href={`mailto:${content.hq.email}`} className="text-primary hover:text-white transition-colors uppercase text-xs font-black tracking-widest">Email Us</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-20 pt-12 border-t border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="text-primary"><Clock size={20} /></div>
                                        <p className="text-white/50 text-sm italic">{content.hq.hours}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Side: Feedback (ORANGE) */}
                        <motion.div
                            {...fadeIn}
                            className="bg-primary p-12 md:p-24 text-white relative"
                        >
                            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />

                            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center text-white mb-12 shadow-2xl"
                                >
                                    <Heart size={48} className="fill-white" />
                                </motion.div>

                                <h2 className="serif text-5xl md:text-7xl font-bold mb-8 leading-none tracking-tight">
                                    {content.feedback.title.replace(content.feedback.titleAccent, "")}
                                    <br />
                                    <span className="text-secondary italic">{content.feedback.titleAccent}</span>
                                </h2>

                                <p className="text-white/80 text-xl md:text-2xl font-light leading-relaxed mb-16 max-w-md">
                                    {content.feedback.description}
                                </p>

                                <div className="space-y-8 w-full max-w-sm">
                                    <a
                                        href={content.feedback.reviewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-4 px-12 py-6 bg-secondary text-white rounded-full font-black uppercase tracking-[0.3em] text-sm hover:bg-white hover:text-secondary hover:translate-y-[-4px] transition-all shadow-2xl group"
                                    >
                                        Share Your Review <ExternalLink size={20} className="group-hover:rotate-12 transition-transform" />
                                    </a>

                                    <div className="flex items-center justify-center gap-10 pt-8 opacity-40">
                                        {content.feedback.stats.map((stat: any, idx: number) => (
                                            <div key={idx} className="flex items-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="serif text-3xl font-bold mb-1">{stat.value}</span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest">{stat.label}</span>
                                                </div>
                                                {idx === 0 && <div className="w-[1px] h-10 bg-white ml-10" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Premium Framed Map Section */}
            <section className="container px-4 mx-auto pb-40">
                <motion.div
                    {...fadeIn}
                    className="relative h-[600px] w-full rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white"
                >
                    <iframe
                        src={content.map.iframeUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute top-8 left-8 right-8 pointer-events-none flex justify-between items-start">
                        <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-primary/10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">{content.map.badge}</p>
                            <p className="serif text-sm font-bold text-primary">{content.map.subText}</p>
                        </div>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
