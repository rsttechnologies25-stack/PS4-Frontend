"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Phone, KeyRound } from "lucide-react";

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
    
    // Email + Password states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    // Phone + OTP states
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);

    const { login } = useAuth();

    // Handle Email + Password Submit
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailLoading(true);
        setEmailError(null);

        try {
            const res = await fetch(`${API_URL}/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                window.location.href = "/";
            } else {
                setEmailError(data.error || "Login failed");
            }
        } catch (err) {
            setEmailError("Connection error. Please try again.");
        } finally {
            setEmailLoading(false);
        }
    };

    // Handle Request OTP
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(phoneNumber)) {
            setOtpError("Phone number must be exactly 10 digits");
            return;
        }

        setOtpLoading(true);
        setOtpError(null);

        try {
            const res = await fetch(`${API_URL}/user/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber })
            });

            const data = await res.json();
            if (res.ok) {
                setIsOtpSent(true);
            } else {
                setOtpError(data.error || "Failed to send OTP");
            }
        } catch (err) {
            setOtpError("Connection error. Please try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    // Handle Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(otp)) {
            setOtpError("OTP code must be exactly 6 digits");
            return;
        }

        setOtpLoading(true);
        setOtpError(null);

        try {
            const res = await fetch(`${API_URL}/user/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber, otp })
            });

            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                window.location.href = "/";
            } else {
                setOtpError(data.error || "Invalid OTP code");
            }
        } catch (err) {
            setOtpError("Verification error. Please try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FFFBF5]">
            <div className="w-full max-w-md bg-white border border-[#8B4513]/10 shadow-2xl rounded-sm p-8 md:p-12 relative overflow-hidden">
                {/* Decorative Pattern Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B4513]/5 rounded-full -mr-16 -mt-16" />

                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black text-[#8B4513] tracking-tight outfit uppercase">Welcome Back</h1>
                        <p className="text-sm font-medium text-gray-500 italic">Sign in to continue your sweet journey</p>
                    </div>

                    {/* Login Method Tabs */}
                    <div className="flex border-b border-gray-150">
                        <button
                            type="button"
                            onClick={() => {
                                setLoginMethod("phone");
                                setOtpError(null);
                            }}
                            className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider text-center transition-all ${
                                loginMethod === "phone"
                                    ? "border-b-2 border-[#8B4513] text-[#8B4513]"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            📱 Mobile OTP
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLoginMethod("email");
                                setEmailError(null);
                            }}
                            className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider text-center transition-all ${
                                loginMethod === "email"
                                    ? "border-b-2 border-[#8B4513] text-[#8B4513]"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            📧 Email & Password
                        </button>
                    </div>

                    {/* METHOD 1: PHONE OTP LOGIN */}
                    {loginMethod === "phone" && (
                        <div className="space-y-6">
                            {otpError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{otpError}</span>
                                </div>
                            )}

                            {!isOtpSent ? (
                                <form onSubmit={handleRequestOtp} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] ml-1">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="tel"
                                                required
                                                pattern="\d{10}"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                className="w-full bg-[#FAFAFA] border border-gray-200 py-4 pl-12 pr-4 text-sm font-medium focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20 transition-all outline-none rounded-sm"
                                                placeholder="10-digit mobile number"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={otpLoading}
                                        className="w-full bg-[#8B4513] text-white py-5 rounded-sm font-black text-sm tracking-[0.3em] uppercase hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                                    >
                                        {otpLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Send OTP Code
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="bg-[#FFFBF5] border border-[#8B4513]/10 p-4 rounded-sm flex justify-between items-center text-xs font-bold text-gray-600">
                                        <span>OTP sent to +91 {phoneNumber}</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsOtpSent(false)}
                                            className="text-[#EA580C] uppercase tracking-wider hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] ml-1">Enter 6-Digit OTP</label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                required
                                                pattern="\d{6}"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                className="w-full bg-[#FAFAFA] border border-gray-200 py-4 pl-12 pr-4 text-sm font-medium focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20 transition-all outline-none rounded-sm tracking-[0.5em] font-mono text-lg"
                                                placeholder="000000"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={otpLoading}
                                        className="w-full bg-[#8B4513] text-white py-5 rounded-sm font-black text-sm tracking-[0.3em] uppercase hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                                    >
                                        {otpLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Verify & Login
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* METHOD 2: EMAIL PASSWORD LOGIN */}
                    {loginMethod === "email" && (
                        <div className="space-y-6">
                            {emailError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{emailError}</span>
                                </div>
                            )}

                            <form onSubmit={handleEmailSubmit} className="space-y-6">
                                <div className="space-y-4">
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
                                        <label className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] ml-1">Password</label>
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

                                    <div className="flex justify-end">
                                        <Link 
                                            href="/forgot-password" 
                                            className="text-[10px] font-black text-[#EA580C] uppercase tracking-wider hover:underline"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={emailLoading}
                                    className="w-full bg-[#8B4513] text-white py-5 rounded-sm font-black text-sm tracking-[0.3em] uppercase hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {emailLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Log In Now
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="text-center pt-4">
                        <p className="text-sm text-gray-500 font-medium">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-[#EA580C] font-black uppercase tracking-wider hover:underline ml-1">
                                Create One
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
