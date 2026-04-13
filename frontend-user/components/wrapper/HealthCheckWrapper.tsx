"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import Maintenance from "@/components/layout/Maintenance";



export default function HealthCheckWrapper({ children }: { children: React.ReactNode }) {
    const [isServerDown, setIsServerDown] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkHealth = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                // Use fetch with a catch to prevent dev-mode overlay leaks
                const response = await fetch(`${API_URL}/health`, { 
                    signal: controller.signal,
                    cache: 'no-store' 
                }).catch(() => {
                    return { ok: false }; // Silent fail for network errors
                });
                
                clearTimeout(timeoutId);
                
                if (isMounted) {
                    if (!('ok' in response) || !response.ok) {
                        setIsServerDown(true);
                    } else {
                        setIsServerDown(false);
                    }
                }
            } catch (error) {
                if (isMounted) setIsServerDown(true);
            } finally {
                if (isMounted) setChecking(false);
            }
        };

        checkHealth();

        const interval = setInterval(checkHealth, 30000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (isServerDown) {
        return <Maintenance />;
    }

    return <>{children}</>;
}
