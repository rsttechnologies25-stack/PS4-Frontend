"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Phone, Search, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";
import { USE_STATIC_DATA, STATIC_BRANCHES } from "@/lib/staticData";

interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    image?: string;
}

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Use static data for Cloudflare deployment
        if (USE_STATIC_DATA) {
            setBranches(STATIC_BRANCHES);
            setLoading(false);
            return;
        }

        // Fetch from API (for when backend is available)
        const fetchBranches = async () => {
            try {
                const res = await fetch(`${API_URL}/branches`);
                const data = await res.json();
                setBranches(data);
            } catch (error) {
                console.error("Failed to fetch branches:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, []);

    const filteredBranches = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#FFFBF5] bg-pattern pt-28 pb-20">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header Section */}
                <div className="text-center mb-16 relative">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black accent-font text-primary mb-4 uppercase tracking-tighter">
                        Our Outlets
                    </h1>
                    <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
                    <p className="text-text-muted max-w-2xl mx-auto italic text-lg leading-relaxed">
                        Handcrafting traditions since 1974. Visit our stores to experience the authentic taste of South India.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search by city, area or branch name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-primary/10 bg-white focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-secondary font-medium shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-primary/30 tracking-widest hidden sm:block">
                        {filteredBranches.length} LOCATIONS
                    </div>
                </div>

                {/* Branches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredBranches.map((branch, idx) => (
                            <motion.div
                                layout
                                key={branch.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all relative overflow-hidden flex flex-col h-full"
                            >
                                {/* Image Section */}
                                <div className="relative h-48 w-full overflow-hidden">
                                    <Image
                                        src={branch.image || "/hero_motichoor_laddu.jpg"}
                                        alt={branch.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute bottom-4 left-4">
                                        <div className="inline-block px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            {branch.city}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="mb-6">
                                        <h3 className="serif text-2xl font-bold text-secondary mb-3 leading-tight group-hover:text-primary transition-colors">
                                            {branch.name}
                                        </h3>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-grow">
                                        <p className="text-text-muted text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity flex gap-3">
                                            <MapPin size={18} className="text-primary shrink-0" />
                                            {branch.address}
                                        </p>
                                        <div className="flex items-center gap-3 text-text-muted text-sm font-medium hover:text-primary transition-colors cursor-pointer group/tel">
                                            <Phone size={18} className="text-primary shrink-0" />
                                            <span>{branch.phone}</span>
                                        </div>
                                    </div>

                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.name + ' ' + branch.address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-auto w-full py-4 rounded-xl border-2 border-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary hover:border-primary hover:text-white transition-all active:scale-[0.98]"
                                    >
                                        <Navigation size={14} /> GET DIRECTIONS
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredBranches.length === 0 && (
                    <div className="text-center py-40">
                        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/20">
                            <Search size={48} />
                        </div>
                        <h3 className="serif text-2xl text-secondary mb-2">No branches found</h3>
                        <p className="text-text-muted">Try searching for a different area or city.</p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-8 text-primary font-bold uppercase text-xs tracking-widest hover:underline"
                        >
                            CLEAR ALL FILTERS
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
