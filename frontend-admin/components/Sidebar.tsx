"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingBag,
    Layers,
    MapPin,
    Star,
    LogOut,
    ChevronRight,
    Trophy,
    Settings,
    Ticket,
    Truck,
    Megaphone,
    ImageIcon,
    LayoutGrid,
    MessageCircle,
    User,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: LayoutDashboard, label: "DASHBOARD", href: "/" },
    { icon: ShoppingBag, label: "ORDERS", href: "/orders" },
    { icon: ShoppingBag, label: "PRODUCTS", href: "/products" },
    { icon: Layers, label: "CATEGORIES", href: "/categories" },
    { icon: Ticket, label: "COUPONS", href: "/coupons" },
    { icon: Truck, label: "SHIPPING", href: "/shipping" },
    { icon: MapPin, label: "BRANCHES", href: "/branches" },
    { icon: Star, label: "REVIEWS", href: "/reviews" },
    { icon: ImageIcon, label: "HERO BANNERS", href: "/hero-banners" },
    { icon: LayoutGrid, label: "SUGGESTIONS", href: "/category-pairings" },
    { icon: Megaphone, label: "ANNOUNCEMENTS", href: "/announcements" },
    { icon: MessageCircle, label: "WHATSAPP", href: "/whatsapp-templates" },
    { icon: User, label: "CUSTOMERS", href: "/customers" },
    { icon: Settings, label: "ADMIN PROFILE", href: "/account" },
    { icon: Settings, label: "SITE SETTINGS", href: "/settings" },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        window.location.href = "/login";
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[45] lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={cn(
                "w-80 h-screen bg-[#7C2D12] flex flex-col fixed left-0 top-0 shadow-2xl z-50 border-r border-white/5 transition-transform duration-300 lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden absolute top-6 right-6 p-2 text-white/50 hover:text-white rounded-xl bg-black/10 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Logo Section */}
                <div className="p-10">
                    <div className="flex flex-col items-center text-center gap-6 mb-2">
                        <div className="relative group">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(234,88,12,0.15)] border-2 border-brand-orange/20 p-1.5 md:p-2 transform group-hover:rotate-6 transition-all duration-500 overflow-hidden bg-gradient-to-br from-white to-orange-50">
                                <div className="absolute inset-0 bg-brand-orange opacity-0 group-hover:opacity-5 transition-opacity" />
                                <div className="flex flex-col items-center justify-center -space-y-1">
                                    <span className="text-3xl md:text-4xl font-black text-[#7C2D12] tracking-tighter outfit">PS4</span>
                                    <div className="h-0.5 md:h-1 w-6 md:w-8 bg-brand-orange rounded-full group-hover:w-12 transition-all duration-500" />
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-brand-orange rounded-xl flex items-center justify-center text-white shadow-lg animate-pulse">
                                <Star size={10} className="md:w-3.5 md:h-3.5" fill="currentColor" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white tracking-widest leading-none outfit drop-shadow-lg">
                                PORTAL
                            </h2>
                            <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.5em] opacity-80">
                                ADMINISTRATION
                            </p>
                        </div>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-10" />
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-brand-orange text-white shadow-xl shadow-black/20 translate-x-1"
                                        : "text-white/80 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <item.icon size={26} className={cn(
                                        "transition-transform duration-300 group-hover:scale-110",
                                        isActive ? "text-white" : "text-brand-orange"
                                    )} />
                                    <span className="font-black text-sm tracking-[0.2em] outfit">
                                        {item.label}
                                    </span>
                                </div>
                                {isActive && <ChevronRight size={20} className="text-white/50" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Section */}
                <div className="p-8 border-t border-white/10 bg-black/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-5 text-white/70 hover:bg-red-600 hover:text-white rounded-2xl transition-all duration-300 group shadow-lg"
                    >
                        <LogOut size={26} className="group-hover:rotate-12 transition-transform" />
                        <span className="font-black text-xs tracking-widest uppercase">Logout Portal</span>
                    </button>
                </div>
            </div>
        </>
    );
}
