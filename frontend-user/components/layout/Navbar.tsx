"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, ChevronDown, Menu, X, MapPin, Bell, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useLocation } from "@/context/LocationContext";
import SearchModal from "./SearchModal";
import { formatDistanceToNow } from 'date-fns';

interface MegaItem {
    name: string;
    href: string;
    image: string;
}

const menuItems = [
    {
        name: "Shop",
        href: "/shop",
        mega: [
            { name: "Sweets", href: "/category/sweets", image: "/hero_motichoor_laddu.jpg" },
            { name: "Savouries", href: "/category/savouries", image: "https://perambursrinivasa.com/cdn/shop/files/ANDHRA_MURUKKU.jpg?v=1753018411" },
            { name: "Sev", href: "/category/sev", image: "https://perambursrinivasa.com/cdn/shop/files/MINI_KARA_SEV.jpg?v=1753017794" },
            { name: "Pickle", href: "/category/pickle", image: "https://perambursrinivasa.com/cdn/shop/files/image6.webp?v=1746161359" },
            { name: "Podi", href: "/category/podi", image: "https://perambursrinivasa.com/cdn/shop/files/IDLY_PODI_34e04bc4-aee0-42a9-949a-2bd13815a4f1.jpg?v=1753016470" },
            { name: "Cookies", href: "/category/cookies", image: "https://perambursrinivasa.com/cdn/shop/files/KESAR_BADAM_COOKIES.jpg?v=1753017309" },
            { name: "Gifting", href: "/category/gifting", image: "https://perambursrinivasa.com/cdn/shop/files/KESAR_BADAM_COOKIES.jpg?v=1753017309" },
            { name: "Outdoor Catering", href: "/category/outdoor-catering", image: "https://perambursrinivasa.com/cdn/shop/files/KESAR_BADAM_COOKIES.jpg?v=1753017309" }
        ]
    },
    { name: "Best Sellers", href: "/shop?filter=best-seller" },
    { name: "Branches", href: "/branches" },
    { name: "Contact", href: "/contact" },
    { name: "About Us", href: "/about" },
];

