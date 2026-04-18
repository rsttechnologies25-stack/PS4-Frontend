"use client";

import { useEffect, useState } from "react";import { API_URL } from "@/lib/api";

import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Calendar, Package, ChevronRight, Loader2, Info, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { formatImageUrl } from "@/lib/imageHelper";



interface Order {
    id: string;
    readableId?: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: {
        id: string;
        productId?: string;
        productName?: string;
        weight: string;
        price: number;
        quantity: number;
        product?: {
            name: string;
            image: string;
            slug: string;
            categoryId?: string;
            category?: {
                name: string;
            }
        }
    }[]
}

export default function OrdersPage() {
    const { user, token } = useAuth();
    const { addToCart } = useCart();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
                <Loader2 className="w-10 h-10 text-[#8B4513] animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center bg-[#FFFBF5]">
                <Info size={48} className="text-[#8B4513] mb-4 opacity-20" />
                <h1 className="text-3xl font-black text-[#8B4513] uppercase tracking-tight mb-4">Please log in to view orders</h1>
                <Link href="/login" className="bg-[#8B4513] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-black transition-all">
                    Log In Now
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFFBF5] pt-24 md:pt-32 pb-20 px-4 md:px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="flex items-center gap-4 mb-10 border-b border-[#8B4513]/10 pb-8">
                    <div className="p-4 bg-[#8B4513] rounded-2xl text-white shadow-xl">
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[#8B4513] uppercase tracking-tight outfit">My Order History</h1>
                        <p className="text-[#EA580C] font-black text-[10px] tracking-[0.3em] uppercase mt-1">Track your sweet deliveries</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-[#8B4513]/5 rounded-3xl shadow-sm">
                        <Package size={64} className="mx-auto text-gray-200 mb-6" />
                        <h2 className="text-xl font-bold text-gray-500 mb-6">No orders found yet</h2>
                        <Link href="/" className="bg-[#8B4513] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-black transition-all uppercase tracking-widest text-xs">
                            Start Your First Order
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={order.id}
                                className="bg-white border border-[#8B4513]/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                                                <p className="text-sm font-bold text-[#8B4513]">{order.readableId || "#" + order.id.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                                                <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-[#EA580C]" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</p>
                                                <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                                    <Clock size={14} className="text-[#EA580C]" />
                                                    {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-[#FFF7ED] border border-[#EA580C]/20 rounded-full">
                                            <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-widest leading-none">{order.status}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                    <img src={formatImageUrl(item.product?.image)} alt={item.productName || item.product?.name || 'Product'} className="object-cover w-full h-full" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="text-sm font-bold text-gray-800">{item.productName || item.product?.name || 'Removed Product'}</h3>
                                                    <p className="text-[11px] text-gray-500 font-medium">{item.weight} x {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-black text-[#8B4513]">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                                            <p className="text-2xl font-black text-[#8B4513] serif">₹{order.totalAmount}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <button
                                                onClick={() => {
                                                    order.items.forEach(item => {
                                                        addToCart({
                                                            id: item.productId || item.id,
                                                            name: item.productName || item.product?.name || 'Removed Product',
                                                            price: item.price,
                                                            image: item.product?.image || "",
                                                            weight: item.weight,
                                                            slug: item.product?.slug || '',
                                                            isSoldOut: false
                                                        }, item.quantity);
                                                    });
                                                    router.push("/cart");
                                                }}
                                                className="flex items-center gap-2 px-6 py-2 bg-primary/5 text-primary border border-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all group"
                                            >
                                                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                                Reorder All
                                            </button>
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="flex items-center gap-2 group text-[10px] font-black text-[#EA580C] uppercase tracking-[0.2em] px-4 py-2 hover:bg-[#EA580C]/5 rounded-full transition-all"
                                            >
                                                Order Details
                                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
