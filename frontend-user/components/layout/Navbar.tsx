"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

const menuItems = [
    {
        name: "Shop",
        href: "/shop",
        mega: [
            { name: "Sweets", href: "/category/sweets", image: "/hero_motichoor_laddu.jpg" },
            { name: "Snacks", href: "/category/snacks", image: "https://perambursrinivasa.com/cdn/shop/files/PEANUTPAKODA_2.jpg?v=1753018705&width=500" },
            { name: "Savouries", href: "/category/savouries", image: "https://perambursrinivasa.com/cdn/shop/files/ANDHRA_MURUKKU.jpg?v=1753018411&width=500" },
            { name: "Cookies", href: "/category/cookies", image: "https://perambursrinivasa.com/cdn/shop/files/KESAR_BADAM_COOKIES.jpg?v=1753017309&width=500" }
        ]
    },
    { name: "Sweets & Snacks", href: "/category/sweets" },
    { name: "Branches", href: "/branches" },
    { name: "Contact", href: "/contact" },
    { name: "About Us", href: "/about" },
];

export default function Navbar() {
    const [activeMega, setActiveMega] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { totalItems } = useCart();

    return (
        <nav className="sticky top-0 z-50 bg-background border-b border-primary/10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-20 md:h-24 relative">

                    {/* Mobile Menu Button - Left (Mobile Only) */}
                    <div className="flex lg:hidden items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-text hover:text-primary p-2 -ml-2 transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Logo - Left aligned on desktop, centered on mobile */}
                    <div className="flex-shrink-0 lg:w-64 flex justify-center lg:justify-start">
                        <Link href="/" className="inline-block" onClick={() => setMobileMenuOpen(false)}>
                            <Image
                                src="/logo-v1.png"
                                alt="PS4 Logo"
                                width={180}
                                height={50}
                                className="h-10 md:h-14 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Navigation - Centered */}
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
                                                    <div className="grid grid-cols-4 gap-4">
                                                        {item.mega.map((sub: any) => (
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

                    {/* Right: Icons */}
                    <div className="flex justify-end items-center gap-3 md:gap-6 lg:w-64">
                        <button className="text-text hover:text-primary transition-colors hidden sm:block">
                            <Search size={22} strokeWidth={1.5} />
                        </button>
                        <button className="text-text hover:text-primary transition-colors hidden sm:block">
                            <User size={22} strokeWidth={1.5} />
                        </button>
                        <Link href="/cart" className="text-text hover:text-primary transition-colors relative p-2" onClick={() => setMobileMenuOpen(false)}>
                            <ShoppingBag size={22} strokeWidth={1.5} />
                            {totalItems > 0 && (
                                <span className="absolute top-1 right-1 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>

                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 top-20 bg-[#FFFBF5] z-40 lg:hidden overflow-y-auto"
                    >
                        <div className="flex flex-col p-6 gap-2">
                            {menuItems.map((item) => (
                                <div key={item.name} className="border-b border-primary/5 last:border-0 text-left">
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="py-4 flex items-center justify-between text-lg font-medium text-text hover:text-primary transition-colors accent-font uppercase tracking-wide"
                                    >
                                        {item.name}
                                        {item.mega && <ChevronDown size={18} />}
                                    </Link>

                                    {item.mega && (
                                        <div className="grid grid-cols-2 gap-4 pb-6 px-2">
                                            {item.mega.map((sub: any) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex flex-col gap-2"
                                                >
                                                    <div className="relative aspect-square rounded-lg overflow-hidden border border-primary/10">
                                                        <Image src={sub.image} alt={sub.name} fill className="object-cover" />
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-center text-text-muted uppercase tracking-wider">{sub.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="mt-8 flex flex-col gap-4">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 py-3 px-4 rounded-lg bg-primary/5 text-primary font-bold"
                                >
                                    <User size={20} /> Login / Register
                                </Link>
                                <button className="flex items-center gap-3 py-3 px-4 rounded-lg bg-primary/5 text-primary font-bold text-left">
                                    <Search size={20} /> Search Products
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
