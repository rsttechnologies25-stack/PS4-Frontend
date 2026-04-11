"use client";

import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { Bell, CheckCircle2, ChevronRight, ShoppingBag, Truck, Package, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';

const getIcon = (type: string) => {
    switch (type) {
        case 'ORDER_CONFIRMED': return <Package className="text-blue-500" size={20} />;
        case 'ORDER_SHIPPED': return <Truck className="text-orange-500" size={20} />;
        case 'ORDER_DELIVERED': return <CheckCircle2 className="text-green-500" size={20} />;
        case 'ORDER_CANCELLED': return <XCircle className="text-red-500" size={20} />;
        default: return <Bell className="text-primary" size={20} />;
    }
};

export default function NotificationsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-primary" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#8B4513] mb-2 accent-font uppercase">Stay Updated</h1>
                    <p className="text-[#8B4513]/60 mb-6">Please login to view your order updates and personalized notifications.</p>
                    <Link href="/login" className="inline-block bg-primary text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFBF5] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#8B4513] uppercase tracking-tighter accent-font">
                            Notifications
                        </h1>
                        <p className="text-[#8B4513]/60 font-medium">
                            {unreadCount > 0 ? `You have ${unreadCount} unread updates` : 'Catch up on your order progress'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
                        >
                            Mark all as Read
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {isLoading && notifications.length === 0 ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-24 bg-white/50 animate-pulse rounded-xl border border-[#8B4513]/5" />
                        ))
                    ) : notifications.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-[#8B4513]/10 shadow-sm mt-12">
                            <div className="w-20 h-20 bg-[#FFFBF5] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="text-[#8B4513]/20" size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-[#8B4513] mb-2 uppercase tracking-wide">No Notifications</h2>
                            <p className="text-[#8B4513]/50 max-w-xs mx-auto">We'll alert you here when your order status changes or when we have special updates for you.</p>
                            <Link href="/shop" className="inline-block mt-8 text-primary font-black uppercase tracking-widest text-xs hover:underline">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        notifications.map((notif, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={notif.id}
                                className={`group relative bg-white rounded-2xl border transition-all duration-300 ${!notif.isRead ? 'border-primary shadow-md' : 'border-[#8B4513]/10 shadow-sm opacity-80 hover:opacity-100 hover:border-primary/30'}`}
                            >
                                <div className="p-4 sm:p-5 flex gap-4">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${!notif.isRead ? 'bg-primary/10' : 'bg-[#FFFBF5]'}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-[13px] sm:text-sm leading-snug ${!notif.isRead ? 'text-[#8B4513] font-bold' : 'text-[#8B4513]/80 font-medium'}`}>
                                                {notif.message}
                                            </p>
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="text-[10px] font-bold text-primary hover:underline uppercase flex-shrink-0 ml-2"
                                                >
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-1.5 text-[10px] text-[#8B4513]/40 font-bold uppercase tracking-widest">
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                            </div>
                                            {notif.orderId && (
                                                <Link
                                                    href={`/orders/${notif.orderId}`}
                                                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                                                    className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-2 transition-all"
                                                >
                                                    Order Details <ChevronRight size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
