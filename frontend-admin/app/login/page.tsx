"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Set both localStorage and cookie for middleware tracking
                localStorage.setItem("admin_token", data.token);
                localStorage.setItem("admin_user", JSON.stringify(data.admin));
                document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

                router.push("/");
            } else {
                setError(data.error || "Invalid login credentials");
            }
        } catch (err) {
            setError("Unable to connect to service. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center p-4 brand-pattern">
            <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-2xl shadow-orange-950/20 overflow-hidden border border-orange-100">
                <div className="p-12">
                    <div className="flex flex-col items-center text-center mb-12">
                        <div className="relative group mb-8">
                            <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl border border-orange-100 transform -rotate-3 group-hover:rotate-0 transition-all duration-500 bg-gradient-to-br from-white to-orange-50">
                                <div className="flex flex-col items-center justify-center -space-y-2">
                                    <span className="text-5xl font-black text-[#7C2D12] tracking-tighter outfit">PS4</span>
                                    <div className="h-1.5 w-10 bg-[#EA580C] rounded-full group-hover:w-16 transition-all duration-500" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-[#7C2D12] mb-3 outfit uppercase tracking-tight">Admin Entry</h1>
                        <p className="text-[#EA580C] font-bold text-sm tracking-widest uppercase opacity-70">PS4 Sweets & Snacks</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-[#7C2D12]/50 ml-1 uppercase tracking-[0.2em]">Access Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#7C2D12]/20 group-focus-within:text-[#EA580C] transition-colors">
                                    <Mail size={22} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-14 pr-6 py-5 bg-orange-50/30 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all placeholder:text-[#7C2D12]/20 font-bold text-lg"
                                    placeholder="admin@ps4sweets.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-[#7C2D12]/50 ml-1 uppercase tracking-[0.2em]">Secure Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#7C2D12]/20 group-focus-within:text-[#EA580C] transition-colors">
                                    <Lock size={22} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-14 pr-6 py-5 bg-orange-50/30 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all placeholder:text-[#7C2D12]/20 font-bold text-lg text-[#7C2D12]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-black flex items-center gap-3 animate-shake">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#EA580C] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#C2410C] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-orange-600/30 flex items-center justify-center gap-4 disabled:opacity-70 disabled:transform-none"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={28} />
                            ) : (
                                <>
                                    Enter Dashboard
                                    <ArrowRight size={24} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
