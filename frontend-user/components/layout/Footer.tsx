"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
}

export default function Footer() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/categories`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter for top-level categories and take only the first 5 for the footer
                    const mainCats = data.filter((c: Category) => !c.parentId).slice(0, 5);
                    setCategories(mainCats);
                }
            } catch (error) {
                console.error("Failed to fetch categories for Footer:", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <footer className="bg-background pt-20 pb-10 border-t border-primary/10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Mission */}
                    <div className="space-y-6">
                        <Image src="/logo-v1.png" alt="PS4 Logo" width={180} height={60} className="h-12 w-auto object-contain" />
                        <p className="text-text-muted text-sm leading-relaxed italic">
                            &quot;Handcrafting traditions since 1981. Dedicated to bringing the authentic taste of South India to your doorstep.&quot;
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://www.instagram.com/perambur_sri_srinivasa?igsh=dXVjNHd5ZnZqbXMy" target="_blank" className="w-10 h-10 rounded-full bg-[#E4405F] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[#E4405F]/20">
                                <Instagram size={18} />
                            </Link>
                            <Link href="https://www.facebook.com/profile.php?id=100088165535870&mibextid=rS40aB7S9Ucbxw6v" target="_blank" className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[#1877F2]/20">
                                <Facebook size={18} />
                            </Link>
                            <Link href="https://x.com/peramburand" target="_blank" className="w-10 h-10 rounded-full bg-[#000000] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-black/20">
                                <svg 
                                    width="18" 
                                    height="18" 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="accent-font text-xs uppercase tracking-[0.3em] font-bold mb-8 text-primary">Explore</h4>
                        <ul className="space-y-4 text-sm text-text">
                            <li><Link href="/shop" className="hover:text-primary transition-colors">Shop All</Link></li>
                            {categories.map(cat => (
                                <li key={cat.id}>
                                    <Link href={`/category/${cat.slug}`} className="hover:text-primary transition-colors capitalize">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                            <li><Link href="/branches" className="hover:text-primary transition-colors">Our Branches</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="accent-font text-xs uppercase tracking-[0.3em] font-bold mb-8 text-primary">Policy</h4>
                        <ul className="space-y-4 text-sm text-text">
                            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
                            <li><Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="accent-font text-xs uppercase tracking-[0.3em] font-bold mb-8 text-primary">Contact</h4>
                        <ul className="space-y-6 text-sm text-text">
                            <li className="flex gap-4">
                                <MapPin className="text-primary shrink-0" size={18} />
                                <span>No. 23/16 Perambur High Road, Perambur, Chennai – 600011</span>
                            </li>
                            <li className="flex gap-4">
                                <Phone className="text-primary shrink-0" size={18} />
                                <span>+91 92824 45577</span>
                            </li>
                            <li className="flex gap-4">
                                <Mail className="text-primary shrink-0" size={18} />
                                <span>info@perambursrinivasa.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-primary/10 pt-10 text-center flex flex-col items-center gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
                        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-text-muted">
                            © 2026 Perambur Sri Srinivasa Sweets & Snacks. All rights reserved.
                        </p>
                        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-text-muted">
                            Made by <a href="https://rexonsofttech.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-bold">Rexon Soft Tech</a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
