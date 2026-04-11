"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, fetchWithAuth } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Loader2,
    Filter,
    Package,
    ArrowRight
} from "lucide-react";
import { formatImageUrl } from "@/lib/imageHelper";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isRefineOpen, setIsRefineOpen] = useState(false);

    // Refinement States
    const [sortOrder, setSortOrder] = useState<"none" | "a-z" | "z-a">("none");
    const [mainCategory, setMainCategory] = useState<string>("all");
    const [subCategory, setSubCategory] = useState<string>("all");

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/products?limit=1000`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setProducts(data);
                } else if (data && Array.isArray(data.data)) {
                    setProducts(data.data);
                } else {
                    setProducts([]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        setDeletingId(id);
        try {
            const res = await fetchWithAuth(`${API_URL}/products/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            alert("Error deleting product");
        } finally {
            setDeletingId(null);
        }
    };

    // Filter Logic
    let processedProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMain = mainCategory === "all" ||
            p.category?.id === mainCategory ||
            p.category?.parentId === mainCategory;

        const matchesSub = subCategory === "all" || p.category?.id === subCategory;

        return matchesSearch && matchesMain && matchesSub;
    });

    // Sort Logic
    if (sortOrder === "a-z") {
        processedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "z-a") {
        processedProducts.sort((a, b) => b.name.localeCompare(a.name));
    }

    const mainCats = categories.filter(c => !c.parentId);
    const subCats = mainCategory !== "all"
        ? categories.filter(c => c.parentId === mainCategory)
        : [];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-brand-maroon tracking-tight">Products Catalog</h1>
                    <p className="text-orange-900/50 mt-2 font-medium italic">Oversee your exquisite collection of sweets ({products.length} items)</p>
                </div>
                <Link
                    href="/products/new"
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-orange-600/20 w-fit transform hover:scale-[1.02]"
                >
                    <Plus size={22} />
                    Create New Product
                </Link>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 overflow-hidden">
                {/* Table Header / Actions */}
                <div className="p-8 border-b border-orange-100 flex flex-col gap-6 bg-orange-100/10">
                    <div className="flex flex-col md:flex-row gap-6 justify-between">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C2D12]/40" size={20} />
                            <input
                                type="text"
                                placeholder="Find a product..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 bg-white border border-orange-200 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all text-sm font-bold placeholder:text-[#7C2D12]/30"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsRefineOpen(!isRefineOpen)}
                                className={`px-6 py-3.5 text-sm font-bold rounded-2xl flex items-center gap-2 transition-all shadow-sm border ${isRefineOpen ? 'bg-brand-maroon text-white border-brand-maroon focus:ring-2 focus:ring-brand-maroon/20' : 'text-brand-maroon bg-white border-orange-100 hover:bg-orange-50'}`}
                            >
                                <Filter size={18} className={isRefineOpen ? "text-orange-200" : "text-orange-400"} />
                                Refine View
                            </button>
                        </div>
                    </div>

                    {/* Refine Panel */}
                    {isRefineOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white border border-orange-100 rounded-[2rem] shadow-inner animate-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-orange-900/40 ml-1">Sort Alphabet</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl text-sm font-bold text-brand-maroon outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="none">Default Order</option>
                                    <option value="a-z">Name (A to Z)</option>
                                    <option value="z-a">Name (Z to A)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-orange-900/40 ml-1">Main Category</label>
                                <select
                                    value={mainCategory}
                                    onChange={(e) => {
                                        setMainCategory(e.target.value);
                                        setSubCategory("all");
                                    }}
                                    className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl text-sm font-bold text-brand-maroon outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">All Specialties</option>
                                    {mainCats.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-orange-900/40 ml-1">Sub Category</label>
                                <select
                                    value={subCategory}
                                    onChange={(e) => setSubCategory(e.target.value)}
                                    disabled={mainCategory === "all"}
                                    className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl text-sm font-bold text-brand-maroon outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="all">Entire Section</option>
                                    {subCats.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3 flex justify-end">
                                <button
                                    onClick={() => {
                                        setSortOrder("none");
                                        setMainCategory("all");
                                        setSubCategory("all");
                                        setSearchTerm("");
                                    }}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors underline underline-offset-4"
                                >
                                    Reset Discovery Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Product Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-6 text-orange-900/20">
                            <Loader2 className="animate-spin text-primary" size={48} />
                            <p className="font-bold text-lg italic outfit tracking-wide">Handpicking the sweets...</p>
                        </div>
                    ) : processedProducts.length === 0 ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-6 text-orange-900/20">
                            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center">
                                <Package size={48} />
                            </div>
                            <p className="font-bold text-lg italic outfit tracking-wide text-brand-maroon/30">Your catalog is currently empty</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-orange-50/30">
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Delicacy Info</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Category Path</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Price Card</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Highlights</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em] text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-50">
                                {processedProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-orange-100/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-orange-50 overflow-hidden flex-shrink-0 border border-orange-200 group-hover:scale-105 transition-transform">
                                                    {product.image ? (
                                                        <img src={formatImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-orange-200"><Package size={24} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#7C2D12] text-lg outfit">{product.name}</p>
                                                    <p className="text-[10px] text-[#7C2D12]/40 font-black uppercase tracking-widest mt-0.5 font-mono">{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-1.5 bg-brand-maroon text-orange-50 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                {product.category?.name || "Main Collection"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-base text-brand-maroon">
                                            {(() => {
                                                const defaultVariant = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
                                                const price = product.price || defaultVariant?.price || 0;
                                                return formatPrice(price);
                                            })()}
                                            <p className="text-[10px] text-orange-900/40 font-bold italic normal-case tracking-normal">
                                                {product.weight || product.variants?.find((v: any) => v.isDefault)?.weight || product.variants?.[0]?.weight || "Standard Pack"}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {product.isBestSeller && (
                                                    <span className="text-[9px] bg-yellow-400/20 text-yellow-700 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider border border-yellow-400/30">
                                                        Best Seller
                                                    </span>
                                                )}
                                                {product.isNewLaunch && (
                                                    <span className="text-[9px] bg-orange-500/20 text-orange-700 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider border border-orange-500/30">
                                                        New Arrival
                                                    </span>
                                                )}
                                                {product.isSoldOut && (
                                                    <span className="text-[9px] bg-red-600 text-white px-2.5 py-1 rounded-lg font-black uppercase tracking-wider shadow-sm">
                                                        Sold Out
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="p-3 text-[#7C2D14]/40 hover:text-[#EA580C] hover:bg-orange-100 rounded-2xl transition-all shadow-sm"
                                                >
                                                    <Edit3 size={20} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deletingId === product.id}
                                                    className="p-3 text-[#7C2D14]/40 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all shadow-sm"
                                                >
                                                    {deletingId === product.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
