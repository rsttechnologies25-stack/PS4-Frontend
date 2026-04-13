"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";import { API_URL } from "@/lib/api";


interface LocationData {
    areaName: string;
    pincode: string | null;
    lat: number;
    lng: number;
    nearestBranch: { name: string; city: string };
}

interface LocationContextType {
    location: LocationData | null;
    isDeliverable: boolean;
    showLocationModal: boolean;
    loading: boolean;
    error: string | null;
    setShowLocationModal: (show: boolean) => void;
    checkByCoords: (lat: number, lng: number) => Promise<void>;
    checkByPincode: (pincode: string) => Promise<void>;
    clearLocation: () => void;
}



const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [isDeliverable, setIsDeliverable] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // On mount, check localStorage, if empty show modal
    useEffect(() => {
        const saved = localStorage.getItem("ps4_location");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setLocation(parsed);
                setIsDeliverable(true);
            } catch (e) {
                localStorage.removeItem("ps4_location");
                setShowLocationModal(true);
            }
        } else {
            setShowLocationModal(true);
        }
    }, []);

    const checkByCoords = async (lat: number, lng: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/delivery/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat, lng }),
            });
            const data = await res.json();

            if (data.deliverable) {
                const locData: LocationData = {
                    areaName: data.areaName || data.nearestBranch?.city || "Your Area",
                    pincode: data.pincode || null,
                    lat,
                    lng,
                    nearestBranch: data.nearestBranch,
                };
                setLocation(locData);
                setIsDeliverable(true);
                localStorage.setItem("ps4_location", JSON.stringify(locData));
                setShowLocationModal(false);
            } else {
                setIsDeliverable(false);
                setLocation(null);
                setError(data.message || "We don't deliver to this location yet.");
            }
        } catch (e) {
            setError("Failed to check delivery. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const checkByPincode = async (pincode: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/delivery/check-pincode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pincode }),
            });
            const data = await res.json();

            if (data.deliverable) {
                const locData: LocationData = {
                    areaName: data.areaName || data.nearestBranch?.city || "Your Area",
                    pincode: data.pincode,
                    lat: data.lat,
                    lng: data.lng,
                    nearestBranch: data.nearestBranch,
                };
                setLocation(locData);
                setIsDeliverable(true);
                localStorage.setItem("ps4_location", JSON.stringify(locData));
                setShowLocationModal(false);
            } else {
                setIsDeliverable(false);
                setLocation(null);
                setError(data.message || "We don't deliver to this location yet.");
            }
        } catch (e) {
            setError("Failed to check delivery. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const clearLocation = () => {
        setLocation(null);
        setIsDeliverable(false);
        localStorage.removeItem("ps4_location");
        setShowLocationModal(true);
    };

    return (
        <LocationContext.Provider
            value={{
                location,
                isDeliverable,
                showLocationModal,
                loading,
                error,
                setShowLocationModal,
                checkByCoords,
                checkByPincode,
                clearLocation,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
}
