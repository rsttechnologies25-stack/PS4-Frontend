"use client";

import { AlertTriangle, RefreshCw, Smartphone } from "lucide-react";
import Image from "next/image";

export default function Maintenance() {
    return (
        <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
                {/* Logo or Brand Element */}
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-xl shadow-orange-100/50">
                        <AlertTriangle size={48} />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-[#2D1B0E] mb-4 tracking-tight uppercase">
                    Under Maintenance
                </h1>
                
                <p className="text-[#6B4F3B] text-lg mb-10 font-medium leading-relaxed">
                    Our digital sweet shop is currently getting a quick makeover. 
                    We'll be back online with fresh treats shortly!
                </p>

                <div className="space-y-4">
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-[#A85D2A] hover:bg-[#8B4A1E] text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-orange-200"
                    >
                        <RefreshCw size={20} className="animate-spin-slow" />
                        Check Connection
                    </button>
                    
                    <div className="pt-8 border-t border-orange-200 mt-8">
                        <p className="text-xs text-[#A85D2A]/60 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <Smartphone size={14} /> Need immediate help?
                        </p>
                        <p className="text-sm text-[#A85D2A] font-black mt-2">
                            Contact Support: +91 92824 45577
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-5 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
