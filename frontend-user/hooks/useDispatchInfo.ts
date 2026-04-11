import { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';

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
    const [dispatchLabel, setDispatchLabel] = useState("TODAY");
    const [deliveryEstimate, setDeliveryEstimate] = useState("2-4 Days");
    const [progress, setProgress] = useState(33); // Ordered, Dispatched, Delivered

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings`);
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
            const now = new Date();
            // Convert to IST if needed, but for local browser it's usually fine if the user is in India
            // For robust logic, we should probably force IST
            
            const currentHour = now.getHours();
            const currentDay = now.getDay(); // 0 is Sunday
            
            let targetDispatchDay = "TODAY";
            let hoursRemaining = settings.dispatchCutoffHour - currentHour;
            let minutesRemaining = 60 - now.getMinutes();
            
            if (hoursRemaining <= 0) {
                // Past cutoff
                if (currentDay === 6) { // Saturday
                    targetDispatchDay = settings.dispatchSundayPolicy ? "TOMORROW" : "MONDAY";
                } else if (currentDay === 0) { // Sunday
                    targetDispatchDay = settings.dispatchSundayPolicy ? "TODAY" : "TOMORROW";
                } else {
                    targetDispatchDay = "TOMORROW";
                }
                
                // If past cutoff, the "Order Within" should probably show time until *next* day's cutoff
                // But usually, it's more useful to show "Dispatch by Tomorrow"
                setTimeLeftString(""); // Hide countdown if past cutoff today
            } else {
                // Before cutoff
                if (currentDay === 0 && !settings.dispatchSundayPolicy) {
                    targetDispatchDay = "TOMORROW";
                    setTimeLeftString("");
                } else {
                    targetDispatchDay = "TODAY";
                    const h = Math.max(0, hoursRemaining - 1);
                    const m = minutesRemaining % 60;
                    setTimeLeftString(`${h} ${h === 1 ? 'HOUR' : 'HOURS'} ${m} ${m === 1 ? 'MINUTE' : 'MINUTES'}`);
                }
            }
            
            setDispatchLabel(`DISPATCH BY ${targetDispatchDay}`);
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
        limitTextTemplate: settings.dispatchLimitText
    };
}
