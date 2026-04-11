"use client";

import NotificationBell from "./NotificationBell";
import { User } from "lucide-react";

export default function Header() {
    return (
        <header className="flex items-center justify-between py-6 px-10 bg-white/50 backdrop-blur-md sticky top-0 z-40 border-b border-orange-100/30 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-maroon flex items-center justify-center text-white shadow-lg shadow-orange-950/20">
                    <User size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Management Portal</p>
                    <p className="text-sm font-black text-brand-maroon outfit">Administrator</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <NotificationBell />
            </div>
        </header>
    );
}
