"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";



export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/user/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to send reset link");
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B4513]/5 rounded-full -mr-16 -mt-16" />

                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black text-[#8B4513] tracking-tight outfit uppercase">Reset Password</h1>
                        <p className="text-sm font-medium text-gray-500 italic">Enter your email for the reset link</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
                        </div>
                    )}

                    {success ? (
                        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle2 size={32} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-[#8B4513] uppercase">Email Sent!</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    If an account exists for <span className="font-bold text-black italic">{email}</span>, 
                                    you will receive an email with instructions shortly.
                                </p>
                            </div>
                            <Link 
                                href="/login"
                                className="inline-flex items-center gap-2 text-xs font-black text-[#EA580C] uppercase tracking-widest hover:underline"
                            >
                                <ArrowLeft size={14} /> Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#8B4513] text-white py-5 rounded-sm font-black text-sm tracking-[0.3em] uppercase hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <Link 
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#8B4513] transition-colors"
                                >
                                    <ArrowLeft size={14} /> Never mind, I remember
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
