"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, X } from "lucide-react";

interface SiteSettings {
    deliveryPopupEnabled: boolean;
    deliveryPopupTitle: string;
    deliveryPopupContent: string;
}

export default function DeliveryPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:4000/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);

                    // Only show if enabled
                    if (data.deliveryPopupEnabled) {
                        const timer = setTimeout(() => {
                            setIsOpen(true);
                        }, 500);
                        return () => clearTimeout(timer);
                    }
                }
            } catch (error) {
                console.error("Error fetching delivery settings:", error);
            }
        };

        fetchSettings();
    }, []);

    if (!isOpen || !settings) return null;

    // Split content by \n and handle bullet points
    const lines = settings.deliveryPopupContent.split('\n');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-md bg-[#FDFBF7] border-4 border-[#8B4513] p-5 md:p-8 shadow-2xl rounded-sm"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-3 right-3 text-[#8B4513] hover:bg-[#8B4513]/10 p-1 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 md:mb-6 text-[#8B4513]">
                        <Truck className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                        <h3 className="text-lg md:text-xl font-bold serif">{settings.deliveryPopupTitle}</h3>
                    </div>

                    {/* Content */}
                    <ul className="space-y-3 md:space-y-4 text-gray-800 font-sans text-sm md:text-[15px] leading-relaxed">
                        {lines.map((line, index) => {
                            const isBullet = line.trim().startsWith('•');
                            const content = isBullet ? line.trim().substring(1).trim() : line.trim();

                            // Simple bolding for labels (e.g. "Chennai:")
                            const parts = content.split(':');
                            const hasLabel = parts.length > 1 && parts[0].length < 20;

                            return (
                                <li key={index} className="flex gap-2 md:gap-3 items-start">
                                    <span className="text-[#8B4513] text-lg leading-none">•</span>
                                    <span>
                                        {hasLabel ? (
                                            <>
                                                <span className="font-bold">{parts[0]}:</span>
                                                {parts.slice(1).join(':')}
                                            </>
                                        ) : content}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
