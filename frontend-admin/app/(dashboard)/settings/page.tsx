"use client";

import { useRef, useState, useEffect } from 'react';
import {
    Settings, History, Phone, Layout, Save, Loader2, Upload,
    AlertCircle, CheckCircle2, Info, Eye, EyeOff, Plus,
    Globe, UtensilsCrossed, Quote, Heart, Building2, MapPin
} from "lucide-react";
import { API_URL, fetchWithAuth } from "@/lib/api";

type TabType = 'general' | 'about' | 'contact' | 'splash';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [settings, setSettings] = useState<any>({
        deliveryPopupEnabled: true,
        deliveryPopupTitle: '',
        deliveryPopupContent: '',
        whatsappNumber: '',
        aboutPageContent: null,
        contactPageContent: null,
        splashContent: {
            useDefault: true,
            image: '',
            backgroundColor: '#7C2D12',
            text: '',
            textColor: '#FFFFFF',
            duration: 2
        },
        dispatchCutoffHour: 14,
        dispatchSundayPolicy: false,
        dispatchLimitText: 'ORDER WITHIN {time} HOURS'
    });
    const [uploading, setUploading] = useState(false);
    const [uploadTarget, setUploadTarget] = useState<{ tab: 'about' | 'contact' | 'splash', path: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cmsFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/settings`);
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    ...data,
                    splashContent: data.splashContent || {
                        useDefault: true,
                        image: '',
                        backgroundColor: '#7C2D12',
                        text: '',
                        textColor: '#FFFFFF',
                        duration: 2
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update settings' });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const updateAbout = (path: string, value: any) => {
        const newAbout = { ...settings.aboutPageContent };
        const keys = path.split('.');
        let current = newAbout;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setSettings({ ...settings, aboutPageContent: newAbout });
    };

    const updateContact = (path: string, value: any) => {
        const newContact = { ...settings.contactPageContent };
        const keys = path.split('.');
        let current = newContact;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setSettings({ ...settings, contactPageContent: newContact });
    };

    const updateSplash = (path: string, value: any) => {
        const newSplash = { ...settings.splashContent };
        const keys = path.split('.');
        let current = newSplash;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setSettings({ ...settings, splashContent: newSplash });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadTarget) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                const fullUrl = data.url; // Use relative URL from backend
                
                if (uploadTarget.tab === 'about') updateAbout(uploadTarget.path, fullUrl);
                else if (uploadTarget.tab === 'contact') updateContact(uploadTarget.path, fullUrl);
                else if (uploadTarget.tab === 'splash') updateSplash(uploadTarget.path, fullUrl);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
            setUploadTarget(null);
            if (e.target) e.target.value = '';
        }
    };

    const triggerUpload = (tab: 'about' | 'contact' | 'splash', path: string) => {
        setUploadTarget({ tab, path });
        if (tab === 'splash') {
            fileInputRef.current?.click();
        } else {
            cmsFileInputRef.current?.click();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
            </div>
        );
    }

    const navItems = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'about', label: 'About Page', icon: History },
        { id: 'contact', label: 'Contact Page', icon: Phone },
        { id: 'splash', label: 'Splash Screen', icon: Layout }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-[#7C2D12] pb-8">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-[#7C2D12] rounded-[2rem] text-white shadow-2xl scale-110">
                        <Settings size={40} />
                    </div>
                    <div>
                        <h1 className="text-6xl font-black text-[#7C2D12] outfit tracking-tight leading-none uppercase">CMS Settings</h1>
                        <p className="text-[#EA580C] font-black text-base tracking-[0.4em] uppercase mt-2">Manage site content dynamically</p>
                    </div>
                </div>

                <div className="flex bg-[#FFF7ED] p-2 rounded-3xl border-2 border-[#EA580C]/10 self-start md:self-center">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as TabType)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === item.id
                                    ? 'bg-[#7C2D12] text-white shadow-lg'
                                    : 'text-[#7C2D12] hover:bg-white'
                                }`}
                        >
                            <item.icon size={16} />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {message && (
                <div className={`p-6 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-2xl ${message.type === 'success' ? 'bg-[#ECFDF5] text-[#065F46] border-4 border-[#10B981]/20' : 'bg-[#FEF2F2] text-[#991B1B] border-4 border-[#EF4444]/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
                    <span className="font-black text-lg tracking-wide uppercase">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-10">
                <input
                    ref={cmsFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />
                {activeTab === 'general' && (
                    <div className="space-y-12">
                        <div className="bg-white rounded-[3rem] p-12 shadow-[0_20px_50px_rgba(124,45,18,0.15)] border-4 border-[#7C2D12]/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-3 h-full bg-[#7C2D12]" />
                            <div className="space-y-12">
                                <section className="space-y-8">
                                    <div className="flex items-center gap-4 border-b-2 border-[#7C2D12]/10 pb-4">
                                        <Info className="text-[#EA580C]" size={24} />
                                        <h2 className="text-3xl font-black text-[#7C2D12] outfit uppercase">Delivery Popup</h2>
                                    </div>
                                    <div className="flex items-center justify-between p-8 bg-[#FFF7ED] rounded-[2.5rem] border-4 border-[#EA580C]/10 shadow-inner">
                                        <div className="space-y-1">
                                            <h3 className="text-[#7C2D12] font-black text-xl outfit tracking-tight">Status</h3>
                                            <p className="text-[#7C2D12]/70 text-xs font-black uppercase tracking-[0.2em]">{settings.deliveryPopupEnabled ? 'Visible' : 'Hidden'} on Homepage</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSettings({ ...settings, deliveryPopupEnabled: !settings.deliveryPopupEnabled })}
                                            className={`w-16 h-8 rounded-full transition-all duration-500 relative ${settings.deliveryPopupEnabled ? 'bg-[#EA580C]' : 'bg-[#7C2D12]/10'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-500 ${settings.deliveryPopupEnabled ? 'left-9' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Popup Title</label>
                                            <input
                                                type="text"
                                                value={settings.deliveryPopupTitle || ''}
                                                onChange={e => setSettings({ ...settings, deliveryPopupTitle: e.target.value })}
                                                className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">WhatsApp Contact</label>
                                            <input
                                                type="text"
                                                value={settings.whatsappNumber || ''}
                                                onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                                placeholder="e.g. 919282445577"
                                                className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Popup Content</label>
                                            <textarea
                                                value={settings.deliveryPopupContent || ''}
                                                onChange={e => setSettings({ ...settings, deliveryPopupContent: e.target.value })}
                                                rows={5}
                                                className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none transition-all shadow-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-8 pt-8 border-t-2 border-[#7C2D12]/10">
                                    <div className="flex items-center gap-4 border-b-2 border-[#7C2D12]/10 pb-4">
                                        <History className="text-[#EA580C]" size={24} />
                                        <h2 className="text-3xl font-black text-[#7C2D12] outfit uppercase">Order Timing & Dispatch</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Dispatch on Sundays</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setSettings({ ...settings, dispatchSundayPolicy: !settings.dispatchSundayPolicy })}
                                                    className={`w-12 h-6 rounded-full transition-all relative ${settings.dispatchSundayPolicy ? 'bg-green-600' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.dispatchSundayPolicy ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="bg-[#FFF7ED] p-6 rounded-2xl border-2 border-[#EA580C]/10">
                                                <p className="text-[#7C2D12]/60 text-[10px] font-bold uppercase leading-relaxed">
                                                    If disabled, orders placed after Saturday cutoff or anytime on Sunday will be marked for Monday dispatch.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4 text-secondary">Dispatch Cutoff Hour (0-23)</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="23"
                                                    value={settings.dispatchCutoffHour || 14}
                                                    onChange={e => setSettings({ ...settings, dispatchCutoffHour: parseInt(e.target.value) })}
                                                    className="w-24 bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none"
                                                />
                                                <span className="text-[#7C2D12] font-black uppercase text-xs">
                                                    {settings.dispatchCutoffHour >= 12 ? (settings.dispatchCutoffHour === 12 ? '12 PM' : `${settings.dispatchCutoffHour - 12} PM`) : (settings.dispatchCutoffHour === 0 ? '12 AM' : `${settings.dispatchCutoffHour} AM`)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Countdown Text Template</label>
                                            <input
                                                type="text"
                                                value={settings.dispatchLimitText || ''}
                                                onChange={e => setSettings({ ...settings, dispatchLimitText: e.target.value })}
                                                placeholder="e.g. ORDER WITHIN {time} HOURS"
                                                className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none transition-all shadow-sm"
                                            />
                                            <p className="text-[10px] text-[#EA580C] font-black uppercase ml-4">Use {"{time}"} as a placeholder for the countdown timer.</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'about' && settings.aboutPageContent && (
                    <div className="space-y-12">
                        {/* Hero Section */}
                        <div className="bg-white rounded-[3rem] p-12 shadow-[0_20px_50px_rgba(124,45,18,0.15)] border-4 border-[#7C2D12]/5 relative">
                            <div className="flex items-center gap-4 border-b-2 border-[#7C2D12]/10 pb-6 mb-10">
                                <Layout className="text-[#EA580C]" size={28} />
                                <h2 className="text-4xl font-black text-[#7C2D12] outfit uppercase">About Us: Hero Section</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Main Title</label>
                                        <input
                                            type="text"
                                            value={settings.aboutPageContent.hero.title}
                                            onChange={e => updateAbout('hero.title', e.target.value)}
                                            className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none transition-all shadow-sm text-2xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Subtitle Card</label>
                                        <input
                                            type="text"
                                            value={settings.aboutPageContent.hero.subtitle}
                                            onChange={e => updateAbout('hero.subtitle', e.target.value)}
                                            className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Hero Description</label>
                                        <textarea
                                            value={settings.aboutPageContent.hero.description}
                                            onChange={e => updateAbout('hero.description', e.target.value)}
                                            rows={3}
                                            className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none transition-all shadow-sm resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Background Image</label>
                                    <div className="relative group rounded-3xl overflow-hidden border-4 border-[#7C2D12]/10 bg-[#FAFAFA] aspect-video">
                                        <img 
                                            src={settings.aboutPageContent.hero.image.startsWith('/') ? `${API_URL.replace('/api', '')}${settings.aboutPageContent.hero.image}` : settings.aboutPageContent.hero.image} 
                                            alt="Hero" 
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => triggerUpload('about', 'hero.image')}
                                                className="bg-white text-[#7C2D12] px-6 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-[#EA580C] hover:text-white transition-all scale-90 group-hover:scale-100"
                                            >
                                                Change Image
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={settings.aboutPageContent.hero.image}
                                        onChange={e => updateAbout('hero.image', e.target.value)}
                                        className="w-full bg-[#FAFAFA] border-2 border-[#7C2D12]/10 rounded-xl px-4 py-2 text-xs font-bold text-center"
                                        placeholder="Image path or URL"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="bg-white rounded-[3rem] p-12 shadow-[0_20px_50px_rgba(124,45,18,0.15)] border-4 border-[#7C2D12]/5">
                            <div className="flex items-center gap-4 border-b-2 border-[#7C2D12]/10 pb-6 mb-10">
                                <Plus className="text-[#EA580C]" size={28} />
                                <h2 className="text-4xl font-black text-[#7C2D12] outfit uppercase">Key Statistics</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {settings.aboutPageContent.stats.map((stat: any, index: number) => (
                                    <div key={index} className="bg-[#FFF7ED] p-6 rounded-3xl border-2 border-[#EA580C]/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="p-2 bg-white rounded-lg text-[#EA580C]"><Globe size={16} /></span>
                                            <label className="text-[10px] font-black uppercase text-[#7C2D12]/40">Stat #{index + 1}</label>
                                        </div>
                                        <input
                                            type="text"
                                            value={stat.value}
                                            onChange={e => {
                                                const newStats = [...settings.aboutPageContent.stats];
                                                newStats[index].value = e.target.value;
                                                updateAbout('stats', newStats);
                                            }}
                                            className="w-full bg-white border-2 border-[#7C2D12]/10 rounded-xl px-4 py-2 text-xl font-black text-[#7C2D12] text-center"
                                        />
                                        <input
                                            type="text"
                                            value={stat.label}
                                            onChange={e => {
                                                const newStats = [...settings.aboutPageContent.stats];
                                                newStats[index].label = e.target.value;
                                                updateAbout('stats', newStats);
                                            }}
                                            className="w-full bg-transparent border-0 text-xs font-bold text-[#7C2D12]/60 uppercase tracking-widest text-center focus:ring-0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legacy Section */}
                        <div className="bg-white rounded-[3rem] p-12 shadow-[0_20px_50px_rgba(124,45,18,0.15)] border-4 border-[#7C2D12]/5">
                            <div className="flex items-center gap-4 border-b-2 border-[#7C2D12]/10 pb-6 mb-10">
                                <History className="text-[#EA580C]" size={28} />
                                <h2 className="text-4xl font-black text-[#7C2D12] outfit uppercase">Our Roots & legacy</h2>
                            </div>

                            <div className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Section Identity Badge</label>
                                            <input
                                                type="text"
                                                value={settings.aboutPageContent.legacy.badge}
                                                onChange={e => updateAbout('legacy.badge', e.target.value)}
                                                className="w-full bg-[#FAFAFA] border-2 border-[#7C2D12]/10 rounded-xl px-4 py-3 font-bold text-[#EA580C] uppercase tracking-widest text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Legacy Title</label>
                                            <input
                                                type="text"
                                                value={settings.aboutPageContent.legacy.title}
                                                onChange={e => updateAbout('legacy.title', e.target.value)}
                                                className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black text-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Legacy Image</label>
                                        <div className="bg-[#FAFAFA] border-4 border-dashed border-[#7C2D12]/10 rounded-2xl p-6 relative group aspect-video overflow-hidden">
                                            <img 
                                                src={settings.aboutPageContent.legacy.image.startsWith('/') ? `${API_URL.replace('/api', '')}${settings.aboutPageContent.legacy.image}` : settings.aboutPageContent.legacy.image} 
                                                className="w-full h-full object-contain transition-transform group-hover:scale-105" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => triggerUpload('about', 'legacy.image')}
                                                    className="bg-white text-[#7C2D12] px-6 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-[#EA580C] hover:text-white transition-all"
                                                >
                                                    Change Image
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={settings.aboutPageContent.legacy.image}
                                            onChange={e => updateAbout('legacy.image', e.target.value)}
                                            className="w-full bg-white border-2 border-[#7C2D12]/10 rounded-xl px-4 py-2 text-xs font-bold text-center"
                                            placeholder="Image path or URL"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Story Content (Paragraphs)</label>
                                    {settings.aboutPageContent.legacy.content.map((para: string, idx: number) => (
                                        <div key={idx} className="relative group">
                                            <textarea
                                                value={para}
                                                onChange={e => {
                                                    const newContent = [...settings.aboutPageContent.legacy.content];
                                                    newContent[idx] = e.target.value;
                                                    updateAbout('legacy.content', newContent);
                                                }}
                                                rows={4}
                                                className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-10 py-6 text-[#7C2D12]/80 font-medium leading-relaxed"
                                            />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#EA580C] rounded-full" />
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#FFF7ED] p-10 rounded-[2.5rem] border-4 border-l-[12px] border-[#EA580C]/20 border-l-[#EA580C]">
                                    <label className="text-xs font-black text-[#EA580C] uppercase tracking-[0.3em] block mb-4">Golden Quote</label>
                                    <textarea
                                        value={settings.aboutPageContent.legacy.quote}
                                        onChange={e => updateAbout('legacy.quote', e.target.value)}
                                        rows={2}
                                        className="w-full bg-transparent border-0 text-[#7C2D12] text-xl font-bold italic p-0 focus:ring-0 leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Sections with Visibility Toggles */}
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Restaurant Section */}
                            <div className="bg-white rounded-[3rem] p-10 shadow-xl border-4 border-[#7C2D12]/5 space-y-8">
                                <div className="flex items-center justify-between border-b-2 border-[#7C2D12]/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <UtensilsCrossed className="text-[#EA580C]" size={20} />
                                        <h3 className="text-2xl font-black text-[#7C2D12] outfit uppercase">Restaurant</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateAbout('restaurant.isVisible', !settings.aboutPageContent.restaurant.isVisible)}
                                        className={`p-2 rounded-xl transition-all ${settings.aboutPageContent.restaurant.isVisible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                    >
                                        {settings.aboutPageContent.restaurant.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={settings.aboutPageContent.restaurant.title}
                                        onChange={e => updateAbout('restaurant.title', e.target.value)}
                                        placeholder="Section Title"
                                        className="w-full bg-[#FAFAFA] border-2 border-[#7C2D12]/10 rounded-xl px-4 py-2 font-black text-[#7C2D12]"
                                    />
                                    <textarea
                                        value={settings.aboutPageContent.restaurant.description}
                                        onChange={e => updateAbout('restaurant.description', e.target.value)}
                                        rows={6}
                                        className="w-full bg-[#FAFAFA] border-2 border-[#7C2D12]/10 rounded-xl px-4 py-3 text-sm font-medium leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Global Export Section */}
                            <div className="bg-white rounded-[3rem] p-10 shadow-xl border-4 border-[#7C2D12]/5 space-y-8">
                                <div className="flex items-center justify-between border-b-2 border-[#7C2D12]/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <Globe className="text-[#EA580C]" size={20} />
                                        <h3 className="text-2xl font-black text-[#7C2D12] outfit uppercase">Global Export</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateAbout('global.isVisible', !settings.aboutPageContent.global.isVisible)}
                                        className={`p-2 rounded-xl transition-all ${settings.aboutPageContent.global.isVisible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                    >
                                        {settings.aboutPageContent.global.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={settings.aboutPageContent.global.title}
                                        onChange={e => updateAbout('global.title', e.target.value)}
                                        className="w-full bg-[#FAFAFA] border-2 border-[#7C2D12]/10 rounded-xl px-4 py-2 font-black text-[#7C2D12]"
                                    />
                                    <textarea
                                        value={settings.aboutPageContent.global.description}
                                        onChange={e => updateAbout('global.description', e.target.value)}
                                        rows={6}
                                        className="w-full bg-[#FAFAFA] border-2 border-[#7C2D12]/10 rounded-xl px-4 py-3 text-sm font-medium leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Sign-off */}
                        <div className="bg-[#7C2D12] rounded-[3rem] p-12 text-white shadow-2xl space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                <Quote className="text-[#EA580C]" size={28} />
                                <h2 className="text-3xl font-black outfit uppercase tracking-tighter">Commitment Footer</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-12 relative z-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Giant Ending Title</label>
                                        <input
                                            type="text"
                                            value={settings.aboutPageContent.footer.title}
                                            onChange={e => updateAbout('footer.title', e.target.value)}
                                            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-black text-2xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Legacy Banner text</label>
                                        <input
                                            type="text"
                                            value={settings.aboutPageContent.footer.legacyText}
                                            onChange={e => updateAbout('footer.legacyText', e.target.value)}
                                            className="w-full bg-[#EA580C]/20 border-2 border-[#EA580C]/40 rounded-full px-8 py-3 text-[#EA580C] font-black uppercase tracking-widest text-center italic"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Final Customer Quote</label>
                                    <textarea
                                        value={settings.aboutPageContent.footer.quote}
                                        onChange={e => updateAbout('footer.quote', e.target.value)}
                                        rows={6}
                                        className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-8 py-6 text-white/80 font-light italic leading-relaxed text-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'contact' && settings.contactPageContent && (
                    <div className="space-y-12 h-fit mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Hero Section */}
                        <div className="bg-white rounded-[3rem] p-12 shadow-[0_20px_50px_rgba(124,45,18,0.15)] border-4 border-[#7C2D12]/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-3 h-full bg-[#EA580C]" />
                            <div className="flex items-center gap-4 border-b-2 border-[#7C2D12]/10 pb-6 mb-10">
                                <Layout className="text-[#EA580C]" size={28} />
                                <h2 className="text-4xl font-black text-[#7C2D12] outfit uppercase">Contact: Hero Section</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Hero Badge</label>
                                        <input
                                            type="text"
                                            value={settings.contactPageContent.hero.badge}
                                            onChange={e => updateContact('hero.badge', e.target.value)}
                                            className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Hero Title</label>
                                        <input
                                            type="text"
                                            value={settings.contactPageContent.hero.title}
                                            onChange={e => updateContact('hero.title', e.target.value)}
                                            className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black focus:border-[#EA580C] outline-none transition-all text-2xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Hero Banner Image</label>
                                    <div className="relative group rounded-3xl overflow-hidden border-4 border-[#7C2D12]/10 bg-[#FAFAFA] aspect-video">
                                        <img 
                                            src={settings.contactPageContent.hero.image.startsWith('/') ? `${API_URL.replace('/api', '')}${settings.contactPageContent.hero.image}` : settings.contactPageContent.hero.image} 
                                            alt="Hero" 
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700 blur-[1px] opacity-60" 
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => triggerUpload('contact', 'hero.image')}
                                                className="bg-white text-[#7C2D12] px-6 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-[#EA580C] hover:text-white transition-all"
                                            >
                                                Change Banner
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={settings.contactPageContent.hero.image}
                                        onChange={e => updateContact('hero.image', e.target.value)}
                                        className="w-full bg-[#FAFAFA] border-2 border-[#7C2D12]/10 rounded-xl px-4 py-2 text-xs font-bold text-center"
                                        placeholder="Image path or URL"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Headquarters Section */}
                        <div className="bg-white rounded-[3rem] p-12 shadow-[0_20px_50px_rgba(124,45,18,0.15)] border-4 border-[#7C2D12]/5">
                            <div className="flex items-center gap-4 border-b-2 border-[#7C2D12]/10 pb-6 mb-10">
                                <Building2 className="text-[#EA580C]" size={28} />
                                <h2 className="text-4xl font-black text-[#7C2D12] outfit uppercase">Corporate Headquarters</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Badge</label>
                                    <input type="text" value={settings.contactPageContent.hq.badge} onChange={e => updateContact('hq.badge', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Title Accent (e.g. Headquarters)</label>
                                    <input type="text" value={settings.contactPageContent.hq.titleAccent} onChange={e => updateContact('hq.titleAccent', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#EA580C] font-black" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Full Title</label>
                                    <input type="text" value={settings.contactPageContent.hq.title} onChange={e => updateContact('hq.title', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black text-xl" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Full Address</label>
                                    <textarea rows={2} value={settings.contactPageContent.hq.address} onChange={e => updateContact('hq.address', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Maps Support Link</label>
                                    <input type="text" value={settings.contactPageContent.hq.mapsLink} onChange={e => updateContact('hq.mapsLink', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-blue-600 font-medium text-xs" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Phone Support</label>
                                    <input type="text" value={settings.contactPageContent.hq.phone} onChange={e => updateContact('hq.phone', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Email Support</label>
                                    <input type="text" value={settings.contactPageContent.hq.email} onChange={e => updateContact('hq.email', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Operating Hours</label>
                                    <input type="text" value={settings.contactPageContent.hq.hours} onChange={e => updateContact('hq.hours', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-medium italic" />
                                </div>
                            </div>
                        </div>

                        {/* Customer Feedback section */}
                        <div className="bg-[#EA580C] rounded-[3rem] p-12 text-white shadow-2xl space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-4 border-b border-white/10 pb-6 relative z-10">
                                <Heart className="text-white fill-white" size={28} />
                                <h2 className="text-3xl font-black outfit uppercase tracking-tighter">Feedback & Interaction</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-12 relative z-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Section Title</label>
                                        <input type="text" value={settings.contactPageContent.feedback.title} onChange={e => updateContact('feedback.title', e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Title Accent</label>
                                        <input type="text" value={settings.contactPageContent.feedback.titleAccent} onChange={e => updateContact('feedback.titleAccent', e.target.value)} className="w-full bg-secondary/20 border-2 border-secondary/40 rounded-full px-8 py-3 text-white font-black uppercase tracking-widest text-center italic" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Description</label>
                                        <textarea rows={2} value={settings.contactPageContent.feedback.description} onChange={e => updateContact('feedback.description', e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Review Link</label>
                                        <input type="text" value={settings.contactPageContent.feedback.reviewLink} onChange={e => updateContact('feedback.reviewLink', e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-medium" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-2 gap-8">
                                        {settings.contactPageContent.feedback.stats.map((stat: any, idx: number) => (
                                            <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex gap-4 items-center">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-white/40">Stat {idx + 1}</label>
                                                    <input type="text" value={stat.value} onChange={e => {
                                                        const newStats = [...settings.contactPageContent.feedback.stats];
                                                        newStats[idx].value = e.target.value;
                                                        updateContact('feedback.stats', newStats);
                                                    }} className="w-full bg-transparent border-0 p-0 text-white font-black text-2xl focus:ring-0" />
                                                    <input type="text" value={stat.label} onChange={e => {
                                                        const newStats = [...settings.contactPageContent.feedback.stats];
                                                        newStats[idx].label = e.target.value;
                                                        updateContact('feedback.stats', newStats);
                                                    }} className="w-full bg-transparent border-0 p-0 text-white/60 font-bold uppercase tracking-widest text-xs focus:ring-0" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Map Section */}
                        <div className="bg-white rounded-[3rem] p-12 shadow-[0_20px_50px_rgba(124,45,18,0.15)] border-4 border-[#7C2D12]/5">
                            <div className="flex items-center gap-4 border-b-2 border-[#7C2D12]/10 pb-6 mb-10">
                                <MapPin className="text-[#EA580C]" size={28} />
                                <h2 className="text-4xl font-black text-[#7C2D12] outfit uppercase">Interactive Map</h2>
                            </div>
                            <div className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Map Badge</label>
                                        <input type="text" value={settings.contactPageContent.map.badge} onChange={e => updateContact('map.badge', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Sub-text</label>
                                        <input type="text" value={settings.contactPageContent.map.subText} onChange={e => updateContact('map.subText', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#EA580C] font-black" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Google Maps Iframe URL</label>
                                    <textarea rows={3} value={settings.contactPageContent.map.iframeUrl} onChange={e => updateContact('map.iframeUrl', e.target.value)} className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-medium text-xs break-all" placeholder="Paste entire iframe src URL here" />
                                    <div className="aspect-video rounded-3xl overflow-hidden border-4 border-[#7C2D12]/10 relative group">
                                        <iframe src={settings.contactPageContent.map.iframeUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" className="grayscale pointer-events-none group-hover:grayscale-0 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-[#7C2D12]/5 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'splash' && settings.splashContent && (
                    <div className="space-y-12">
                        <div className="bg-white rounded-[3rem] p-12 shadow-[0_20px_50px_rgba(124,45,18,0.15)] border-4 border-[#7C2D12]/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-3 h-full bg-[#EA580C]" />
                            <div className="flex items-center justify-between border-b-2 border-[#7C2D12]/10 pb-6 mb-10">
                                <div className="flex items-center gap-4">
                                    <Layout className="text-[#EA580C]" size={28} />
                                    <h2 className="text-4xl font-black text-[#7C2D12] outfit uppercase">Mobile Splash Screen</h2>
                                </div>
                                <div className="flex items-center gap-4 bg-orange-50 px-6 py-3 rounded-2xl border-2 border-[#7C2D12]/10">
                                    <span className="text-sm font-black text-[#7C2D12] uppercase tracking-wider">Use Default Design</span>
                                    <button 
                                        type="button"
                                        onClick={() => updateSplash('useDefault', !settings.splashContent.useDefault)}
                                        className={`w-14 h-8 rounded-full transition-all relative ${settings.splashContent.useDefault ? 'bg-[#EA580C]' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.splashContent.useDefault ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className={`grid md:grid-cols-2 gap-10 transition-opacity duration-300 ${settings.splashContent.useDefault ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Splash Logo</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={settings.splashContent.image}
                                                onChange={e => updateSplash('image', e.target.value)}
                                                className="flex-1 bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black"
                                                placeholder="Logo URL"
                                            />
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => triggerUpload('splash', 'image')}
                                                disabled={uploading}
                                                className="px-6 bg-[#7C2D12] text-white font-black rounded-2xl hover:bg-[#EA580C] transition-colors flex items-center gap-2"
                                            >
                                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                                Browse
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Background Color (Hex)</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="color"
                                                value={settings.splashContent.backgroundColor}
                                                onChange={e => updateSplash('backgroundColor', e.target.value)}
                                                className="w-16 h-16 rounded-xl border-4 border-[#7C2D12]/10 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={settings.splashContent.backgroundColor}
                                                onChange={e => updateSplash('backgroundColor', e.target.value)}
                                                className="flex-1 bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Branding Text</label>
                                        <input
                                            type="text"
                                            value={settings.splashContent.text}
                                            onChange={e => updateSplash('text', e.target.value)}
                                            className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Text Color (Hex)</label>
                                            <input
                                                type="text"
                                                value={settings.splashContent.textColor}
                                                onChange={e => updateSplash('textColor', e.target.value)}
                                                className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black uppercase"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Duration (Seconds)</label>
                                            <input
                                                type="number"
                                                value={settings.splashContent.duration}
                                                onChange={e => updateSplash('duration', parseInt(e.target.value) || 2)}
                                                className="w-full bg-[#FAFAFA] border-4 border-[#7C2D12]/10 rounded-2xl px-6 py-4 text-[#7C2D12] font-black"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-xs font-black text-[#7C2D12]/40 uppercase tracking-[0.3em] ml-4">Preview (Approximate)</label>
                                    <div 
                                        className="aspect-[9/16] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center p-12 text-center"
                                        style={{ backgroundColor: settings.splashContent.backgroundColor }}
                                    >
                                        <img 
                                            src={settings.splashContent.image.startsWith('/') ? `http://localhost:4000${settings.splashContent.image}` : settings.splashContent.image} 
                                            alt="Splash Logo" 
                                            className="w-32 h-32 object-contain mb-8"
                                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                                        />
                                        <h3 
                                            className="text-2xl font-black outfit tracking-[0.2em] uppercase"
                                            style={{ color: settings.splashContent.textColor }}
                                        >
                                            {settings.splashContent.text}
                                        </h3>
                                        <div className="mt-12 flex gap-2">
                                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: settings.splashContent.textColor, animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: settings.splashContent.textColor, animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: settings.splashContent.textColor, animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="sticky bottom-10 flex justify-end pr-8 pb-10 pointer-events-none">
                    <button
                        type="submit"
                        disabled={saving}
                        className="pointer-events-auto bg-[#70250a] text-white px-16 py-8 rounded-[2.5rem] font-black text-lg tracking-[0.4em] uppercase hover:bg-black transition-all shadow-[0_25px_50px_-12px_rgba(124,45,18,0.5)] hover:shadow-[#7C2D12]/40 disabled:opacity-50 flex items-center gap-6 group active:scale-95 border-b-8 border-black/20"
                    >
                        {saving ? <Loader2 className="w-8 h-8 animate-spin" /> : <Save size={32} className="group-hover:scale-110 transition-transform" />}
                        {saving ? 'SAVING...' : 'PUBLISH CHANGES'}
                    </button>
                </div>
            </form>
        </div>
    );
}
