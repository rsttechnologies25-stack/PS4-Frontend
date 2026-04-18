"use client";

import { useState } from "react";
import { MapPin, Navigation, Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@/context/LocationContext";

export default function LocationModal() {
    const { showLocationModal, setShowLocationModal, checkByCoords, checkByPincode, loading, error, location } = useLocation();
    const [pincode, setPincode] = useState("");
    const [gpsError, setGpsError] = useState<string | null>(null);

    const handleDetectLocation = () => {
        setGpsError(null);
        if (!navigator.geolocation) {
            setGpsError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                checkByCoords(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setGpsError("Location access denied. Please enter your pincode manually.");
                } else {
                    setGpsError("Unable to detect location. Please enter your pincode.");
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handlePincodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pincode.length === 6) {
            checkByPincode(pincode);
        }
    };

    return (
        <AnimatePresence>
            {showLocationModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#EA580C] to-[#C2410C] p-6 text-white relative">
                            {location && (
                                <button
                                    onClick={() => setShowLocationModal(false)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">Select Delivery Location</h2>
                                    <p className="text-sm text-white/80">Check if we deliver to your area</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* GPS Button */}
                            <button
                                onClick={handleDetectLocation}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#FFF7ED] border-2 border-dashed border-[#EA580C]/30 rounded-2xl text-[#EA580C] font-bold hover:bg-[#EA580C]/10 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Navigation size={20} />
                                )}
                                Use My Current Location
                            </button>

                            {gpsError && (
                                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl">{gpsError}</p>
                            )}

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            {/* Pincode Form */}
                            <form onSubmit={handlePincodeSubmit} className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Enter Pincode
                                </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                                            placeholder="E.g. 600011"
                                            className="flex-1 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-center tracking-[0.2em] sm:tracking-[0.3em] focus:border-[#EA580C] focus:outline-none transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            disabled={pincode.length !== 6 || loading}
                                            className="flex-shrink-0 bg-[#EA580C] text-white px-4 sm:px-6 py-3 rounded-xl font-bold hover:bg-[#C2410C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : "Check"}
                                        </button>
                                    </div>
                            </form>

                            {/* Error / Not deliverable */}
                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                                    <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-red-700">{error}</p>
                                        <p className="text-xs text-red-500 mt-1">
                                            Try a different pincode or check our branch locations.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
