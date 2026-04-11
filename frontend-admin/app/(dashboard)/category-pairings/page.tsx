"use client";

import { useEffect, useState } from "react";
import { API_URL, fetchWithAuth } from "@/lib/api";
import {
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Loader2,
    ArrowRight,
    LayoutGrid,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CategoryPairing {
    id: string;
    categoryId: string;
    categoryName: string;
    pairedCategoryId: string;
    pairedCategoryName: string;
    isActive: boolean;
    sortOrder: number;
}

export default function CategoryPairingsPage() {
    const [pairings, setPairings] = useState<CategoryPairing[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const [sourceCategoryId, setSourceCategoryId] = useState("");
    const [pairedCategoryId, setPairedCategoryId] = useState("");
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [pRes, cRes] = await Promise.all([
                fetch(`${API_URL}/category-pairings`),
                fetch(`${API_URL}/categories`)
            ]);
            const pData = await pRes.json();
            const cData = await cRes.json();

            setPairings(pData);
            // Only use top-level categories for simplicity in pairing, or all? 
            // Let's use all to allow subcategory specific pairings.
            setCategories(Array.isArray(cData) ? cData : cData.categories || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async () => {
        if (!sourceCategoryId || !pairedCategoryId) return;
        if (sourceCategoryId === pairedCategoryId) {
            setError("Cannot pair a category with itself");
            return;
        }

        setAdding(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`${API_URL}/category-pairings`, {
                method: "POST",
                body: JSON.stringify({
                    categoryId: sourceCategoryId,
                    pairedCategoryId,
                    sortOrder: pairings.length,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSourceCategoryId("");
                setPairedCategoryId("");
                fetchData();
            } else {
                setError(data.error || "Failed to add pairing");
            }
        } catch (error) {
            console.error("Error adding pairing:", error);
            setError("Connection error");
        } finally {
            setAdding(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await fetchWithAuth(`${API_URL}/category-pairings/${id}/toggle`, {
                method: "PATCH",
            });
            fetchData();
        } catch (error) {
            console.error("Error toggling pairing:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this suggestion pairing?")) return;
        try {
            await fetchWithAuth(`${API_URL}/category-pairings/${id}`, {
                method: "DELETE",
            });
            fetchData();
        } catch (error) {
            console.error("Error deleting pairing:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin text-[#EA580C]" size={48} />
                <p className="font-bold text-[#7C2D12]">Loading pairings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-brand-maroon tracking-tight">Product Suggestions</h1>
                    <p className="text-orange-900/50 mt-2 font-medium italic">
                        Define which categories should be suggested when a user adds items to their cart
                    </p>
                </div>
            </div>

            {/* Add new pairing */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50">
                <h3 className="text-lg font-bold text-brand-maroon mb-6 flex items-center gap-2">
                    <Plus size={20} className="text-primary" />
                    Add New Pairing Rule
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    <div className="md:col-span-5 space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-[#7C2D12]/40 ml-2">When cart has items from:</label>
                        <select
                            value={sourceCategoryId}
                            onChange={(e) => setSourceCategoryId(e.target.value)}
                            className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="">Select Source Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-1 flex justify-center pb-5">
                        <ArrowRight className="text-[#EA580C]/30" />
                    </div>

                    <div className="md:col-span-4 space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-[#7C2D12]/40 ml-2">Suggest products from:</label>
                        <select
                            value={pairedCategoryId}
                            onChange={(e) => setPairedCategoryId(e.target.value)}
                            className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="">Select Suggested Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <button
                            onClick={handleAdd}
                            disabled={!sourceCategoryId || !pairedCategoryId || adding}
                            className="w-full py-4 bg-[#EA580C] text-white font-bold rounded-2xl hover:bg-[#C2410C] transition-all transform hover:scale-[1.02] shadow-xl shadow-orange-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            Add Rule
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                        <AlertCircle size={16} />
                        <p className="text-xs font-bold uppercase">{error}</p>
                    </div>
                )}
            </div>

            {/* Pairings list */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50">
                <h3 className="text-lg font-bold text-brand-maroon mb-6 border-b border-orange-100 pb-4 flex items-center gap-2">
                    <LayoutGrid size={20} className="text-primary" />
                    Active Pairing Rules ({pairings.length})
                </h3>

                {pairings.length === 0 ? (
                    <div className="text-center py-16">
                        <LayoutGrid size={48} className="mx-auto text-[#7C2D12]/20 mb-4" />
                        <p className="text-[#7C2D12]/40 font-bold">
                            No pairing rules yet. Define your first one above!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {pairings.map((pairing) => (
                            <div
                                key={pairing.id}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-2xl border transition-all",
                                    pairing.isActive
                                        ? "bg-green-50/50 border-green-200"
                                        : "bg-gray-50 border-gray-200 opacity-60"
                                )}
                            >
                                {/* Toggle */}
                                <button
                                    onClick={() => handleToggle(pairing.id)}
                                    className="flex-shrink-0"
                                >
                                    {pairing.isActive ? (
                                        <ToggleRight size={28} className="text-green-600" />
                                    ) : (
                                        <ToggleLeft size={28} className="text-gray-400" />
                                    )}
                                </button>

                                {/* Rule Display */}
                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <span className="font-bold text-[#7C2D12] text-sm px-3 py-1 bg-white rounded-lg border border-orange-100 shadow-sm">
                                        {pairing.categoryName}
                                    </span>
                                    <ArrowRight size={14} className="text-[#EA580C]/40" />
                                    <span className="font-bold text-[#EA580C] text-sm px-3 py-1 bg-orange-50 rounded-lg border border-orange-100 shadow-sm">
                                        {pairing.pairedCategoryName}
                                    </span>
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={() => handleDelete(pairing.id)}
                                    className="p-2 text-[#7C2D12]/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 items-start">
                <AlertCircle className="text-blue-500 mt-1" size={20} />
                <div>
                    <h4 className="text-blue-800 font-bold mb-1 italic text-sm underline decoration-wavy">Pro Tip: Multi-Level Suggestions</h4>
                    <p className="text-blue-600 text-xs font-medium leading-relaxed">
                        If a user has an item from a sub-category in their cart, the system will automatically check for pairings assigned to the parent category as well. This way, you can define broad rules (e.g., Sweets → Cookies) that apply to all types of Sweets.
                    </p>
                </div>
            </div>
        </div>
    );
}
