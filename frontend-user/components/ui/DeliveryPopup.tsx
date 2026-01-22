"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, X } from "lucide-react";

export default function DeliveryPopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show popup after a short delay on mount
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (!isOpen) return null;

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
                        <h3 className="text-lg md:text-xl font-bold serif">Delivery Notification!</h3>
                    </div>

                    {/* Content */}
                    <ul className="space-y-3 md:space-y-4 text-gray-800 font-sans text-sm md:text-[15px] leading-relaxed">
                        <li className="flex gap-2 md:gap-3 items-start">
                            <span className="text-[#8B4513] text-lg leading-none">•</span>
                            <span>
                                <span className="font-bold">Chennai:</span> Order before 3:00 PM
                                for next-day delivery by 7PM.
                            </span>
                        </li>
                        <li className="flex gap-2 md:gap-3 items-start">
                            <span className="text-[#8B4513] text-lg leading-none">•</span>
                            <span>
                                <span className="font-bold">Rest of India:</span> Order before
                                3:00 PM for next-day dispatch.
                            </span>
                        </li>
                        <li className="flex gap-2 md:gap-3 items-start">
                            <span className="text-[#8B4513] text-lg leading-none">•</span>
                            <span>
                                <span className="font-bold">Delivery Timeline:</span> Rest of
                                India: 2–4 days. International: 4–6 days (
                                <span className="font-semibold text-xs md:text-sm">Import fees not included</span>).
                            </span>
                        </li>
                    </ul>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
