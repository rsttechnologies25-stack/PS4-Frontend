"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api";
import { Loader2, AlertTriangle, CheckCircle, ArrowLeft, ShieldAlert } from "lucide-react";

export default function DeleteAccountPage() {
    const { user, token, login } = useAuth();
    
    // Auth fields for logged out users
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    // Handle Login for unauthenticated users
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError(null);
        
        try {
            const res = await fetch(`${API_URL}/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await res.json();
            
            if (res.ok) {
                login(data.token, data.user);
            } else {
                setLoginError(data.error || "Invalid email or password");
            }
        } catch (err) {
            setLoginError("Failed to connect to the server. Please try again.");
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle Permanent Deletion
    const handleDeleteAccount = async () => {
        if (!token) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const res = await fetch(`${API_URL}/user/me`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setSuccess(true);
                // Wiping user credentials from local storage
                localStorage.removeItem("user_token");
                localStorage.removeItem("user_profile");
                // Wait 3 seconds and redirect to home page
                setTimeout(() => {
                    window.location.href = "/";
                }, 4000);
            } else {
                setError(data.error || "Failed to delete account. Please contact support.");
            }
        } catch (err) {
            setError("A network error occurred. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FFFBF5] py-20 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back button */}
                <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-primary/5">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                            <ShieldAlert size={28} />
                        </div>
                        <div>
                            <h1 className="serif text-3xl font-bold text-secondary">Account Deletion Request</h1>
                            <p className="text-text-muted text-sm mt-1">Request the permanent removal of your account and personal data</p>
                        </div>
                    </div>

                    <hr className="border-primary/10 mb-8" />

                    {success ? (
                        /* SUCCESS STATE */
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="serif text-2xl font-bold text-secondary mb-3">Account Successfully Deleted</h2>
                            <p className="text-text-muted leading-relaxed max-w-md mx-auto mb-6">
                                Your account and all associated personal records (name, email, mobile, addresses, order history) have been permanently purged from our database.
                            </p>
                            <p className="text-xs text-primary font-medium animate-pulse">
                                Redirecting you to the home page in a few seconds...
                            </p>
                        </div>
                    ) : (
                        /* ACTIVE WORKFLOW */
                        <div>
                            {user ? (
                                /* STATE: LOGGED IN & READY FOR DELETION */
                                <div>
                                    <div className="bg-[#FFFBF5] rounded-2xl p-6 border border-primary/10 mb-8">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Authenticated User</h3>
                                        <p className="font-bold text-secondary text-lg">{user.name || "Customer"}</p>
                                        <p className="text-text-muted text-sm">{user.email}</p>
                                    </div>

                                    <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 mb-8">
                                        <div className="flex gap-3 text-red-700 mb-4">
                                            <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                                            <h3 className="font-bold text-red-800">Critical Warning: This action is permanent!</h3>
                                        </div>
                                        <p className="text-sm text-red-700/90 leading-relaxed mb-4">
                                            Once you delete your account, all data stored in our systems will be completely and permanently removed. You will lose access to:
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-red-700/80 space-y-2 pl-2">
                                            <li>Your customer profile information (Name, Mobile, Email, and Passwords)</li>
                                            <li>All saved shipping and billing addresses</li>
                                            <li>Active shopping carts and reward histories</li>
                                            <li>Your entire Order and Billing History</li>
                                        </ul>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 font-medium">
                                            {error}
                                        </div>
                                    )}

                                    {/* Confirmation Checkbox */}
                                    <label className="flex items-start gap-3 cursor-pointer select-none mb-8">
                                        <input
                                            type="checkbox"
                                            checked={isConfirmed}
                                            onChange={(e) => setIsConfirmed(e.target.checked)}
                                            className="mt-1 accent-red-600 rounded border-primary/20 text-red-600 focus:ring-red-500 w-4 h-4"
                                        />
                                        <span className="text-sm text-text-muted leading-relaxed">
                                            I understand that account deletion is irreversible and I want to permanently delete all my personal information.
                                        </span>
                                    </label>

                                    {/* Delete Button */}
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={!isConfirmed || isLoading}
                                        className={`w-full py-4 rounded-xl text-white font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                                            isConfirmed && !isLoading
                                                ? "bg-red-600 hover:bg-red-700 hover:shadow-lg shadow-red-600/20 cursor-pointer"
                                                : "bg-red-300 cursor-not-allowed"
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" /> Purging Account Data...
                                            </>
                                        ) : (
                                            "Permanently Delete My Account"
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* STATE: UNAUTHENTICATED (LOGIN REQUIRED) */
                                <div>
                                    <div className="bg-amber-50/50 text-amber-800 p-6 rounded-2xl border border-amber-100 mb-8 text-sm leading-relaxed">
                                        To request account and data deletion, you must first authorize by logging in below. This verifies your identity and protects your account from unauthorized deletion.
                                    </div>

                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-primary mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                className="w-full px-4 py-3 rounded-xl border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-primary mb-2">Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full px-4 py-3 rounded-xl border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                            />
                                        </div>

                                        {loginError && (
                                            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium">
                                                {loginError}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loginLoading}
                                            className="w-full py-4 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg shadow-secondary/15"
                                        >
                                            {loginLoading ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" /> Verifying Identity...
                                                </>
                                            ) : (
                                                "Authorize & Log In"
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
