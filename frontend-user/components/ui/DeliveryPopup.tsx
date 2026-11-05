"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, X } from "lucide-react";

import { API_URL } from "@/lib/api";

interface SiteSettings {
    deliveryPopupEnabled: boolean;
    deliveryPopupTitle: string;
    deliveryPopupContent: string;
}

// In-memory flag in the JavaScript runtime:
// - Persists while navigating between pages/tabs inside the single-page application.
// - Automatically resets to false when the entire site is refreshed (F5/reload) or opened again in a new window/tab.
let hasDismissedDeliveryPopup = false;

export default function DeliveryPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        // If already closed during this session, do not show again until page refresh
        if (hasDismissedDeliveryPopup) return;

        let isMounted = true;
        let timer: NodeJS.Timeout | null = null;

        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/settings`);
                if (res.ok && isMounted) {
                    const data = await res.json();
                    setSettings(data);

                    // Only show if enabled in admin and user hasn't closed it in this session
                    if (data.deliveryPopupEnabled && !hasDismissedDeliveryPopup) {
                        timer = setTimeout(() => {
                            if (isMounted && !hasDismissedDeliveryPopup) {
                                setIsOpen(true);
                            }
                        }, 500);
                    }
                }
            } catch (error) {
                console.error("Error fetching delivery settings:", error);
            }
        };

        fetchSettings();

        return () => {
            isMounted = false;
            if (timer) clearTimeout(timer);
        };
    }, []);

    const handleClose = () => {
        hasDismissedDeliveryPopup = true;
        setIsOpen(false);
    };

    if (!isOpen || !settings || hasDismissedDeliveryPopup) return null;

    // Split content by \n and handle bullet points
    const lines = (settings.deliveryPopupContent || "").split('\n').filter(Boolean);

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md bg-[#FDFBF7] border-4 border-[#8B4513] p-5 md:p-8 shadow-2xl rounded-sm"
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute top-3 right-3 text-[#8B4513] hover:bg-[#8B4513]/10 p-1.5 rounded-full transition-colors cursor-pointer"
                        title="Close Notification"
                        aria-label="Close Delivery Notification"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 md:mb-6 text-[#8B4513]">
                        <Truck className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                        <h3 className="text-lg md:text-xl font-bold serif">{settings.deliveryPopupTitle || "Delivery Notification"}</h3>
                    </div>

                    {/* Content */}
                    <ul className="space-y-3 md:space-y-4 text-gray-800 font-sans text-sm md:text-[15px] leading-relaxed">
                        {lines.map((line, index) => {
                            const isBullet = line.trim().startsWith('•') || line.trim().startsWith('❖');
                            const content = isBullet ? line.trim().substring(1).trim() : line.trim();

                            // Simple bolding for labels (e.g. "Chennai:")
                            const parts = content.split(':');
                            const hasLabel = parts.length > 1 && parts[0].length < 25;

                            return (
                                <li key={index} className="flex gap-2 md:gap-3 items-start">
                                    <span className="text-[#8B4513] text-lg leading-none select-none">•</span>
                                    <span>
                                        {hasLabel ? (
                                            <>
                                                <span className="font-bold text-gray-900">{parts[0]}:</span>
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
