"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import { Loader2, ShoppingBag, X, ArrowRight, Menu as MenuIcon, User } from "lucide-react";
import Link from "next/link";
import { API_URL, fetchWithAuth } from "@/lib/api";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [newOrder, setNewOrder] = useState<any>(null);
    const [lastNotifId, setLastNotifId] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("admin_token") : null;
        if (!token) {
            router.push("/login");
        } else {
            setLoading(false);
            // Check for notifications immediately and then start polling
            checkNewOrders();
            const interval = setInterval(checkNewOrders, 8000); // slightly faster than the bell
            return () => clearInterval(interval);
        }
    }, [router]);

    const checkNewOrders = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/notifications/admin/all`);
            if (res.ok) {
                const notifications = await res.json();
                const latest = notifications.find((n: any) => n.type === 'NEW_ORDER' && !n.isRead);

                if (latest && latest.id !== lastNotifId) {
                    setNewOrder(latest);
                    setLastNotifId(latest.id);
                    // Auto dismiss toast after 10 seconds
                    setTimeout(() => setNewOrder(null), 10000);
                }
            }
        } catch (error) {
            console.error("Failed to check for new orders");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-brand-cream animate-pulse">
                <div className="flex flex-col items-center gap-6">
                    <img src="/logo-v1.png" alt="PS4 Logo" className="w-20 h-auto" />
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-brand-cream overflow-hidden">
            <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
            <div className="flex-1 lg:ml-80 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-10 relative brand-pattern">
                    <div className="max-w-7xl mx-auto min-h-[calc(100vh-200px)]">
                        {children}
                    </div>
                </main>
            </div>

            {/* Global Order Popup (Toast) */}
            {newOrder && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-brand-maroon text-white p-1 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-6 max-w-sm relative group overflow-hidden">
                        {/* Decorative background pulse */}
                        <div className="absolute inset-0 bg-brand-orange/10 animate-pulse pointer-events-none" />

                        <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-brand-maroon flex-shrink-0 ml-1 relative z-10 shadow-lg">
                            <ShoppingBag className="animate-bounce" />
                        </div>

                        <div className="flex-1 pr-10 relative z-10 py-4">
                            <p className="text-[10px] font-black text-brand-orange uppercase tracking-[.3em] mb-1">New Order Received!</p>
                            <h4 className="text-sm font-bold line-clamp-1">{newOrder.message}</h4>
                            <Link
                                href={`/orders/${newOrder.orderId}`}
                                onClick={() => setNewOrder(null)}
                                className="mt-3 inline-flex items-center gap-2 text-xs font-black text-brand-orange hover:text-white transition-colors group/link"
                            >
                                Process Order <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <button
                            onClick={() => setNewOrder(null)}
                            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="flex items-center justify-between py-4 md:py-6 px-4 md:px-10 bg-white/50 backdrop-blur-md sticky top-0 z-40 border-b border-orange-100/30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 lg:hidden text-brand-maroon hover:bg-orange-50 rounded-xl transition-colors"
                >
                    <MenuIcon size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-brand-maroon flex items-center justify-center text-white shadow-lg">
                        <User size={18} className="md:w-5 md:h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Management</p>
                        <p className="text-xs md:text-sm font-black text-brand-maroon outfit">Administrator</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationBell />
            </div>
        </header>
    );
}
