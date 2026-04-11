"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, fetchWithAuth } from "@/lib/api";
import {
    Save as SaveIcon,
    X as XIcon,
    Loader2 as LoaderIcon,
    Upload as UploadIcon,
    Building2 as BuildingIcon,
    MapPin as PinIcon,
    Phone as PhoneIcon,
    Check as CheckIcon,
    ChevronLeft as BackIcon,
    Link as MediaIcon,
    Navigation as NavIcon,
    Globe as GlobeIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BranchFormProps {
    branchId?: string;
    initialData?: any;
}

export default function BranchForm({ branchId, initialData }: BranchFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!branchId && !initialData);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        phone: "",
        image: "",
        isHeadOffice: false,
        latitude: "",
        longitude: "",
    });

    useEffect(() => {
        if (initialData) {
            populateForm(initialData);
        } else if (branchId) {
            fetchBranch();
        }
    }, [branchId, initialData]);

    const fetchBranch = async () => {
        try {
            // Reverted to standard path
            const res = await fetch(`${API_URL}/branches/${branchId}`);
            if (res.ok) {
                const data = await res.json();
                populateForm(data);
            }
        } catch (error) {
            console.error("Error fetching branch:", error);
        } finally {
            setFetching(false);
        }
    };

    const populateForm = (data: any) => {
        setFormData({
            name: data.name || "",
            address: data.address || "",
            city: data.city || "",
            phone: data.phone || "",
            image: data.image || "",
            isHeadOffice: data.isHeadOffice || false,
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = branchId ? `${API_URL}/branches/${branchId}` : `${API_URL}/branches`;
            const method = branchId ? "PUT" : "POST";

            const res = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/branches");
                router.refresh();
            } else {
                alert("Failed to save branch");
            }
        } catch (error) {
            alert("Error saving branch");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 bg-white rounded-[2.5rem] shadow-xl border border-orange-100">
                <LoaderIcon className="animate-spin text-[#EA580C]" size={48} />
                <p className="font-bold text-[#7C2D12]">Loading branch data...</p>
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
                        <BackIcon size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#7C2D12] tracking-tight">
                            {branchId ? "Edit Location" : "Establish New Branch"}
                        </h1>
                        <p className="text-[#7C2D12]/60 font-bold italic mt-1">
                            {branchId ? `Updating details for ${formData.name}` : "Expand the PS4 Sweets footprint with a new outlet"}
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
                        {loading ? <LoaderIcon className="animate-spin" size={20} /> : <SaveIcon size={20} />}
                        {branchId ? "Update Branch" : "Open Branch"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 space-y-8">
                        <h3 className="text-xl font-bold text-[#7C2D12] border-b border-orange-100 pb-6 flex items-center gap-3">
                            <BuildingIcon className="text-[#EA580C]" /> Core Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Branch Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20"
                                    placeholder="e.g. PS4 Perambur Exclusive"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">City / Region</label>
                                <div className="relative group">
                                    <PinIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7C2D12]/30 group-focus-within:text-[#EA580C] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20"
                                        placeholder="e.g. Chennai"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Physical Address</label>
                            <div className="relative group">
                                <NavIcon className="absolute left-6 top-10 text-[#7C2D12]/30 group-focus-within:text-[#EA580C] transition-colors" size={20} />
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full pl-14 pr-6 py-8 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20 resize-none"
                                    placeholder="Full street address and landmarks..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Contact Number</label>
                            <div className="relative group">
                                <PhoneIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7C2D12]/30 group-focus-within:text-[#EA580C] transition-colors" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-14 pr-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        {/* GPS Coordinates for Delivery Radius */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Latitude</label>
                                <div className="relative group">
                                    <GlobeIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7C2D12]/30 group-focus-within:text-[#EA580C] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20"
                                        placeholder="e.g. 13.1087"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Longitude</label>
                                <div className="relative group">
                                    <GlobeIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7C2D12]/30 group-focus-within:text-[#EA580C] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20"
                                        placeholder="e.g. 80.2396"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isHeadOffice: !formData.isHeadOffice })}
                            className={cn(
                                "w-full flex items-center justify-between p-8 rounded-3xl border-2 transition-all group",
                                formData.isHeadOffice
                                    ? "bg-[#7C2D12] border-[#7C2D12] text-orange-50 shadow-lg"
                                    : "bg-white border-orange-100 text-[#7C2D12]/40 hover:bg-orange-50"
                            )}
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn("p-3 rounded-2xl transition-colors", formData.isHeadOffice ? "bg-white/10 text-orange-200" : "bg-orange-100 text-orange-400")}>
                                    <CheckIcon size={28} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-lg">Designate as Head Office</p>
                                    <p className={cn("text-xs font-bold mt-1", formData.isHeadOffice ? "text-orange-100/50" : "text-[#7C2D12]/30")}>
                                        This branch will be highlighted as the primary location on the website.
                                    </p>
                                </div>
                            </div>
                            {formData.isHeadOffice && <GlobeIcon size={24} className="text-[#EA580C] animate-pulse" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 space-y-6">
                        <label className="text-sm font-black text-[#7C2D12]/50 uppercase tracking-widest ml-1">Store Asset</label>

                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-dashed border-orange-200 bg-orange-50/30 group hover:border-[#EA580C] transition-colors flex items-center justify-center">
                            {formData.image ? (
                                <>
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-[#7C2D12]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: "" })}
                                            className="p-4 bg-red-600 text-white rounded-full shadow-lg"
                                        >
                                            <XIcon size={24} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-[#7C2D12]/20 p-6 text-center">
                                    <UploadIcon size={40} className="mb-2" />
                                    <span className="text-xs font-bold">Image URL Required</span>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <MediaIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C2D12]/30 group-focus-within:text-[#EA580C] transition-colors" size={18} />
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full pl-12 pr-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all text-xs font-bold"
                                placeholder="https://image-url.com/store.jpg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
