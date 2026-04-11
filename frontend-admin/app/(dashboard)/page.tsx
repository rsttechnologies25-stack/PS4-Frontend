"use client";

import { useState, useEffect } from "react";
import {
    ShoppingBag,
    Layers,
    MapPin,
    Users,
    TrendingUp,
    ArrowUpRight,
    Plus,
    ArrowRight
} from "lucide-react";
import { API_URL } from "@/lib/api";
import Link from "next/link";

const statsConfig = [
    { label: "Total Products", key: "products", icon: ShoppingBag, color: "text-brand-orange", bg: "bg-orange-100" },
    { label: "Categories", key: "categories", icon: Layers, color: "text-brand-maroon", bg: "bg-orange-200" },
    { label: "Branches", key: "branches", icon: MapPin, color: "text-green-700", bg: "bg-green-100" },
    { label: "Reviews", key: "reviews", icon: Users, color: "text-purple-700", bg: "bg-purple-100" },
];

export default function DashboardPage() {
    const [counts, setCounts] = useState({ products: 0, categories: 0, branches: 0, reviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const endpoints = ["products", "categories", "branches", "reviews"];
                const results = await Promise.all(
                    endpoints.map(e => fetch(`${API_URL}/${e}`).then(async res => {
                        if (!res.ok) return [];
                        try { return await res.json(); } catch { return []; }
                    }).catch(() => []))
                );

                setCounts({
                    products: Array.isArray(results[0]) ? results[0].length : (results[0]?.pagination?.total || results[0]?.data?.length || 0),
                    categories: results[1]?.length || 0,
                    branches: results[2]?.length || 0,
                    reviews: results[3]?.length || 0,
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-orange-200 pb-8">
                <div>
                    <h1 className="text-5xl font-black text-brand-maroon tracking-tight outfit uppercase">Overview</h1>
                    <p className="text-brand-maroon font-bold mt-2 text-lg italic opacity-80">Welcome back to the PS4 Sweets & Snacks portal</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/products/new" className="px-8 py-4 bg-white border-2 border-brand-orange rounded-2xl font-black text-brand-orange hover:bg-orange-50 transition-all flex items-center gap-3 shadow-lg shadow-orange-950/5">
                        <Plus size={24} />
                        New Product
                    </Link>
                    <button className="px-8 py-4 bg-brand-orange text-white rounded-2xl font-black hover:bg-primary-dark transition-all transform hover:scale-[1.02] shadow-2xl shadow-orange-600/30 flex items-center gap-3">
                        <TrendingUp size={24} />
                        Reports
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {statsConfig.map((stat) => (
                    <div key={stat.label} className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-orange-950/5 border border-orange-100 flex flex-col gap-8 relative overflow-hidden group hover:border-brand-orange/30 transition-all">
                        <div className={`p-5 rounded-3xl ${stat.bg} ${stat.color} w-fit group-hover:scale-110 transition-transform`}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-brand-maroon/40 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl font-black text-brand-maroon tracking-tighter">
                                    {loading ? "..." : counts[stat.key as keyof typeof counts]}
                                </p>
                                <div className="flex items-center text-green-700 font-black text-xs mb-2 bg-green-100 px-3 py-1 rounded-full border border-green-200 shadow-sm">
                                    <ArrowUpRight size={14} className="mr-0.5" />
                                    <span>+12%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-2xl shadow-orange-950/10 border border-orange-100 overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-orange-100 flex items-center justify-between bg-orange-50/10">
                        <h3 className="text-2xl font-black text-brand-maroon uppercase tracking-tight flex items-center gap-3">
                            <ShoppingBag className="text-brand-orange" /> Inventory Status
                        </h3>
                        <Link href="/products" className="text-brand-orange font-black text-sm hover:underline flex items-center gap-2">
                            Full Catalog <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="p-16 flex flex-col items-center justify-center text-center flex-1 brand-pattern">
                        <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-8 text-brand-orange shadow-inner border border-orange-100">
                            <ShoppingBag size={48} />
                        </div>
                        <p className="text-2xl font-black text-brand-maroon outfit tracking-tight">System Operational</p>
                        <p className="text-brand-maroon/60 text-lg mt-4 max-w-sm font-bold leading-relaxed italic">Your real-time database is synced and all catalog features are ready.</p>
                    </div>
                </div>

                <div className="bg-brand-maroon rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-orange-950/40">
                    <div className="absolute -top-20 -right-20 p-10 opacity-10 transform rotate-12">
                        <TrendingUp size={280} className="text-white" />
                    </div>
                    <span className="bg-brand-orange text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full shadow-lg border border-white/20">
                        Pro Tip
                    </span>
                    <h3 className="text-4xl font-black mt-8 mb-8 outfit tracking-tight leading-none uppercase">Organize & Grow</h3>
                    <p className="text-orange-50 font-bold leading-relaxed text-xl italic outfit opacity-90">
                        "Regularly updating your category hierarchy helps customers find seasonal sweets faster on the website."
                    </p>
                    <div className="mt-12 h-1.5 w-24 bg-brand-orange rounded-full shadow-lg shadow-orange-500/50" />
                    <Link href="/categories" className="mt-12 block text-center px-10 py-5 bg-white text-brand-maroon hover:bg-orange-50 rounded-2xl font-black tracking-widest uppercase text-sm transition-all shadow-xl shadow-black/30">
                        Manage Categories
                    </Link>
                </div>
            </div>
        </div>
    );
}
