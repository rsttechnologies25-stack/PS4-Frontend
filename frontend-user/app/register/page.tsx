"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });

            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                window.location.href = "/";
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FFFBF5]">
            <div className="w-full max-w-md bg-white border border-[#8B4513]/10 shadow-2xl rounded-sm p-8 md:p-12 relative overflow-hidden">
                {/* Decorative Pattern Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EA580C]/5 rounded-full -mr-16 -mt-16" />

                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black text-[#8B4513] tracking-tight outfit uppercase">Create Account</h1>
                        <p className="text-sm font-medium text-gray-500 italic">Join our family for exclusive tastes</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#FAFAFA] border border-gray-200 py-4 pl-12 pr-4 text-sm font-medium focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20 transition-all outline-none rounded-sm"
                                        placeholder="Srinivasan"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#FAFAFA] border border-gray-200 py-4 pl-12 pr-4 text-sm font-medium focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20 transition-all outline-none rounded-sm"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] ml-1">Create Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#FAFAFA] border border-gray-200 py-4 pl-12 pr-4 text-sm font-medium focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20 transition-all outline-none rounded-sm"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#8B4513] text-white py-5 rounded-sm font-black text-sm tracking-[0.3em] uppercase hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Join the House
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[#EA580C] font-black uppercase tracking-wider hover:underline ml-1">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
