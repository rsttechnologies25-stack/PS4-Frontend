"use client";

import { useEffect, useState } from "react";
import { API_URL, fetchWithAuth } from "@/lib/api";
import {
    MessageCircle,
    Save,
    Loader2,
    CheckCircle2,
    XCircle,
    Info,
    Package,
    Truck,
    Star,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppTemplate {
    id: string;
    key: string;
    name: string;
    message: string;
    isActive: boolean;
    updatedAt: string;
}

const templateIcons: Record<string, any> = {
    'ORDER_CONFIRMED': Package,
    'ORDER_SHIPPED': Truck,
    'ORDER_DELIVERED': CheckCircle2,
    'FEEDBACK_REQUEST': Star,
};

const templateColors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    'ORDER_CONFIRMED': { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    'ORDER_SHIPPED': { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    'ORDER_DELIVERED': { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', iconBg: 'bg-green-100' },
    'FEEDBACK_REQUEST': { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', iconBg: 'bg-orange-100' },
};

const supportedVariables = [
    { name: '{customerName}', desc: 'Customer\'s name' },
    { name: '{orderId}', desc: 'Order ID (e.g. #70EBWMSH)' },
    { name: '{totalAmount}', desc: 'Order total (e.g. ₹760)' },
    { name: '{trackingLink}', desc: 'Tracking URL' },
    { name: '{trackingId}', desc: 'AWB / Tracking number' },
    { name: '{deliveryManName}', desc: 'Delivery person name' },
    { name: '{deliveryManPhone}', desc: 'Delivery person phone' },
    { name: '{feedbackLink}', desc: 'Feedback site URL' },
];

export default function WhatsAppTemplatesPage() {
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/whatsapp-templates`);
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
                const msgs: Record<string, string> = {};
                data.forEach((t: WhatsAppTemplate) => { msgs[t.id] = t.message; });
                setEditedMessages(msgs);
            }
        } catch (error) {
            console.error("Failed to fetch WhatsApp templates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (template: WhatsAppTemplate) => {
        setSaving(template.id);
        try {
            const res = await fetchWithAuth(`${API_URL}/whatsapp-templates/${template.id}`, {
                method: 'PUT',
                body: JSON.stringify({ message: editedMessages[template.id] })
            });
            if (res.ok) {
                const updated = await res.json();
                setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
                setSaved(template.id);
                setTimeout(() => setSaved(null), 2000);
            }
        } catch (error) {
            console.error("Failed to save template", error);
        } finally {
            setSaving(null);
        }
    };

    const handleToggle = async (template: WhatsAppTemplate) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/whatsapp-templates/${template.id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !template.isActive })
            });
            if (res.ok) {
                const updated = await res.json();
                setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
            }
        } catch (error) {
            console.error("Failed to toggle template", error);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-lg italic text-[#7C2D12]/20">Loading WhatsApp templates...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-brand-maroon uppercase tracking-tight outfit">WhatsApp Templates</h1>
                    <p className="text-orange-900/40 font-black text-[10px] tracking-[0.3em] uppercase mt-2 flex items-center gap-2">
                        <MessageCircle size={14} className="text-brand-orange" /> Manage automated customer notifications
                    </p>
                </div>
            </div>

            {/* Supported Variables Card */}
            <div className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-sm">
                <h3 className="text-xs font-black text-brand-maroon uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Info size={16} className="text-brand-orange" /> Supported Variables
                </h3>
                <p className="text-xs text-orange-900/40 mb-6">Use these placeholders in your messages. They will be replaced with actual order data when sent.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {supportedVariables.map(v => (
                        <div key={v.name} className="bg-orange-50/50 px-4 py-3 rounded-xl border border-orange-100/50">
                            <code className="text-xs font-mono font-black text-brand-orange">{v.name}</code>
                            <p className="text-[10px] text-orange-900/40 mt-1 font-medium">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Template Cards */}
            <div className="space-y-6">
                {templates.map((template) => {
                    const Icon = templateIcons[template.key] || MessageCircle;
                    const colors = templateColors[template.key] || templateColors['ORDER_CONFIRMED'];
                    const isEdited = editedMessages[template.id] !== template.message;
                    const isSaving = saving === template.id;
                    const isSaved = saved === template.id;

                    return (
                        <div
                            key={template.id}
                            className={cn(
                                "bg-white rounded-[2rem] border shadow-sm overflow-hidden transition-all",
                                template.isActive ? "border-orange-100" : "border-red-100 opacity-60"
                            )}
                        >
                            <div className={cn("p-6 flex items-center justify-between", colors.bg, "border-b", colors.border)}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", colors.iconBg, colors.text)}>
                                        <Icon size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-brand-maroon uppercase tracking-tight">{template.name}</h3>
                                        <p className="text-[10px] font-bold text-orange-900/30 uppercase tracking-widest mt-0.5 font-mono">{template.key}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Active/Inactive Toggle */}
                                    <button
                                        onClick={() => handleToggle(template)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                            template.isActive
                                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                        )}
                                    >
                                        {template.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                        {template.isActive ? 'Active' : 'Disabled'}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-orange-900/40 uppercase tracking-widest px-1">Message Template</label>
                                    <textarea
                                        rows={8}
                                        value={editedMessages[template.id] || ''}
                                        onChange={(e) => setEditedMessages({ ...editedMessages, [template.id]: e.target.value })}
                                        className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-6 py-5 text-sm text-brand-maroon font-medium outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all resize-none leading-relaxed font-mono"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-orange-900/30 font-medium">
                                        Last updated: {new Date(template.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} at {new Date(template.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </p>

                                    <button
                                        onClick={() => handleSave(template)}
                                        disabled={!isEdited || isSaving}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg",
                                            isSaved
                                                ? "bg-green-600 text-white shadow-green-200"
                                                : "bg-brand-maroon text-white hover:bg-brand-orange shadow-orange-900/20"
                                        )}
                                    >
                                        {isSaving ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : isSaved ? (
                                            <><CheckCircle2 size={16} /> Saved!</>
                                        ) : (
                                            <><Save size={16} /> Save Changes</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {templates.length === 0 && (
                <div className="text-center py-20 bg-white border border-orange-100 rounded-3xl shadow-sm">
                    <MessageCircle size={64} className="mx-auto text-gray-200 mb-6" />
                    <h2 className="text-xl font-bold text-gray-500 mb-2">No Templates Found</h2>
                    <p className="text-sm text-gray-400">Run the seed script to create default templates.</p>
                </div>
            )}
        </div>
    );
}
