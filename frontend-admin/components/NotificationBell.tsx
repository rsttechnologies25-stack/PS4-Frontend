"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, ShoppingBag, X, CheckCheck, Loader2 } from "lucide-react";
import { API_URL, fetchWithAuth } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const lastPlayedId = useRef<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        // Initialize audio for notification sound
        setAudio(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Find the latest high-priority unread notification
        const latestHighPriority = notifications.find(n => !n.isRead && n.priority === 'HIGH');
        
        if (latestHighPriority && latestHighPriority.id !== lastPlayedId.current) {
            audio?.play().catch(e => console.log("Audio play blocked", e));
            lastPlayedId.current = latestHighPriority.id;
        }
    }, [notifications]);

    const fetchNotifications = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/notifications/admin/all`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/notifications/admin/${id}/read`, {
                method: 'PATCH'
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/notifications/admin/read-all`, {
                method: 'PATCH'
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error("Failed to mark all as read");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-white border border-orange-100 rounded-2xl text-brand-maroon hover:bg-orange-50 transition-all shadow-sm group"
            >
                <Bell size={22} className={cn("group-hover:rotate-12 transition-transform", unreadCount > 0 && "animate-bounce")} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-2 ring-brand-orange/20">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl shadow-orange-950/20 border border-orange-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-6 bg-orange-100/10 border-b border-orange-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-brand-maroon uppercase tracking-wider">Notifications</h3>
                            <p className="text-[10px] text-orange-900/40 font-bold uppercase tracking-widest mt-1">
                                {unreadCount} Unread Alerts
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="text-[10px] font-black text-brand-orange hover:text-brand-maroon uppercase tracking-widest flex items-center gap-1 transition-colors"
                            >
                                {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={14} />}
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="mx-auto text-orange-200 mb-4" size={40} />
                                <p className="text-xs font-bold text-orange-900/40 uppercase tracking-widest">No alerts yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-orange-50">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "p-5 flex gap-4 hover:bg-orange-50/30 transition-colors relative group",
                                            !n.isRead && "bg-orange-50/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
                                            n.type === 'NEW_ORDER' ? 'bg-orange-50 text-brand-orange' : 'bg-blue-50 text-blue-500'
                                        )}>
                                            <ShoppingBag size={20} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-xs font-bold leading-relaxed", !n.isRead ? "text-brand-maroon" : "text-brand-maroon/60")}>
                                                {n.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] text-orange-900/30 font-black uppercase tracking-widest flex items-center gap-2">
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {n.priority === 'HIGH' && (
                                                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] rounded-md border border-red-200">URGENT</span>
                                                    )}
                                                </p>
                                                {n.orderId && (
                                                    <Link
                                                        href={`/orders/${n.orderId}`}
                                                        onClick={() => {
                                                            markAsRead(n.id);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-[9px] font-black text-brand-orange hover:underline uppercase tracking-widest"
                                                    >
                                                        View Order
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-brand-orange mt-1 group-hover:hidden" />
                                        )}
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className={cn(
                                                "hidden group-hover:flex absolute right-4 top-4 text-orange-900/20 hover:text-brand-orange transition-colors",
                                                n.isRead && "hidden"
                                            )}
                                        >
                                            <CheckCheck size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-orange-100/5 text-center border-t border-orange-100">
                        <Link
                            href="/orders"
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] font-black text-brand-maroon/40 hover:text-brand-maroon uppercase tracking-widest transition-colors"
                        >
                            View Order History
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