export default function Navbar() {
    const [activeMega, setActiveMega] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifMenuOpen, setNotifMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { totalItems } = useCart();
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { location, setShowLocationModal } = useLocation();
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev =>
            prev.includes(name)
                ? prev.filter(m => m !== name)
                : [...prev, name]
        );
    };

    return (
        <nav className="sticky top-0 z-50 bg-background border-b border-primary/10">
            <div className="container mx-auto px-4">
                {/* Main Header Row */}
                <div className="flex items-center justify-between h-20 md:h-24 relative">

                    {/* Mobile: Left Menu Button */}
                    <div className="flex lg:hidden flex-1 justify-start">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-text hover:text-primary p-2 -ml-2 transition-colors"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>

                    {/* Logo Area (Centered on Mobile, Left on Desktop) */}
                    <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:flex-shrink-0 flex flex-col items-center justify-center lg:items-start lg:w-64 z-10">
                        <Link href="/" className="inline-block" onClick={() => setMobileMenuOpen(false)}>
                            <Image
                                src="/logo-v1.png"
                                alt="PS4 Logo"
                                width={180}
                                height={60}
                                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                                priority
                            />
                        </Link>
                        {/* Desktop-only location */}
                        <button
                            onClick={() => setShowLocationModal(true)}
                            className="hidden lg:flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-wider hover:text-[#C2410C] transition-colors mt-1 max-w-[200px]"
                        >
                            <MapPin size={12} className="flex-shrink-0" />
                            <span className="truncate">{location ? `${location.areaName}${location.pincode ? `, ${location.pincode}` : ""}` : "Select Location"}</span>
                        </button>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div className="flex-1 flex justify-center">
                        <ul className="hidden lg:flex items-center gap-6 xl:gap-8">
                            {menuItems.map((item) => (
                                <li
                                    key={item.name}
                                    onMouseEnter={() => item.mega && setActiveMega(item.name)}
                                    onMouseLeave={() => setActiveMega(null)}
                                    className="relative"
                                >
                                    <Link
                                        href={item.href}
                                        className="text-[15px] tracking-wide font-medium text-text hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap uppercase accent-font"
                                    >
                                        {item.name}
                                        {item.mega && <ChevronDown size={14} className="opacity-50" />}
                                    </Link>

                                    <AnimatePresence>
                                        {activeMega === item.name && item.mega && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute left-1/2 -translate-x-1/2 top-full pt-4 min-w-[500px]"
                                            >
                                                <div className="bg-[#FFFBF5] shadow-2xl p-6 border border-[#8B4513]/20 rounded-sm">
                                                    <div className="grid grid-cols-4 gap-6">
                                                        {item.mega.map((sub: MegaItem) => (
                                                            <Link
                                                                key={sub.name}
                                                                href={sub.href}
                                                                className="group flex flex-col items-center gap-3 p-2 rounded hover:bg-[#8B4513]/5 transition-colors"
                                                            >
                                                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#8B4513]/10 group-hover:border-[#8B4513] transition-colors shadow-sm">
                                                                    <Image
                                                                        src={sub.image}
                                                                        alt={sub.name}
                                                                        fill
                                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-medium text-[#8B4513] uppercase tracking-wider accent-font group-hover:text-[#EA580C] transition-colors text-center">
                                                                    {sub.name}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Icons (Mobile + Desktop) */}
                    <div className="flex-1 lg:flex-none flex justify-end items-center gap-1.5 sm:gap-4 md:gap-6 lg:w-64">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="text-text hover:text-primary transition-colors hidden sm:block"
                        >
                            <Search size={22} strokeWidth={1.5} />
                        </button>

                        <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                            <Link href={user ? "#" : "/login"} className="text-text hover:text-primary transition-colors flex items-center gap-1 uppercase text-[10px] font-black tracking-widest p-1">
                                <User size={20} strokeWidth={1.5} className="md:w-5 md:h-5" />
                                {user && <span className="hidden xl:block">{user.name?.split(' ')[0]}</span>}
                            </Link>

                            <AnimatePresence>
                                {userMenuOpen && user && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-full pt-4 w-48"
                                    >
                                        <div className="bg-white shadow-2xl p-4 border border-[#8B4513]/10 rounded-sm">
                                            <div className="space-y-3">
                                                <Link href="/orders" className="block text-[10px] font-black text-[#8B4513] uppercase tracking-widest hover:text-[#EA580C] transition-colors">
                                                    My Orders
                                                </Link>
                                                <Link href="/notifications" className="block lg:hidden text-[10px] font-black text-[#8B4513] uppercase tracking-widest hover:text-[#EA580C] transition-colors">
                                                    Notifications
                                                </Link>
                                                <button
                                                    onClick={logout}
                                                    className="w-full text-left text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-red-800 transition-colors"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notification Bell */}
                        {user && (
                            <div className="relative" onMouseEnter={() => setNotifMenuOpen(true)} onMouseLeave={() => setNotifMenuOpen(false)}>
                                <button className="text-text hover:text-primary transition-colors relative p-1 mt-1">
                                    <Bell size={20} strokeWidth={1.5} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-primary text-white text-[8px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold px-0.5 border border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {notifMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-[-60px] top-full pt-4 w-80 z-[60]"
                                        >
                                            <div className="bg-white shadow-2xl border border-[#8B4513]/10 rounded-lg overflow-hidden flex flex-col max-h-[400px]">
                                                <div className="p-3 border-b border-[#8B4513]/5 bg-[#FFFBF5] flex justify-between items-center">
                                                    <h3 className="text-[10px] font-black text-[#8B4513] uppercase tracking-widest">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="text-[9px] font-bold text-primary hover:underline uppercase"
                                                        >
                                                            Mark all as read
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="overflow-y-auto custom-scrollbar flex-1">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-8 text-center">
                                                            <Bell size={24} className="mx-auto text-[#8B4513]/20 mb-2" />
                                                            <p className="text-xs text-[#8B4513]/60 italic font-medium">No updates yet</p>
                                                        </div>
                                                    ) : (
                                                        notifications.slice(0, 5).map((notif) => (
                                                            <div
                                                                key={notif.id}
                                                                className={`p-3 border-b border-[#8B4513]/5 last:border-0 hover:bg-[#8B4513]/5 transition-colors cursor-pointer group ${!notif.isRead ? 'bg-[#EA580C]/5 border-l-4 border-l-primary' : ''}`}
                                                                onClick={async () => {
                                                                    if (!notif.isRead) await markAsRead(notif.id);
                                                                    if (notif.orderId) window.location.href = `/orders/${notif.orderId}`;
                                                                }}
                                                            >
                                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                                    <p className={`text-[11px] leading-tight ${!notif.isRead ? 'font-bold text-[#8B4513]' : 'font-medium text-[#8B4513]/80'}`}>
                                                                        {notif.message}
                                                                    </p>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <p className="text-[9px] text-[#8B4513]/50 font-medium">
                                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                                    </p>
                                                                    {notif.orderId && (
                                                                        <span className="text-[9px] font-bold text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            View Order <ExternalLink size={8} />
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <Link
                                                    href="/notifications"
                                                    className="p-2.5 text-center bg-[#8B4513]/5 hover:bg-[#8B4513]/10 transition-colors border-t border-[#8B4513]/5 text-[10px] font-black text-[#8B4513] uppercase tracking-widest"
                                                    onClick={() => setNotifMenuOpen(false)}
                                                >
                                                    View All Notifications
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <Link href="/cart" className="text-text hover:text-primary transition-colors relative p-1" onClick={() => setMobileMenuOpen(false)}>
                            <ShoppingBag size={20} strokeWidth={1.5} className="md:w-5 md:h-5" />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 bg-primary text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Mobile Second Row: Location Pill (HIDDEN as per request) */}
                {/* 
                <div className="flex lg:hidden items-center justify-center pb-3 -mt-2">
                    <button
                        onClick={() => setShowLocationModal(true)}
                        className="flex items-center gap-1.5 text-[7px] min-[375px]:text-[8.5px] font-black text-primary uppercase tracking-[0.15em] max-w-[90vw] truncate bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 transition-all hover:bg-primary/10 shadow-sm"
                    >
                        <MapPin size={9} className="flex-shrink-0" />
                        <span className="truncate">{location ? `${location.areaName}` : "Set Delivery Location"}</span>
                        <ChevronDown size={9} className="ml-0.5 opacity-50" />
                    </button>
                </div> 
                */}
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 top-24 bg-[#FFFBF5] z-40 lg:hidden overflow-y-auto"
                    >
                        <div className="flex flex-col p-6 gap-2">
                            {/* Mobile Location Info inside Menu */}
                            <div className="mb-2">
                                <button
                                    onClick={() => {
                                        setShowLocationModal(true);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 text-primary"
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Delivering To</p>
                                            <p className="text-xs font-bold truncate max-w-[180px]">
                                                {location ? `${location.areaName}` : "Set Delivery Location"}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronDown size={14} className="opacity-50" />
                                </button>
                            </div>

                            {/* Mobile Search inside Menu */}
                            <div className="mb-4">
                                <button
                                    onClick={() => {
                                        setSearchOpen(true);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-primary/5 border border-primary/10 text-primary font-bold text-left uppercase text-xs tracking-widest transition-all hover:bg-primary/10 hover:border-primary/20"
                                >
                                    <Search size={18} /> Search Products
                                </button>
                            </div>

                            {menuItems.map((item) => (
                                <div key={item.name} className="border-b border-primary/5 last:border-0 text-left">
                                    <div className="flex items-center justify-between py-4">
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-lg font-medium text-text hover:text-primary transition-colors accent-font uppercase tracking-wide flex-1"
                                        >
                                            {item.name}
                                        </Link>
                                        {item.mega && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleMenu(item.name);
                                                }}
                                                className="p-2 -mr-2 text-primary/50 hover:text-primary transition-colors"
                                            >
                                                <ChevronDown
                                                    size={22}
                                                    className={`transition-transform duration-300 ${expandedMenus.includes(item.name) ? "rotate-180" : ""}`}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {item.mega && expandedMenus.includes(item.name) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="grid grid-cols-2 gap-4 pb-6 px-2">
                                                    {item.mega.map((sub: MegaItem) => (
                                                        <Link
                                                            key={sub.name}
                                                            href={sub.href}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setMobileMenuOpen(false);
                                                            }}
                                                            className="flex flex-col gap-2 group"
                                                        >
                                                            <div className="relative aspect-square rounded-lg overflow-hidden border border-primary/10">
                                                                <Image src={sub.image} alt={sub.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            </div>
                                                            <span className="text-[10px] font-semibold text-center text-text-muted uppercase tracking-wider group-hover:text-primary transition-colors">{sub.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}

                            <div className="mt-8 flex flex-col gap-4">
                                {user ? (
                                    <>
                                        <Link
                                            href="/orders"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 py-3 px-4 rounded-lg bg-primary/5 text-primary font-bold uppercase text-xs tracking-widest"
                                        >
                                            <ShoppingBag size={20} /> My Orders
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 py-3 px-4 rounded-lg bg-red-50 text-red-600 font-bold uppercase text-xs tracking-widest text-left"
                                        >
                                            <User size={20} /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 py-3 px-4 rounded-lg bg-primary/5 text-primary font-bold uppercase text-xs tracking-widest"
                                    >
                                        <User size={20} /> Login / Register
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </nav >
    );
}
