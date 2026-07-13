"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";

interface ToastProps {
    show: boolean;
    message: string;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ show, message, onClose, duration = 3000 }: ToastProps) {
    const [progress, setProgress] = useState(100);
    const router = useRouter();

    useEffect(() => {
        if (show) {
            setProgress(100);
            const interval = 10;
            const step = (interval / duration) * 100;

            const timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - step;
                });
            }, interval);

            const hideTimer = setTimeout(() => {
                onClose();
            }, duration);

            return () => {
                clearInterval(timer);
                clearTimeout(hideTimer);
            };
        }
    }, [show, duration, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
                    animate={{ opacity: 1, y: -20, scale: 1, x: "-50%" }}
                    exit={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
                    className="fixed bottom-10 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm"
                >
                    <div 
                        onClick={() => {
                            router.push("/cart");
                            onClose();
                        }}
                        className="relative overflow-hidden bg-[#8B4513]/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-4 flex items-center gap-4 text-white cursor-pointer hover:bg-[#8B4513] transition-all"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#8B4513] flex items-center justify-center shadow-lg shrink-0">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-grow">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#EA580C]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Cart Updated</p>
                            </div>
                            <p className="text-sm font-bold outfit mt-0.5">{message}</p>
                        </div>

                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group z-10"
                        >
                            <X className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                        </button>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-transparent via-[#EA580C] to-white/40"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
