"use client";

import { useEffect, useState } from "react";import { API_URL } from "@/lib/api";

import { Volume2 } from "lucide-react";



interface Announcement {
    id: string;
    message: string;
}

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/announcements/active`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setAnnouncements(data);
                }
            })
            .catch(() => { });
    }, []);

    if (announcements.length === 0 || dismissed) return null;

    // Wide separator between each message for breathing room
    const separator = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0★\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";

    // Build a single run of all messages
    const singleRun = announcements.map((a) => a.message).join(separator);

    // Duplicate 4x for a seamless infinite loop
    const fullMarquee = `${singleRun}${separator}${singleRun}${separator}${singleRun}${separator}${singleRun}${separator}`;

    return (
        <div className="w-full bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] overflow-hidden whitespace-nowrap relative shadow-sm">
            {/* Speaker icon on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#EA580C] to-transparent z-10 flex items-center justify-center">
                <Volume2 size={14} className="text-orange-100 animate-pulse" />
            </div>

            {/* Marquee content */}
            <div className="inline-flex marquee-track">
                <span className="inline-block py-3 text-[10px] md:text-[11px] font-bold text-white tracking-[0.05em] md:tracking-[0.1em] pl-12 md:pl-16">
                    {fullMarquee}
                </span>
            </div>

            {/* Close button */}
            <button
                onClick={() => setDismissed(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white transition-colors text-xs px-1.5 py-0.5 rounded"
                aria-label="Dismiss banner"
            >
                ✕
            </button>

            {/* Fade edges */}
            <div className="absolute right-8 top-0 bottom-0 w-12 bg-gradient-to-l from-[#EA580C] to-transparent z-[5]" />

            <style jsx>{`
                @keyframes marqueeScroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .marquee-track {
                    animation: marqueeScroll 45s linear infinite;
                }
                .marquee-track:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
