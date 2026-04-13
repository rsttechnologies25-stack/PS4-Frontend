"use client";

import Image from "next/image";import { API_URL } from "@/lib/api";
import { formatImageUrl } from "@/lib/imageHelper";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
    History,
    Factory,
    MapPin,
    UtensilsCrossed,
    Globe2,
    Calendar,
    Star,
    Heart,
    ShieldCheck,
    Quote,
    Loader2
} from "lucide-react";



const IconMap: Record<string, any> = {
    Calendar, MapPin, Factory, Globe2, ShieldCheck, Heart, Star, Quote, UtensilsCrossed
};

const getIcon = (name: string) => IconMap[name] || Star;

export default function AboutPage() {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_URL}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setContent(data.aboutPageContent);
                }
            } catch (err) {
                console.error("Failed to fetch about content:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8 }
    };

    return (
        <main ref={containerRef} className="min-h-screen bg-[#FFFBF5] overflow-hidden">
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
            ) : content ? (
                <>
                    {/* Hero Section - Fixed Parallax */}
                    <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
                        <motion.div
                            style={{ scale: heroScale, opacity: heroOpacity }}
                            className="absolute inset-0 z-0"
                        >
                            <Image
                                src={content.hero.image ? formatImageUrl(content.hero.image) : "/about_us_hero.png"}
                                alt="PS4 Sweets and Snacks"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-black/40" />
                        </motion.div>

                        <div className="container relative z-10 px-4 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-white/10 backdrop-blur-md border border-white/20 p-12 md:p-20 rounded-[3rem] inline-block shadow-2xl"
                            >
                                <span className="accent-font text-primary-dark text-xl md:text-2xl mb-4 block tracking-widest uppercase font-bold">{content.hero.subtitle}</span>
                                <h1 className="serif text-6xl md:text-9xl text-white font-bold mb-6 tracking-tight">{content.hero.title}</h1>
                                <div className="h-1 w-24 bg-primary mx-auto mb-8" />
                                <p className="text-white/90 text-lg md:text-2xl max-w-2xl mx-auto font-light leading-relaxed">
                                    {content.hero.description}
                                </p>
                            </motion.div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full h-24 bg-[#FFFBF5] rounded-t-[5rem] z-20" />
                    </section>

                    {/* Overlapping Content Section */}
                    <section className="relative z-30 -mt-12">
                        <div className="container px-4 mx-auto">
                            <div className="bg-white rounded-[4rem] shadow-2xl p-8 md:p-20 border border-primary/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                                <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                                    <motion.div {...fadeIn}>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
                                            <History size={14} /> {content.legacy.badge}
                                        </div>
                                        <h2 className="serif text-5xl md:text-6xl text-secondary font-bold mb-8 leading-tight">
                                            {content.legacy.title}
                                        </h2>
                                        <div className="space-y-6 text-text-muted leading-relaxed text-lg font-light">
                                            {content.legacy.content.map((p: string, i: number) => (
                                                <p key={i}>{p}</p>
                                            ))}
                                            <div className="flex items-center gap-4 p-6 bg-primary/5 rounded-2xl border-l-4 border-primary italic text-secondary font-medium">
                                                <Quote size={32} className="text-primary opacity-20 flex-shrink-0" />
                                                "{content.legacy.quote}"
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl group"
                                        {...fadeIn}
                                        transition={{ delay: 0.2, duration: 1 }}
                                    >
                                        <Image
                                            src={content.legacy.image ? formatImageUrl(content.legacy.image) : "/about_legacy_img.png"}
                                            alt="Founder Legacy"
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-secondary/10 group-hover:bg-secondary/0 transition-colors" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats - Floating Cards Style */}
                    <section className="py-32 relative overflow-hidden bg-white">
                        <div className="container relative z-10 px-4 mx-auto">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                                {content.stats.map((stat: any, i: number) => {
                                    const Icon = getIcon(stat.icon);
                                    return (
                                        <motion.div
                                            key={i}
                                            className="bg-[#FFFBF5] p-10 rounded-[3rem] border border-primary/10 shadow-lg text-center group hover:bg-secondary hover:text-white transition-all duration-500"
                                            {...fadeIn}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-white/20 group-hover:text-white transition-all">
                                                <Icon size={28} />
                                            </div>
                                            <h3 className="text-4xl font-black mb-2">{stat.value}</h3>
                                            <p className="text-text-muted text-xs font-black uppercase tracking-widest group-hover:text-white/60">{stat.label}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Factory & Modern Standards */}
                    <section className="py-24 relative bg-primary text-white">
                        <div className="container relative z-10 px-4 mx-auto">
                            <div className="max-w-4xl mx-auto text-center mb-20">
                                <motion.h2 {...fadeIn} className="serif text-5xl md:text-6xl font-bold mb-8">
                                    {content.quality.title}
                                </motion.h2>
                                <p className="text-xl text-white/70 font-light leading-relaxed">
                                    {content.quality.description}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-10">
                                {content.quality.features.map((item: any, i: number) => {
                                    const Icon = getIcon(item.icon);
                                    return (
                                        <motion.div
                                            key={i}
                                            className="bg-white/10 backdrop-blur-sm p-12 rounded-[3.5rem] border border-white/10 hover:border-secondary transition-all group"
                                            {...fadeIn}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary mb-8 group-hover:bg-secondary group-hover:text-white transition-all duration-500">
                                                <Icon size={28} />
                                            </div>
                                            <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                                            <p className="text-white/60 text-lg font-light leading-relaxed">{item.desc}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Restaurant - Luxury Split */}
                    {content.restaurant.isVisible && (
                        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                <Image src={content.restaurant.image ? formatImageUrl(content.restaurant.image) : "/hero_motichoor_laddu.jpg"} fill className="object-cover" alt="Restaurant Background" />
                                <div className="absolute inset-0 bg-primary/70 backdrop-blur-[2px]" />
                            </div>

                            <div className="container relative z-10 px-4 mx-auto">
                                <div className="grid lg:grid-cols-12 gap-12 items-center">
                                    <motion.div
                                        className="lg:col-span-7 bg-white/10 backdrop-blur-xl border border-white/20 p-12 md:p-20 rounded-[4rem] shadow-2xl"
                                        {...fadeIn}
                                    >
                                        <div className="w-20 h-20 rounded-3xl bg-secondary/20 flex items-center justify-center text-secondary mb-10 border border-secondary/20">
                                            <UtensilsCrossed size={40} />
                                        </div>
                                        <h2 className="serif text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
                                            {content.restaurant.title} <br /><span className="text-secondary italic">{content.restaurant.titleAccent}</span>
                                        </h2>
                                        <div className="h-1 w-20 bg-secondary mb-10" />
                                        <div className="space-y-6 text-white/80 text-xl font-light leading-relaxed max-w-2xl">
                                            <p>{content.restaurant.description}</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Global Reach - Luxury Split (Reversed) */}
                    {content.global.isVisible && (
                        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                <Image src={content.global.image ? formatImageUrl(content.global.image) : "/ps4_sweets_hero_1.png"} fill className="object-cover" alt="Global Support Background" />
                                <div className="absolute inset-0 bg-primary/70 backdrop-blur-[2px]" />
                            </div>

                            <div className="container relative z-10 px-4 mx-auto">
                                <div className="grid lg:grid-cols-12 gap-12 items-center">
                                    <div className="hidden lg:block lg:col-span-1" />
                                    <motion.div
                                        className="lg:col-start-6 lg:col-span-7 bg-white/10 backdrop-blur-xl border border-white/20 p-12 md:p-20 rounded-[4rem] shadow-2xl text-right flex flex-col items-end"
                                        {...fadeIn}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="w-20 h-20 rounded-3xl bg-secondary/20 flex items-center justify-center text-secondary mb-10 border border-secondary/20">
                                            <Globe2 size={40} />
                                        </div>
                                        <h2 className="serif text-5xl md:text-7xl font-bold mb-8 text-white leading-tight text-right">
                                            {content.global.title} <br /><span className="text-secondary italic">{content.global.titleAccent}</span>
                                        </h2>
                                        <div className="h-1 w-20 bg-secondary mb-10" />
                                        <div className="space-y-6 text-white/80 text-xl font-light leading-relaxed max-w-2xl text-right">
                                            <p>{content.global.description}</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Commitment Footer - Spotlight Signature */}
                    <section className="py-48 bg-primary text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent opacity-60 z-10 pointer-events-none" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none z-0">
                            <span className="serif text-[40rem] font-bold leading-none tracking-tighter">PS4</span>
                        </div>

                        <div className="container relative z-20 px-4 mx-auto max-w-4xl">
                            <motion.div {...fadeIn}>
                                <div className="inline-block mb-12 relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/30"
                                    />
                                    <div className="w-28 h-28 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10 m-2">
                                        <Star size={44} className="text-secondary" />
                                    </div>
                                </div>

                                <h2 className="serif text-6xl md:text-8xl font-bold mb-12 leading-tight tracking-tight shadow-text">
                                    {content.footer.title} <br /> <span className="text-secondary italic">{content.footer.titleAccent}</span>
                                </h2>

                                <div className="max-w-3xl mx-auto mb-20 relative">
                                    <Quote size={120} className="absolute -top-10 -left-10 text-white/5 pointer-events-none" />
                                    <p className="text-white/80 text-2xl md:text-3xl font-light leading-relaxed px-4 relative z-10 italic">
                                        "{content.footer.quote}"
                                    </p>
                                    <Quote size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-180 pointer-events-none" />
                                </div>

                                <div className="flex flex-col items-center gap-6">
                                    <div className="px-8 py-3 bg-secondary/10 border border-secondary/30 rounded-full">
                                        <span className="accent-font text-secondary text-2xl tracking-[0.4em] uppercase font-black italic">{content.footer.legacyText}</span>
                                    </div>
                                    <p className="text-white/40 text-sm tracking-widest uppercase font-bold">{content.footer.subText}</p>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                </>
            ) : null}
        </main>
    );
}
