"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Save,
    X,
    Upload,
    Image as ImageIcon,
    Calendar,
    Link as LinkIcon,
    Clock,
} from "lucide-react";
import { formatImageUrl } from "@/lib/imageHelper";

import { API_URL, fetchWithAuth } from "@/lib/api";

interface Product {
    id: string;
    name: string;
    slug: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface HeroBanner {
    id: string;
    image: string;
    title: string | null;
    subtitle: string | null;
    ctaText: string;
    linkType: string;
    productId: string | null;
    categoryId: string | null;
    customUrl: string | null;
    isActive: boolean;
    sortOrder: number;
    slideInterval: number;
    startDate: string | null;
    endDate: string | null;
    productName?: string | null;
    categoryName?: string | null;
}

interface FormData {
    title: string;
    subtitle: string;
    ctaText: string;
    linkType: string;
    productId: string;
    categoryId: string;
    customUrl: string;
    sortOrder: string;
    slideInterval: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

const emptyForm: FormData = {
    title: "",
    subtitle: "",
    ctaText: "SHOP NOW",
    linkType: "product",
    productId: "",
    categoryId: "",
    customUrl: "",
    sortOrder: "0",
    slideInterval: "6",
    startDate: "",
    endDate: "",
    isActive: true,
};

export default function HeroBannersPage() {
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchBanners = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/hero-banners`);
            const data = await res.json();
            setBanners(data);
        } catch (err) {
            console.error("Failed to fetch banners:", err);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/products`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : data.products || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/categories`);
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
        fetchProducts();
        fetchCategories();
    }, [fetchBanners, fetchProducts, fetchCategories]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (banner: HeroBanner) => {
        setEditingId(banner.id);
        setForm({
            title: banner.title || "",
            subtitle: banner.subtitle || "",
            ctaText: banner.ctaText,
            linkType: banner.linkType,
            productId: banner.productId || "",
            categoryId: banner.categoryId || "",
            customUrl: banner.customUrl || "",
            sortOrder: String(banner.sortOrder),
            slideInterval: String(banner.slideInterval),
            startDate: banner.startDate ? banner.startDate.slice(0, 16) : "",
            endDate: banner.endDate ? banner.endDate.slice(0, 16) : "",
            isActive: banner.isActive,
        });
        setImagePreview(formatImageUrl(banner.image));
        setImageFile(null);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!editingId && !imageFile) {
            alert("Please select an image for the banner.");
            return;
        }

        setSaving(true);
        const formData = new window.FormData();
        if (imageFile) formData.append("image", imageFile);
        formData.append("title", form.title);
        formData.append("subtitle", form.subtitle);
        formData.append("ctaText", form.ctaText);
        formData.append("linkType", form.linkType);
        formData.append("productId", form.productId);
        formData.append("categoryId", form.categoryId);
        formData.append("customUrl", form.customUrl);
        formData.append("sortOrder", form.sortOrder);
        formData.append("slideInterval", form.slideInterval);
        formData.append("startDate", form.startDate);
        formData.append("endDate", form.endDate);
        formData.append("isActive", String(form.isActive));

        try {
            const url = editingId
                ? `${API_URL}/hero-banners/${editingId}`
                : `${API_URL}/hero-banners`;
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, { method, [editingId ? 'headers' : '']: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }, body: formData });
            if (res.ok) {
                resetForm();
                fetchBanners();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save banner");
            }
        } catch (err) {
            alert("Failed to save banner");
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        try {
            const token = localStorage.getItem("admin_token");
            await fetch(`${API_URL}/hero-banners/${id}`, { 
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchBanners();
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await fetch(`${API_URL}/hero-banners/${id}/toggle`, { method: "PATCH" });
            fetchBanners();
        } catch (err) {
            console.error("Failed to toggle:", err);
        }
    };

    const getLinkedName = (banner: HeroBanner) => {
        if (banner.linkType === "product" && banner.productName) return `Product: ${banner.productName}`;
        if (banner.linkType === "category" && banner.categoryName) return `Category: ${banner.categoryName}`;
        if (banner.linkType === "custom" && banner.customUrl) return `URL: ${banner.customUrl}`;
        return "No link";
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-brand-maroon tracking-tight">Hero Banners</h1>
                    <p className="text-orange-900/50 mt-2 font-medium italic">
                        Manage the hero carousel banners on the homepage
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-orange-600/20 w-fit transform hover:scale-[1.02]"
                >
                    <Plus size={22} /> Add Banner
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">
                            {editingId ? "Edit Banner" : "New Banner"}
                        </h2>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Banner Image *
                        </label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-orange transition-colors cursor-pointer relative"
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-48 mx-auto rounded-lg object-cover"
                                    />
                                    <button
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload size={40} className="mx-auto text-gray-400" />
                                    <p className="text-gray-500 text-sm">
                                        Drag & drop an image or click to browse
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                        Recommended: 1920×1080px, Max 10MB (JPG, PNG, WebP)
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Title <span className="text-gray-400 font-normal">(leave blank to auto-pull from product)</span>
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Premium Kaju Katli"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Subtitle <span className="text-gray-400 font-normal">(leave blank to auto-pull)</span>
                            </label>
                            <input
                                type="text"
                                value={form.subtitle}
                                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                placeholder="e.g. Exquisite Cashew Delight..."
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* CTA Text */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            CTA Button Text
                        </label>
                        <input
                            type="text"
                            value={form.ctaText}
                            onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                            placeholder="SHOP NOW"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none max-w-xs"
                        />
                    </div>

                    {/* Link Type */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700">
                            <LinkIcon size={14} className="inline mr-1" /> Link To
                        </label>
                        <div className="flex gap-4">
                            {["product", "category", "custom"].map((type) => (
                                <label
                                    key={type}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-semibold capitalize ${form.linkType === type
                                        ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="linkType"
                                        value={type}
                                        checked={form.linkType === type}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            setForm({
                                                ...form,
                                                linkType: newType,
                                                productId: newType === "product" ? form.productId : "",
                                                categoryId: newType === "category" ? form.categoryId : "",
                                                customUrl: newType === "custom" ? form.customUrl : "",
                                            });
                                        }}
                                        className="hidden"
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>

                        {form.linkType === "product" && (
                            <select
                                value={form.productId}
                                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            >
                                <option value="">Select a product...</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {form.linkType === "category" && (
                            <select
                                value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            >
                                <option value="">Select a category...</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {form.linkType === "custom" && (
                            <input
                                type="text"
                                value={form.customUrl}
                                onChange={(e) => setForm({ ...form, customUrl: e.target.value })}
                                placeholder="https://example.com or /path"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            />
                        )}
                    </div>

                    {/* Slide Interval & Sort Order */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                <Clock size={14} className="inline mr-1" /> Slide Duration (seconds)
                            </label>
                            <input
                                type="number"
                                min="2"
                                max="30"
                                value={form.slideInterval}
                                onChange={(e) => setForm({ ...form, slideInterval: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.sortOrder}
                                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-5 h-5 text-brand-orange rounded border-gray-300 focus:ring-brand-orange"
                                />
                                <span className="text-sm font-bold text-gray-700">Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Scheduling */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                <Calendar size={14} className="inline mr-1" /> Start Date{" "}
                                <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                <Calendar size={14} className="inline mr-1" /> End Date{" "}
                                <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg disabled:opacity-50"
                        >
                            <Save size={16} /> {saving ? "Saving..." : "Save Banner"}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Banner List */}
            <div className="space-y-4">
                {banners.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 p-16 text-center">
                        <ImageIcon size={48} className="mx-auto text-orange-200 mb-4" />
                        <p className="text-brand-maroon text-lg font-bold italic">No hero banners yet</p>
                        <p className="text-orange-900/30 text-sm mt-1">
                            Click "Add Banner" to create your first hero carousel slide
                        </p>
                    </div>
                ) : (
                    banners.map((banner) => (
                        <div
                            key={banner.id}
                            className={`bg-white rounded-[2.5rem] shadow-xl shadow-orange-950/5 border transition-all ${banner.isActive ? "border-orange-100/50" : "border-gray-200 opacity-60"
                                }`}
                        >
                            <div className="flex items-center gap-6 p-5">
                                {/* Image Preview */}
                                <div className="w-48 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                    <img
                                        src={formatImageUrl(banner.image)}
                                        alt={banner.title || "Banner"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 text-lg truncate">
                                        {banner.title || (
                                            <span className="text-gray-400 italic">Auto-pull from {banner.linkType}</span>
                                        )}
                                    </h3>
                                    {banner.subtitle && (
                                        <p className="text-gray-500 text-sm mt-0.5 truncate">{banner.subtitle}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                        <span className="bg-gray-100 px-2.5 py-1 rounded-md font-semibold">
                                            <LinkIcon size={10} className="inline mr-1" />
                                            {getLinkedName(banner)}
                                        </span>
                                        <span className="bg-gray-100 px-2.5 py-1 rounded-md font-semibold">
                                            CTA: {banner.ctaText}
                                        </span>
                                        <span className="bg-gray-100 px-2.5 py-1 rounded-md font-semibold">
                                            {banner.slideInterval}s
                                        </span>
                                        <span className="bg-gray-100 px-2.5 py-1 rounded-md font-semibold">
                                            Order: {banner.sortOrder}
                                        </span>
                                    </div>
                                    {(banner.startDate || banner.endDate) && (
                                        <div className="flex items-center gap-2 mt-1.5 text-xs text-blue-500">
                                            <Calendar size={10} />
                                            {banner.startDate && <span>From: {new Date(banner.startDate).toLocaleDateString()}</span>}
                                            {banner.endDate && <span>To: {new Date(banner.endDate).toLocaleDateString()}</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggle(banner.id)}
                                        className={`p-2.5 rounded-xl transition-all ${banner.isActive
                                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                            }`}
                                        title={banner.isActive ? "Deactivate" : "Activate"}
                                    >
                                        {banner.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="p-2.5 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"
                                        title="Edit"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
