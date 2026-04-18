"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, fetchWithAuth } from "@/lib/api";
import {
    Save,
    X,
    Loader2,
    Upload,
    Link as LinkIcon,
    Layers,
    ChevronLeft,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryFormProps {
    categoryId?: string;
    initialData?: any;
}

export default function CategoryForm({ categoryId, initialData }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!categoryId && !initialData);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        deliveryInfo: "",
        image: "",
        parentId: "",
        sortOrder: 0,
    });

    useEffect(() => {
        fetchCategories();
        if (initialData) {
            populateForm(initialData);
        } else if (categoryId) {
            fetchCategory();
        }
    }, [categoryId, initialData]);

    const fetchCategories = async () => {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
            setCategories(await res.json());
        }
    };

    const fetchCategory = async () => {
        try {
            // Reverted to streamlined polymorphic endpoint
            const res = await fetch(`${API_URL}/categories/${categoryId}`);
            if (res.ok) {
                const data = await res.json();
                populateForm(data);
            }
        } catch (error) {
            console.error("Error fetching category:", error);
        } finally {
            setFetching(false);
        }
    };

    const populateForm = (data: any) => {
        setFormData({
            name: data.name || "",
            slug: data.slug || "",
            deliveryInfo: data.deliveryInfo || "",
            image: data.image || "",
            parentId: data.parentId || "",
            sortOrder: data.sortOrder || 0,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = categoryId ? `${API_URL}/categories/${categoryId}` : `${API_URL}/categories`;
            const method = categoryId ? "PUT" : "POST";

            const res = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/categories");
                router.refresh();
            } else {
                alert("Failed to save category");
            }
        } catch (error) {
            alert("Error saving category");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 bg-white rounded-[2.5rem] shadow-xl border border-orange-100">
                <Loader2 className="animate-spin text-[#EA580C]" size={48} />
                <p className="font-bold text-[#7C2D12]">Loading category data...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-3 bg-white border border-orange-200 rounded-2xl text-[#7C2D12]/60 hover:text-[#EA580C] transition-all shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#7C2D12] tracking-tight">
                            {categoryId ? "Edit Category" : "New Collection"}
                        </h1>
                        <p className="text-[#7C2D12]/60 font-bold italic mt-1">
                            {categoryId ? `Modifying ${formData.name}` : "Define a new section for your sweet inventory"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3.5 bg-white border border-orange-200 text-[#7C2D12] font-bold rounded-2xl hover:bg-orange-50 transition-colors shadow-sm"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 bg-[#EA580C] text-white font-bold rounded-2xl hover:bg-[#C2410C] transition-all transform hover:scale-[1.02] shadow-xl shadow-orange-600/20 flex items-center gap-3 disabled:opacity-70 disabled:transform-none"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {categoryId ? "Update Section" : "Create Section"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 space-y-8">
                        <h3 className="text-xl font-bold text-[#7C2D12] border-b border-orange-100 pb-6 flex items-center gap-3">
                            <Layers className="text-[#EA580C]" /> Category Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Section Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20"
                                    placeholder="e.g. Traditional Gheee Sweets"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">URL Identifier</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-mono text-sm text-[#EA580C] placeholder:text-[#7C2D12]/20"
                                    placeholder="ghee-sweets"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Display Order</label>
                            <input
                                type="number"
                                value={formData.sortOrder}
                                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                                className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20"
                                placeholder="0"
                                min={0}
                            />
                            <p className="text-xs text-[#7C2D12]/40 ml-1">Lower numbers appear first (e.g., 1 is before 5).</p>
                        </div>



                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Delivery Information</label>
                            <textarea
                                rows={4}
                                value={formData.deliveryInfo}
                                onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
                                className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20 resize-none"
                                placeholder="e.g. Chennai: Next-day delivery before 7PM. Rest of India: 2-4 business days."
                            />
                            <p className="text-xs text-[#7C2D12]/40 ml-1">Products in this category inherit this delivery info unless overridden at product level.</p>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 space-y-6">
                        <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Hierarchy Placement</label>
                        <div className="relative group">
                            <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7C2D12]/30 group-focus-within:text-[#EA580C] transition-colors" size={20} />
                            <select
                                value={formData.parentId}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                className="w-full pl-14 pr-6 py-5 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold appearance-none cursor-pointer text-[#7C2D12]"
                            >
                                <option value="">Root Level Category</option>
                                {categories.filter(c => c.id !== categoryId).map((cat) => (
                                    <option key={cat.id} value={cat.id}>Sub-category of: {cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 space-y-6">
                        <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Cover Art</label>

                        <div className="relative aspect-square rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50/30 flex items-center justify-center overflow-hidden group">
                            {formData.image ? (
                                <>
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: "" })}
                                        className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-[#7C2D12]/20">
                                    <Upload size={40} className="mb-2" />
                                    <span className="text-xs font-bold">Square Image URL</span>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C2D12]/30 group-focus-within:text-[#EA580C] transition-colors" size={18} />
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-orange-50/20 border border-orange-100 rounded-xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all text-xs font-bold"
                                placeholder="https://image-url.com/category-hero.jpg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
