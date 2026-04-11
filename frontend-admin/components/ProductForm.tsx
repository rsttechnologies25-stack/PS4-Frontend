"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_URL, fetchWithAuth } from "@/lib/api";
import {
    Save,
    X,
    Loader2,
    Upload,
    Check,
    ChevronLeft,
    Package,
    IndianRupee,
    Type,
    Link as LinkIcon,
    Layers,
    Sparkles,
    Plus,
    Trash2,
    Image as ImageIcon,
    GripVertical,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatImageUrl } from "@/lib/imageHelper";

interface Variant {
    weight: string;
    price: string;
    stock: string;
    isDefault: boolean;
}

interface ProductImageItem {
    id?: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
}

interface ProductFormProps {
    productId?: string;
    initialData?: any;
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!productId && !initialData);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        deliveryInfo: "",
        image: "",
        categoryId: "",
        isBestSeller: false,
        isNewLaunch: false,
        isSoldOut: false,
    });
    const [variants, setVariants] = useState<Variant[]>([
        { weight: "", price: "", stock: "100", isDefault: true }
    ]);
    const [images, setImages] = useState<ProductImageItem[]>([]);
    const [urlInput, setUrlInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCategories();
        if (initialData) {
            populateForm(initialData);
        } else if (productId) {
            fetchProduct();
        }
    }, [productId, initialData]);

    const fetchCategories = async () => {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
            setCategories(await res.json());
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await fetch(`${API_URL}/products/${productId}`);
            if (res.ok) {
                const data = await res.json();
                populateForm(data);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setFetching(false);
        }
    };

    const populateForm = (data: any) => {
        setFormData({
            name: data.name || "",
            slug: data.slug || "",
            description: data.description || "",
            deliveryInfo: data.deliveryInfo || "",
            image: data.image || "",
            categoryId: data.categoryId || "",
            isBestSeller: data.isBestSeller || false,
            isNewLaunch: data.isNewLaunch || false,
            isSoldOut: data.isSoldOut || false,
        });

        // Populate variants
        if (data.variants && data.variants.length > 0) {
            setVariants(
                data.variants.map((v: any) => ({
                    weight: v.weight || "",
                    price: v.price?.toString() || "",
                    stock: v.stock?.toString() || "0",
                    isDefault: v.isDefault || false,
                }))
            );
        }

        // Populate images
        if (data.images && data.images.length > 0) {
            setImages(
                data.images.map((img: any) => ({
                    id: img.id,
                    url: img.url,
                    altText: img.altText || "",
                    isPrimary: img.isPrimary || false,
                }))
            );
        } else if (data.image) {
            // Fallback: use the single image field
            setImages([{ url: data.image, isPrimary: true }]);
        }
    };

    // ---- Variant handlers ----
    const addVariant = () => {
        setVariants([...variants, { weight: "", price: "", stock: "100", isDefault: false }]);
    };

    const removeVariant = (index: number) => {
        if (variants.length <= 1) return;
        const updated = variants.filter((_, i) => i !== index);
        if (!updated.some(v => v.isDefault)) {
            updated[0].isDefault = true;
        }
        setVariants(updated);
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | boolean) => {
        const updated = [...variants];
        if (field === "isDefault" && value === true) {
            updated.forEach((v, i) => (v.isDefault = i === index));
        } else {
            (updated[index] as any)[field] = value;
        }
        setVariants(updated);
    };

    // ---- Image handlers ----
    const addImageByUrl = () => {
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        // Check for duplicates
        if (images.some(img => img.url === trimmed)) {
            alert("This image URL is already added.");
            return;
        }
        setImages([...images, { url: trimmed, isPrimary: images.length === 0 }]);
        setUrlInput("");
    };

    const uploadFiles = async (files: FileList | File[]) => {
        setUploading(true);
        try {
            const fileArray = Array.from(files);
            for (const file of fileArray) {
                const formDataUpload = new FormData();
                formDataUpload.append("image", file);

                const res = await fetchWithAuth(`${API_URL}/upload`, {
                    method: "POST",
                    body: formDataUpload,
                    isFormData: true,
                });

                if (res.ok) {
                    const data = await res.json();
                    // Construct full URL for the uploaded image
                    const fullUrl = data.url.startsWith("http") ? data.url : `${API_URL.replace('/api', '')}${data.url}`;
                    // Check for duplicates
                    if (!images.some(img => img.url === fullUrl)) {
                        setImages(prev => [...prev, { url: fullUrl, isPrimary: prev.length === 0 }]);
                    }
                } else {
                    alert(`Failed to upload ${file.name}`);
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading image(s)");
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
        }
        // Reset input so re-selecting the same file works
        e.target.value = "";
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files);
        }
    }, [images]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index);
        // If removed the primary, make the first one primary
        if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
            updated[0].isPrimary = true;
        }
        setImages(updated);
    };

    const setPrimaryImage = (index: number) => {
        const updated = images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }));
        setImages(updated);
    };

    const moveImage = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= images.length) return;
        const updated = [...images];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setImages(updated);
    };

    // ---- Submit ----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validVariants = variants.filter(v => v.weight && v.price);
        if (validVariants.length === 0) {
            alert("Please add at least one size variant with weight and price.");
            return;
        }

        if (images.length === 0) {
            alert("Please add at least one product image.");
            return;
        }

        setLoading(true);

        try {
            const url = productId ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
            const method = productId ? "PUT" : "POST";

            const payload = {
                ...formData,
                isSoldOut: formData.isSoldOut,
                image: images.find(img => img.isPrimary)?.url || images[0]?.url || formData.image,
                variants: validVariants.map(v => ({
                    weight: v.weight,
                    price: v.price,
                    stock: v.stock,
                    isDefault: v.isDefault,
                })),
                images: images.map((img, idx) => ({
                    url: img.url,
                    altText: img.altText || "",
                    isPrimary: img.isPrimary,
                    sortOrder: idx,
                }))
            };

            const res = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/products");
                router.refresh();
            } else {
                alert("Failed to save product");
            }
        } catch (error) {
            alert("Error saving product");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 bg-white rounded-[2.5rem] shadow-xl border border-orange-100">
                <Loader2 className="animate-spin text-[#EA580C]" size={48} />
                <p className="font-bold text-[#7C2D12]">Loading product data...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Top Header */}
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
                            {productId ? "Edit Delicacy" : "Create New Delicacy"}
                        </h1>
                        <p className="text-[#7C2D12]/60 font-bold italic mt-1">
                            {productId ? `Refining ${formData.name}` : "Adding a new traditional sweet to the collection"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3.5 bg-white border border-orange-200 text-[#7C2D12] font-bold rounded-2xl hover:bg-orange-50 transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 bg-[#EA580C] text-white font-bold rounded-2xl hover:bg-[#C2410C] transition-all transform hover:scale-[1.02] shadow-xl shadow-orange-600/20 flex items-center gap-3 disabled:opacity-70 disabled:transform-none"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {productId ? "Save Changes" : "Publish Product"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 space-y-8">
                        <h3 className="text-xl font-bold text-[#7C2D12] border-b border-orange-100 pb-6 flex items-center gap-3">
                            <Type className="text-[#EA580C]" /> General Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20"
                                    placeholder="e.g. Traditional Mysore Pak"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">URL Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-mono text-sm text-[#EA580C] placeholder:text-[#7C2D12]/20"
                                    placeholder="mysore-pak"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Delicacy Description</label>
                            <textarea
                                required
                                rows={5}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20 resize-none"
                                placeholder="Tell the story of this delicacy..."
                            />
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
                            <p className="text-xs text-[#7C2D12]/40 ml-1">Leave empty to use the category-level delivery info.</p>
                        </div>
                    </div>

                    {/* =================== PRODUCT IMAGES SECTION =================== */}
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 space-y-8">
                        <div className="flex items-center justify-between border-b border-orange-100 pb-6">
                            <h3 className="text-xl font-bold text-[#7C2D12] flex items-center gap-3">
                                <ImageIcon className="text-[#EA580C]" /> Product Images
                            </h3>
                            <span className="text-sm font-bold text-[#7C2D12]/40">
                                {images.length} image{images.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {/* Drag-and-drop zone + file browse */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
                                dragOver
                                    ? "border-[#EA580C] bg-orange-50 scale-[1.01]"
                                    : "border-orange-200 bg-orange-50/30 hover:border-[#EA580C]/50 hover:bg-orange-50/50"
                            )}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            {uploading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-[#EA580C]" size={36} />
                                    <p className="font-bold text-[#7C2D12]/60">Uploading...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-orange-100/50 rounded-2xl">
                                        <Upload className="text-[#EA580C]" size={32} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#7C2D12]">
                                            Drag & drop images here or <span className="text-[#EA580C] underline">browse</span>
                                        </p>
                                        <p className="text-xs text-[#7C2D12]/40 mt-1">
                                            Supports JPEG, PNG, WebP, GIF • Max 10MB each
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* URL Input */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C2D12]/30 group-focus-within:text-[#EA580C] transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageByUrl(); } }}
                                    className="w-full pl-11 pr-4 py-3.5 bg-orange-50/20 border border-orange-100 rounded-xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all text-sm font-bold placeholder:text-[#7C2D12]/20"
                                    placeholder="Or paste an image URL here..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addImageByUrl}
                                disabled={!urlInput.trim()}
                                className={cn(
                                    "px-5 py-3.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2",
                                    urlInput.trim()
                                        ? "bg-[#EA580C] text-white hover:bg-[#C2410C] shadow-lg shadow-orange-600/20"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                <Plus size={16} /> Add
                            </button>
                        </div>

                        {/* Image Gallery */}
                        {images.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-widest">
                                    Image Gallery — click ★ to set primary
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map((img, index) => (
                                        <div
                                            key={`${img.url}-${index}`}
                                            className={cn(
                                                "group relative rounded-2xl border-2 overflow-hidden transition-all",
                                                img.isPrimary
                                                    ? "border-[#EA580C] ring-2 ring-[#EA580C]/20"
                                                    : "border-orange-100 hover:border-orange-300"
                                            )}
                                        >
                                            <div className="aspect-square bg-orange-50/30">
                                                <img
                                                    src={formatImageUrl(img.url)}
                                                    alt={img.altText || `Product image ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/placeholder.png";
                                                    }}
                                                />
                                            </div>

                                            {/* Primary badge */}
                                            {img.isPrimary && (
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-[#EA580C] text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-lg">
                                                    Primary
                                                </div>
                                            )}

                                            {/* Overlay controls */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                {/* Set as primary */}
                                                {!img.isPrimary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPrimaryImage(index)}
                                                        title="Set as primary"
                                                        className="p-2 bg-white/90 text-yellow-600 rounded-xl hover:bg-yellow-50 transition-all shadow-lg"
                                                    >
                                                        <span className="text-lg">★</span>
                                                    </button>
                                                )}

                                                {/* Move up */}
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveImage(index, "up")}
                                                        title="Move left"
                                                        className="p-2 bg-white/90 text-[#7C2D12] rounded-xl hover:bg-orange-50 transition-all shadow-lg text-sm font-bold"
                                                    >
                                                        ←
                                                    </button>
                                                )}

                                                {/* Move down */}
                                                {index < images.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveImage(index, "down")}
                                                        title="Move right"
                                                        className="p-2 bg-white/90 text-[#7C2D12] rounded-xl hover:bg-orange-50 transition-all shadow-lg text-sm font-bold"
                                                    >
                                                        →
                                                    </button>
                                                )}

                                                {/* Remove */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    title="Remove image"
                                                    className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Image URL truncated */}
                                            <div className="px-3 py-2 bg-white border-t border-orange-100">
                                                <p className="text-[10px] text-[#7C2D12]/40 truncate font-mono">
                                                    {img.url}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Size Variants Section */}
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 space-y-8">
                        <div className="flex items-center justify-between border-b border-orange-100 pb-6">
                            <h3 className="text-xl font-bold text-[#7C2D12] flex items-center gap-3">
                                <Package className="text-[#EA580C]" /> Size Variants & Pricing
                            </h3>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] text-white font-bold text-sm rounded-xl hover:bg-[#C2410C] transition-all shadow-lg shadow-orange-600/20"
                            >
                                <Plus size={16} /> Add Size
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-4 px-2">
                                <div className="col-span-3">
                                    <span className="text-[10px] font-black text-[#7C2D12]/40 uppercase tracking-widest">Weight</span>
                                </div>
                                <div className="col-span-3">
                                    <span className="text-[10px] font-black text-[#7C2D12]/40 uppercase tracking-widest">Price (₹)</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] font-black text-[#7C2D12]/40 uppercase tracking-widest">Stock</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] font-black text-[#7C2D12]/40 uppercase tracking-widest">Default</span>
                                </div>
                                <div className="col-span-2"></div>
                            </div>

                            {/* Variant Rows */}
                            {variants.map((variant, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "grid grid-cols-12 gap-4 p-4 rounded-2xl border-2 transition-all",
                                        variant.isDefault
                                            ? "bg-orange-50/50 border-[#EA580C]/30"
                                            : "bg-gray-50/50 border-gray-100 hover:border-orange-200"
                                    )}
                                >
                                    <div className="col-span-3">
                                        <input
                                            type="text"
                                            required
                                            value={variant.weight}
                                            onChange={(e) => updateVariant(index, "weight", e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-orange-100 rounded-xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold text-sm placeholder:text-[#7C2D12]/20"
                                            placeholder="e.g. 250g"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C2D12]/30" size={14} />
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, "price", e.target.value)}
                                                className="w-full pl-8 pr-3 py-3 bg-white border border-orange-100 rounded-xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => updateVariant(index, "stock", e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-orange-100 rounded-xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => updateVariant(index, "isDefault", true)}
                                            className={cn(
                                                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                                variant.isDefault
                                                    ? "bg-[#EA580C] border-[#EA580C] text-white shadow-lg shadow-orange-600/30"
                                                    : "bg-white border-gray-200 text-transparent hover:border-[#EA580C]/50"
                                            )}
                                        >
                                            <Check size={14} />
                                        </button>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            disabled={variants.length <= 1}
                                            className={cn(
                                                "p-2 rounded-xl transition-all",
                                                variants.length <= 1
                                                    ? "text-gray-200 cursor-not-allowed"
                                                    : "text-red-400 hover:text-red-600 hover:bg-red-50"
                                            )}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-[#7C2D12]/40 italic">
                            The default size will be pre-selected for customers and displayed on product cards.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 space-y-8">
                        <h3 className="text-xl font-bold text-[#7C2D12] border-b border-orange-100 pb-6 flex items-center gap-3">
                            <Sparkles className="text-[#EA580C]" /> Special Highlights
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isBestSeller: !formData.isBestSeller })}
                                className={cn(
                                    "flex items-center justify-between p-6 rounded-2xl border-2 transition-all group",
                                    formData.isBestSeller
                                        ? "bg-yellow-50 border-yellow-400 text-yellow-900 shadow-sm"
                                        : "bg-white border-orange-100 text-[#7C2D12]/50 hover:bg-orange-50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2 rounded-xl transition-colors", formData.isBestSeller ? "bg-yellow-400 text-white" : "bg-orange-100 text-orange-400")}>
                                        <Check size={20} />
                                    </div>
                                    <span className="font-black">Best Seller</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isNewLaunch: !formData.isNewLaunch })}
                                className={cn(
                                    "flex items-center justify-between p-6 rounded-2xl border-2 transition-all group",
                                    formData.isNewLaunch
                                        ? "bg-orange-50 border-[#EA580C] text-[#EA580C] shadow-sm"
                                        : "bg-white border-orange-100 text-[#7C2D12]/50 hover:bg-orange-100/50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2 rounded-xl transition-colors", formData.isNewLaunch ? "bg-[#EA580C] text-white" : "bg-orange-100 text-orange-400")}>
                                        <Check size={20} />
                                    </div>
                                    <span className="font-black">New Arrival</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isSoldOut: !formData.isSoldOut })}
                                className={cn(
                                    "flex items-center justify-between p-6 rounded-2xl border-2 transition-all group",
                                    formData.isSoldOut
                                        ? "bg-red-50 border-red-500 text-red-700 shadow-sm"
                                        : "bg-white border-orange-100 text-[#7C2D12]/50 hover:bg-red-50/50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2 rounded-xl transition-colors", formData.isSoldOut ? "bg-red-500 text-white" : "bg-orange-100 text-orange-400")}>
                                        <X size={20} />
                                    </div>
                                    <span className="font-black">Mark Sold Out</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-10">
                    {/* Primary Image Preview */}
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 space-y-6">
                        <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Primary Image Preview</label>

                        <div className="relative aspect-square rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50/30 flex items-center justify-center overflow-hidden group">
                            {(images.find(img => img.isPrimary)?.url || images[0]?.url) ? (
                                <img
                                    src={formatImageUrl(images.find(img => img.isPrimary)?.url || images[0]?.url)}
                                    alt="Primary Preview"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-[#7C2D12]/20">
                                    <ImageIcon size={40} className="mb-2" />
                                    <span className="text-xs font-bold text-center px-4">No image added yet</span>
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
                                            img.isPrimary
                                                ? "border-[#EA580C] ring-1 ring-[#EA580C]/20"
                                                : "border-orange-100 hover:border-orange-300"
                                        )}
                                        onClick={() => setPrimaryImage(idx)}
                                    >
                                        <img src={img.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 space-y-6">
                        <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Category Assignment</label>
                        <div className="relative">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C2D12]/30" size={18} />
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                                className="w-full pl-11 pr-4 py-4 bg-orange-50/20 border border-orange-100 rounded-xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold appearance-none cursor-pointer text-[#7C2D12]"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
