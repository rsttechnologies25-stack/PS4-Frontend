"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, fetchWithAuth } from "@/lib/api";
import {
    Plus,
    MapPin,
    Phone,
    Edit3,
    Trash2,
    Loader2,
    Building2,
    Navigation,
    ExternalLink
} from "lucide-react";

export default function BranchesPage() {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await fetch(`${API_URL}/branches`);
            if (res.ok) {
                setBranches(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch branches", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this branch from the locator?")) return;

        setDeletingId(id);
        try {
            const res = await fetchWithAuth(`${API_URL}/branches/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setBranches(branches.filter(b => b.id !== id));
            } else {
                alert("Failed to delete branch");
            }
        } catch (error) {
            alert("Error deleting branch");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-brand-maroon tracking-tight">Store Locations</h1>
                    <p className="text-orange-900/50 mt-2 font-medium italic">Manage your physical presence across the region ({branches.length} branches)</p>
                </div>
                <Link
                    href="/branches/new"
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-orange-600/20 w-fit transform hover:scale-[1.02]"
                >
                    <Plus size={22} />
                    Add New Branch
                </Link>
            </div>

            {loading ? (
                <div className="bg-white p-32 rounded-[2.5rem] border border-orange-100/50 shadow-xl shadow-orange-950/5 flex flex-col items-center justify-center gap-6">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <p className="font-bold text-lg italic outfit tracking-wide text-orange-900/20">Pinning the locations...</p>
                </div>
            ) : branches.length === 0 ? (
                <div className="bg-white p-32 rounded-[2.5rem] border border-orange-100/50 shadow-xl shadow-orange-950/5 flex flex-col items-center justify-center gap-6 text-orange-900/20">
                    <MapPin size={64} className="text-orange-200" />
                    <p className="font-bold text-lg italic outfit tracking-wide text-brand-maroon/30">No branches added yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {branches.map((branch) => (
                        <div key={branch.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 overflow-hidden flex flex-col group relative">
                            {/* Actions Overlay */}
                            <div className="absolute top-6 right-6 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/branches/${branch.id}`}
                                    className="p-3 bg-white/90 backdrop-blur-md text-brand-maroon hover:text-primary rounded-2xl shadow-lg transition-all"
                                >
                                    <Edit3 size={18} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(branch.id)}
                                    disabled={deletingId === branch.id}
                                    className="p-3 bg-white/90 backdrop-blur-md text-brand-maroon hover:text-red-600 rounded-2xl shadow-lg transition-all"
                                >
                                    {deletingId === branch.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                </button>
                            </div>

                            <div className="aspect-video relative overflow-hidden">
                                {branch.image ? (
                                    <img src={branch.image} alt={branch.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-200">
                                        <Building2 size={48} />
                                    </div>
                                )}
                                {branch.isHeadOffice && (
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-brand-maroon text-orange-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/20">
                                            Head Office
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-[#7C2D12] mb-1 outfit">{branch.name}</h3>
                                <p className="text-sm font-black text-[#EA580C] uppercase tracking-[0.2em] mb-6">{branch.city}</p>

                                <div className="space-y-4 mt-auto">
                                    <div className="flex items-start gap-4 text-[#7C2D12]/80">
                                        <div className="mt-1 p-2 bg-orange-100 rounded-xl text-[#EA580C]">
                                            <Navigation size={14} />
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed">{branch.address}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-[#7C2D12]/80">
                                        <div className="p-2 bg-orange-100 rounded-xl text-[#EA580C]">
                                            <Phone size={14} />
                                        </div>
                                        <p className="text-sm font-black">{branch.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
