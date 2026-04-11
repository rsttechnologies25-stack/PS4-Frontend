"use client";

import Link from "next/link";
import { Mail, Heart } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-8 px-10 border-t border-brand-maroon/5 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <span>Made with</span>
                    <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
                    <span>by</span>
                    <Link
                        href="https://rexonsofttech.in/"
                        target="_blank"
                        className="font-black text-brand-maroon hover:text-brand-orange transition-colors outfit tracking-wider"
                    >
                        RST Technologies
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail size={16} className="text-brand-orange" />
                        <a
                            href="mailto:info@rexonsofttech.in"
                            className="hover:text-brand-maroon transition-colors"
                        >
                            info@rexonsofttech.in
                        </a>
                    </div>

                    <div className="h-4 w-px bg-gray-200 hidden md:block" />

                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                        &copy; {new Date().getFullYear()} PS4 Platform
                    </p>
                </div>
            </div>
        </footer>
    );
}
