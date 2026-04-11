"use client";

import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { API_URL, fetchWithAuth } from "@/lib/api";

export default function AccountPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/me`);
            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, email: data.email }));
            }
        } catch (error) {
            console.error("Failed to fetch admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const res = await fetchWithAuth(`${API_URL}/admin/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password || undefined
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Account updated successfully!' });
                setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Update failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-maroon" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-brand-maroon tracking-tight uppercase outfit italic">
                    Admin <span className="text-brand-orange">Profile</span>
                </h1>
                <p className="text-orange-900/60 font-medium mt-1">Management of your administrator credentials</p>
            </div>

            {/* Status Message */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in slide-in-from-top-2 ${
                    message.type === 'success' 
                        ? 'bg-green-50 border-green-100 text-green-700' 
                        : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="font-bold text-sm tracking-tight">{message.text}</p>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-orange-100/50 space-y-8 relative overflow-hidden">
                        {/* Decorative background Element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0" />
                        
                        <div className="relative z-10 space-y-8">
                            {/* Email Field */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em] ml-1">
                                    <Mail size={12} />
                                    Administrator Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full h-16 bg-orange-50/50 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-2xl px-6 font-bold text-brand-maroon transition-all outline-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 pt-4">
                                {/* Password Field */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em] ml-1">
                                        <Lock size={12} />
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Leave blank to keep current"
                                            className="w-full h-16 bg-orange-50/50 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-2xl px-6 font-bold text-brand-maroon transition-all outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-orange-900/40 hover:text-brand-orange transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em] ml-1">
                                        <Lock size={12} />
                                        Confirm Password
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Repeat new password"
                                        className="w-full h-16 bg-orange-50/50 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-2xl px-6 font-bold text-brand-maroon transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-orange-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="h-16 px-10 bg-brand-maroon text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-brand-maroon/90 shadow-xl shadow-brand-maroon/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={20} />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-8">
                    <div className="bg-brand-orange p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-orange/20 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-4 text-center">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Lock size={32} className="text-white animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black outfit leading-tight tracking-tight">Security Notice</h3>
                            <p className="text-white/80 font-medium text-sm leading-relaxed">
                                Updating your credentials will affect your next login. Please ensure you remember your new password.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-orange-100/50 space-y-6">
                        <h4 className="text-[10px] font-black text-orange-900/40 uppercase tracking-[0.3em]">Login History</h4>
                        <div className="space-y-4">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 text-xs font-bold text-brand-maroon/60">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span>Session Active - Chrome (Windows)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
