"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/user/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, confirmPassword })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to reset password");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-sm flex items-center gap-3">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Invalid or missing reset token</span>
                </div>
                <Link href="/login" className="text-xs font-black text-[#EA580C] uppercase tracking-widest hover:underline block">
                    Back to Login
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle2 size={32} />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-black text-[#8B4513] uppercase">Password Reset!</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        Your password has been successfully updated.
                        You can now log in with your new credentials.
                    </p>
                </div>
                <Link 
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs font-black text-[#EA580C] uppercase tracking-widest hover:underline"
                >
                    Log In Now <ArrowRight size={14} />
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] ml-1">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#FAFAFA] border border-gray-200 py-4 pl-12 pr-4 text-sm font-medium focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20 transition-all outline-none rounded-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#FAFAFA] border border-gray-200 py-4 pl-12 pr-4 text-sm font-medium focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20 transition-all outline-none rounded-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-sm flex items-center gap-3">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B4513] text-white py-5 rounded-sm font-black text-sm tracking-[0.3em] uppercase hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        Update Password
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FFFBF5]">
            <div className="w-full max-w-md bg-white border border-[#8B4513]/10 shadow-2xl rounded-sm p-8 md:p-12 relative overflow-hidden">
                {/* Decorative Pattern Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B4513]/5 rounded-full -mr-16 -mt-16" />

                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black text-[#8B4513] tracking-tight outfit uppercase">New Password</h1>
                        <p className="text-sm font-medium text-gray-500 italic">Set your new account credentials</p>
                    </div>

                    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#8B4513]" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
