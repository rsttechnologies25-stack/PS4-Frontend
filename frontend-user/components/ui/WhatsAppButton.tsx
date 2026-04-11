"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

export default function WhatsAppButton() {
    const [whatsappNumber, setWhatsappNumber] = useState("919282445577");
    const message = "Hi! I'd like to know more about your products.";

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.whatsappNumber) {
                        setWhatsappNumber(data.whatsappNumber.replace(/[^0-9]/g, ""));
                    }
                }
            } catch (error) {
                console.error("Error fetching WhatsApp number from settings:", error);
            }
        };

        fetchSettings();
    }, []);

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[100] bg-[#25D366] text-white p-3 sm:p-4 rounded-full shadow-2xl flex items-center justify-center group border-2 sm:border-4 border-white"
            title="Chat on WhatsApp"
        >
            {/* Tooltip */}
            <div className="absolute right-full mr-4 bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 uppercase tracking-widest">
                Chat with us
            </div>

            <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.553 4.197 1.603 6.02L0 24l6.137-1.611a11.787 11.787 0 005.912 1.599h.005c6.634 0 12.048-5.414 12.048-12.05 0-3.218-1.253-6.243-3.528-8.517" />
            </svg>

            {/* Pulsing Ring Effect */}
            <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 -z-10" />
        </motion.a>
    );
}
