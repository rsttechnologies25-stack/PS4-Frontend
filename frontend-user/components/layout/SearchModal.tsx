"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ShoppingBag, ArrowRight, Loader2, History, TrendingUp, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { API_URL } from "@/lib/api";
import { formatImageUrl } from "@/lib/imageHelper";

interface SearchResult {
    products: any[];
    categories: any[];
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem("recent_searches");
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
            setQuery("");
            setResults(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length === 0) {
            setResults(null);
            return;
        }

        const debounce = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    setResults(await res.json());
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [query]);

    const handleSaveSearch = (text: string) => {
        const updated = [text, ...recentSearches.filter(s => s !== text)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recent_searches", JSON.stringify(updated));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-white lg:bg-[#FFFBF5]/95 lg:backdrop-blur-xl flex flex-col"
                >
                    {/* Header */}
                    <div className="border-b border-primary/10 bg-white px-4 md:px-8 py-4 flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for sweets, savouries, or categories..."
                                className="w-full bg-orange-50/50 border-none py-4 pl-12 pr-4 text-lg font-medium focus:ring-0 outline-none rounded-2xl placeholder:text-orange-900/20 text-secondary"
                            />
                            {loading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="animate-spin text-primary" size={20} />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-orange-100 rounded-full transition-colors text-secondary"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="container mx-auto px-4 md:px-8 py-10 max-w-4xl">
                            {!query && recentSearches.length > 0 && (
                                <div className="mb-10 animate-in fade-in slide-in-from-top-4">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                        <History size={14} /> Recent Searches
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setQuery(s)}
                                                className="px-4 py-2 bg-white border border-orange-100 rounded-full text-xs font-bold text-secondary hover:border-primary hover:text-primary transition-all shadow-sm"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!query && (
                                <div className="animate-in fade-in slide-in-from-top-4 delay-75">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                        <TrendingUp size={14} /> Popular Categories
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {["Sweets", "Savouries", "Pickles", "Podi"].map((cat) => (
                                            <Link
                                                key={cat}
                                                href={`/category/${cat.toLowerCase()}`}
                                                onClick={onClose}
                                                className="p-4 bg-white border border-orange-100 rounded-2xl text-center hover:shadow-xl hover:-translate-y-1 transition-all group"
                                            >
                                                <div className="text-sm font-black text-secondary uppercase tracking-widest">{cat}</div>
                                                <div className="text-[9px] text-primary font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">EXPLORE ALL</div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {query && !loading && results && results.products.length === 0 && results.categories.length === 0 && (
                                <div className="text-center py-20 animate-in fade-in zoom-in-95">
                                    <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="text-orange-900/20" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-secondary mb-2">No results found for "{query}"</h3>
                                    <p className="text-orange-900/40 text-sm max-w-xs mx-auto">
                                        Try checking your spelling or search for something broader like "Sweets" or "Savouries".
                                    </p>
                                </div>
                            )}

                            {results && (query.trim().length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    {/* Products Column */}
                                    <div className="md:col-span-2 space-y-8">
                                        <div>
                                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                                <ShoppingBag size={14} /> Suggested Products ({results.products.length})
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {results.products.length > 0 ? results.products.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/product/${product.slug}`}
                                                        onClick={() => {
                                                            handleSaveSearch(query);
                                                            onClose();
                                                        }}
                                                        className="flex items-center gap-4 p-4 bg-white border border-orange-50 rounded-2xl hover:border-primary hover:shadow-xl transition-all group"
                                                    >
                                                        <div className="relative w-16 h-16 bg-orange-50 rounded-xl overflow-hidden flex-shrink-0">
                                                            <Image
                                                                src={formatImageUrl(product.image)}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{product.categoryName}</div>
                                                            <h4 className="font-bold text-secondary truncate">{product.name}</h4>
                                                            <div className="text-xs font-bold text-orange-900/40">From ₹{product.price}</div>
                                                        </div>
                                                        <ArrowRight size={18} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                                                    </Link>
                                                )) : (
                                                    <div className="text-orange-900/30 font-medium italic py-10 bg-orange-50/20 rounded-2xl text-center border border-dashed border-orange-100">
                                                        No products match your search
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Categories Column */}
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                                <Tag size={14} /> Categories
                                            </h3>
                                            <div className="space-y-3">
                                                {results.categories.length > 0 ? results.categories.map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/category/${cat.slug}`}
                                                        onClick={() => {
                                                            handleSaveSearch(query);
                                                            onClose();
                                                        }}
                                                        className="block p-4 bg-orange-50/30 border border-transparent hover:border-primary hover:bg-white rounded-2xl transition-all group"
                                                    >
                                                        <div className="font-bold text-secondary group-hover:text-primary transition-colors flex items-center justify-between">
                                                            {cat.name}
                                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        {cat.parentName && (
                                                            <div className="text-[9px] text-orange-900/40 font-black uppercase tracking-widest mt-1">
                                                                In {cat.parentName}
                                                            </div>
                                                        )}
                                                    </Link>
                                                )) : (
                                                    <div className="text-orange-900/30 font-medium italic p-4 bg-orange-50/20 rounded-2xl border border-dashed border-orange-100">
                                                        No categories found
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
