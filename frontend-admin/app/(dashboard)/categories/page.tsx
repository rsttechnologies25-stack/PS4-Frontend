"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, fetchWithAuth } from "@/lib/api";
import {
    Plus,
    Edit3,
    Trash2,
    Loader2,
    Layers,
    ChevronRight,
    ChevronDown,
    FolderTree
} from "lucide-react";
import { formatImageUrl } from "@/lib/imageHelper";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            await fetchCategories(true);
            setLoading(false);
        };
        init();
    }, []);

    const fetchCategories = async (isInitial = false) => {
        if (!isInitial) setSyncing(true);
        try {
            const res = await fetch(`${API_URL}/categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                console.log("Categories synced:", data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            if (!isInitial) setSyncing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This may affect products in this category.")) return;

        setDeletingId(id);
        try {
            const res = await fetchWithAuth(`${API_URL}/categories/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setCategories(categories.filter(c => c.id !== id));
            } else {
                alert("Failed to delete category");
            }
        } catch (error) {
            alert("Error deleting category");
        } finally {
            setDeletingId(null);
        }
    };

    const parentCategories = categories.filter(c => !c.parentId);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-brand-maroon tracking-tight">Category Hierarchy</h1>
                    <p className="text-orange-900/50 mt-2 font-medium italic">Organise your shop's structure and collections</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchCategories(false)}
                        disabled={syncing}
                        className={`p-4 bg-white border border-orange-200 text-[#7C2D12] rounded-2xl transition-all shadow-sm flex items-center gap-2 group ${syncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50 active:scale-95'}`}
                        title="Sync with production"
                    >
                        <Loader2 className={syncing ? "animate-spin text-primary" : "text-[#7C2D12]/40 group-hover:text-primary transition-colors"} size={20} />
                        <span className="font-bold text-sm">{syncing ? 'Syncing...' : 'Sync Data'}</span>
                    </button>
                    <Link
                        href="/categories/new"
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-orange-600/20 w-fit transform hover:scale-[1.02]"
                    >
                        <Plus size={22} />
                        Create New Collection
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="bg-white p-32 rounded-[2.5rem] border border-orange-100/50 shadow-xl shadow-orange-950/5 flex flex-col items-center justify-center gap-6">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <p className="font-bold text-lg italic outfit tracking-wide text-orange-900/20">Mapping the sweet world...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white p-32 rounded-[2.5rem] border border-orange-100/50 shadow-xl shadow-orange-950/5 flex flex-col items-center justify-center gap-6 text-orange-900/20">
                    <Layers size={64} className="text-orange-200" />
                    <p className="font-bold text-lg italic outfit tracking-wide text-brand-maroon/30">No collections defined yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {parentCategories.map((parent) => (
                        <div key={parent.id} className="bg-white rounded-[2.5rem] border border-orange-100/50 shadow-lg shadow-orange-950/5 overflow-hidden group">
                            <div className="p-8 flex items-center justify-between border-b border-orange-100 bg-orange-100/20 transition-colors group-hover:bg-orange-100/30">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border border-orange-200 flex-shrink-0 shadow-sm p-1">
                                        {parent.image && <img src={formatImageUrl(parent.image)} alt={parent.name} className="w-full h-full object-cover rounded-xl" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-bold text-[#7C2D12]">{parent.name}</h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-[#7C2D12] text-white px-2 py-0.5 rounded-md">Main</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-orange-200 text-[#7C2D12] px-2 py-0.5 rounded-md">Order: {parent.sortOrder ?? 0}</span>
                                        </div>
                                        <p className="text-[#7C2D12]/60 font-bold text-sm mt-1 uppercase tracking-widest font-mono">{parent.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/categories/${parent.id}`}
                                        className="p-3 text-[#7C2D12]/30 hover:text-[#EA580C] hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-orange-100"
                                    >
                                        <Edit3 size={22} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(parent.id)}
                                        disabled={deletingId === parent.id}
                                        className="p-3 text-[#7C2D12]/30 hover:text-red-700 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-orange-100"
                                    >
                                        {deletingId === parent.id ? <Loader2 className="animate-spin" size={22} /> : <Trash2 size={22} />}
                                    </button>
                                </div>
                            </div>

                            {/* Children */}
                            <div className="p-8 bg-orange-50/5">
                                <h4 className="text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <ChevronDown size={14} className="text-primary" /> Sub-Collections
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categories.filter(c => c.parentId === parent.id).map(child => (
                                        <div key={child.id} className="p-6 bg-white border border-orange-100 rounded-[1.5rem] flex items-center justify-between group/child hover:border-primary/30 transition-all hover:shadow-md">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 overflow-hidden flex-shrink-0">
                                                    {child.image && <img src={child.image} alt={child.name} className="w-full h-full object-cover" />}
                                                </div>
                                                <span className="font-bold text-brand-maroon tracking-wide truncate max-w-[120px]">{child.name}</span>
                                                <span className="text-[9px] font-bold bg-orange-100 text-brand-maroon px-1.5 py-0.5 rounded">#{child.sortOrder ?? 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover/child:opacity-100 transition-opacity">
                                                <Link href={`/categories/${child.id}`} className="p-2 text-orange-900/40 hover:text-primary transition-colors">
                                                    <Edit3 size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(child.id)} className="p-2 text-orange-900/40 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <Link href={`/categories/new?parentId=${parent.id}`} className="p-6 border-2 border-dashed border-orange-100 rounded-[1.5rem] flex items-center justify-center gap-3 text-orange-900/30 hover:border-primary/50 hover:bg-orange-50 transition-all group/add">
                                        <Plus size={20} className="group-hover/add:rotate-90 transition-transform" />
                                        <span className="font-bold text-sm">Add Branch</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
