import { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { API_URL } from '@/lib/api';

interface DispatchSettings {
    dispatchCutoffHour: number;
    dispatchSundayPolicy: boolean;
    dispatchLimitText: string;
}

export function useDispatchInfo() {
    const { location } = useLocation();
    const [settings, setSettings] = useState<DispatchSettings>({
        dispatchCutoffHour: 14,
        dispatchSundayPolicy: false,
        dispatchLimitText: 'ORDER WITHIN {time} HOURS',
    });
    const [timeLeftString, setTimeLeftString] = useState("");
    const [dispatchLabel, setDispatchLabel] = useState("DISPATCHED BY TODAY");
    const [deliveryEstimate, setDeliveryEstimate] = useState("2-4 Days");
    const [progress, setProgress] = useState(40); // Initial dummy value

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        dispatchCutoffHour: data.dispatchCutoffHour ?? 14,
                        dispatchSundayPolicy: data.dispatchSundayPolicy ?? false,
                        dispatchLimitText: data.dispatchLimitText ?? 'ORDER WITHIN {time} HOURS',
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dispatch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            // Get current time in IST
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
            
            const currentHour = istTime.getHours();
            const currentMinute = istTime.getMinutes();
            const currentDay = istTime.getDay(); // 0 is Sunday
            
            let targetDispatchDay = "TODAY";
            let hoursRemaining = settings.dispatchCutoffHour - currentHour;
            let minutesRemaining = 60 - currentMinute;
            
            // Progress Calculation (0-100)
            // 0-33: Order Stage
            // 33-66: Dispatch Stage
            // 66-100: Delivery Stage
            let currentProgress = 20; // Default

            if (hoursRemaining <= 0) {
                // Past cutoff
                if (currentDay === 6) { // Saturday
                    targetDispatchDay = settings.dispatchSundayPolicy ? "TOMORROW" : "MONDAY";
                } else if (currentDay === 0) { // Sunday
                    targetDispatchDay = settings.dispatchSundayPolicy ? "TODAY" : "TOMORROW";
                } else {
                    targetDispatchDay = "TOMORROW";
                }
                
                setTimeLeftString(""); // Hide countdown if past cutoff today
                currentProgress = 55; // Further into dispatch stage
            } else {
                // Before cutoff
                if (currentDay === 0 && !settings.dispatchSundayPolicy) {
                    targetDispatchDay = "TOMORROW";
                    setTimeLeftString("");
                    currentProgress = 35;
                } else {
                    targetDispatchDay = "TODAY";
                    const h = Math.max(0, hoursRemaining - 1);
                    const m = minutesRemaining % 60;
                    setTimeLeftString(`${h} ${h === 1 ? 'HOUR' : 'HOURS'} ${m} ${m === 1 ? 'MINUTE' : 'MINUTES'}`);
                    
                    // Progress grows as we approach cutoff
                    const percentOfCutoff = (currentHour + (currentMinute/60)) / settings.dispatchCutoffHour;
                    currentProgress = 25 + (percentOfCutoff * 15); // Scale between 25 and 40
                }
            }
            
            setDispatchLabel(`DISPATCH BY ${targetDispatchDay}`);
            setProgress(currentProgress);
        }, 1000);

        return () => clearInterval(timer);
    }, [settings]);

    useEffect(() => {
        if (!location?.pincode) {
            setDeliveryEstimate("2-4 Days");
            return;
        }

        const pincode = location.pincode;
        if (pincode.startsWith('600')) {
            setDeliveryEstimate("24-48 Hours (Express)");
        } else if (pincode.startsWith('6')) { // Tamil Nadu mostly starts with 6
            setDeliveryEstimate("2-3 Days");
        } else {
            setDeliveryEstimate("3-5 Days");
        }
    }, [location]);

    return {
        dispatchLabel,
        timeLeftString,
        deliveryEstimate,
        progress,
        limitTextTemplate: settings.dispatchLimitText
    };
}
