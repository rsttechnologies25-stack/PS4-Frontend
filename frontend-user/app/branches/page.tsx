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
    isHeadOffice?: boolean;
}

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState<string | null>(null);

    useEffect(() => {
        if (USE_STATIC_DATA) {
            setBranches(STATIC_BRANCHES);
            setLoading(false);
            return;
        }

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

    const cities = Array.from(new Set(branches.map(b => b.city))).sort();

    // City statistics
    const cityStats = cities.map(city => ({
        name: city,
        count: branches.filter(b => b.city === city).length,
        image: branches.find(b => b.city === city)?.image || "/hero_motichoor_laddu.jpg"
    }));

    const filteredBranches = branches.filter(branch => {
        const matchesCity = !selectedCity || branch.city === selectedCity;
        const matchesSearch = !searchQuery ||
            branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.address.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCity && matchesSearch;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <>
            {branches.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "itemListElement": branches.map((branch, idx) => ({
                                "@type": "ListItem",
                                "position": idx + 1,
                                "item": {
                                    "@type": "SweetShop",
                                    "name": `Perambur Srinivasa Sweets - ${branch.name}`,
                                    "description": `Authentic South Indian Sweet Shop in ${branch.city}`,
                                    "address": {
                                        "@type": "PostalAddress",
                                        "streetAddress": branch.address,
                                        "addressLocality": branch.city,
                                        "addressRegion": "TN",
                                        "postalCode": branch.address.match(/\d{6}/)?.[0] || "",
                                        "addressCountry": "IN"
                                    },
                                    "telephone": branch.phone,
                                    "image": branch.image || "https://perambursrinivasa.com/hero_motichoor_laddu.jpg",
                                    "url": `https://perambursrinivasa.com/branches`,
                                    "priceRange": "₹₹"
                                }
                            }))
                        }),
                    }}
                />
            )}
            <main className="min-h-screen bg-[#FFFBF5] pt-28 pb-20">
                <div className="container mx-auto px-4 md:px-6">

                    {/* Header Section */}
                    <div className="text-center mb-16 relative">
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black accent-font text-primary mb-4 uppercase tracking-tighter">
                            Our Outlets
                        </h1>
                        <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
                        <p className="text-text-muted max-w-2xl mx-auto italic text-lg leading-relaxed">
                            Handcrafting traditions since 1981. Visit our stores to experience the authentic taste of South India.
                        </p>
                    </div>

                    {!selectedCity ? (
                        <>
                            {/* City Selection Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                                {cityStats.map((city, idx) => (
                                    <motion.div
                                        key={city.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => setSelectedCity(city.name)}
                                        className="cursor-pointer group relative h-64 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                                    >
                                        <Image
                                            src={city.image}
                                            alt={city.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                                            <h3 className="serif text-2xl font-bold mb-1">{city.name}</h3>
                                            <p className="text-sm opacity-80 font-medium uppercase tracking-widest">
                                                {city.count} {city.count === 1 ? 'Location' : 'Locations'}
                                            </p>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Navigation size={20} className="text-white" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Navigation & Search Box */}
                            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
                                <button
                                    onClick={() => {
                                        setSelectedCity(null);
                                        setSearchQuery("");
                                    }}
                                    className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest hover:translate-x-[-4px] transition-transform"
                                >
                                    ← Back to Cities
                                </button>

                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                                    <input
                                        type="text"
                                        placeholder={`Search in ${selectedCity}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-primary/10 bg-white focus:outline-none focus:border-primary/40 transition-all text-secondary font-medium text-sm"
                                    />
                                </div>

                                <div className="text-[10px] font-black uppercase text-primary/30 tracking-widest">
                                    Showing {filteredBranches.length} locations in {selectedCity}
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

                                                {branch.isHeadOffice && (
                                                    <div className="absolute top-4 left-4 z-10">
                                                        <div className="px-3 py-1 rounded-full bg-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                                                            Head Office
                                                        </div>
                                                    </div>
                                                )}

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
                        </>
                    )}

                    {filteredBranches.length === 0 && selectedCity && (
                        <div className="text-center py-40">
                            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/20">
                                <Search size={48} />
                            </div>
                            <h3 className="serif text-2xl text-secondary mb-2">No branches found</h3>
                            <p className="text-text-muted">Try searching for a different area in {selectedCity}.</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-8 text-primary font-bold uppercase text-xs tracking-widest hover:underline"
                            >
                                CLEAR SEARCH
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
