"use client";

import { useEffect, useState } from "react";
import {
    Truck, Plus, Trash2, Loader2, Info, CheckCircle2, XCircle, Pencil,
    MapPin, Globe, ShieldAlert, Sparkles, X, Check
} from "lucide-react";

import { API_URL, fetchWithAuth } from "@/lib/api";

interface ShippingRule {
    id: string;
    areaName: string;
    pincodes: string;
    baseWeightLimit: number;
    baseCharge: number;
    additionalChargePerKg: number;
    isActive: boolean;
}

interface DeliveryZoneConfig {
    enabled: boolean;
    allowedAreas: string[];
    customPincodes: string[];
}

const COMMON_TN_AREAS = [
    "Chennai",
    "Tiruvallur",
    "Kanchipuram",
    "Chengalpattu",
    "Coimbatore",
    "Madurai",
    "Trichy",
    "Salem",
    "Vellore",
    "Erode",
    "Tirunelveli"
];

export default function ShippingPage() {
    // Standard Shipping Rules state
    const [rules, setRules] = useState<ShippingRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newRule, setNewRule] = useState({
        areaName: "",
        pincodes: "*",
        baseWeightLimit: "1.0",
        baseCharge: "",
        additionalChargePerKg: "",
        isActive: true
    });
    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

    // Delivery Zone Restriction (Geofencing) state
    const [zoneConfig, setZoneConfig] = useState<DeliveryZoneConfig>({
        enabled: false,
        allowedAreas: [],
        customPincodes: []
    });
    const [customAreaInput, setCustomAreaInput] = useState("");
    const [customPincodeInput, setCustomPincodeInput] = useState("");
    const [savingZones, setSavingZones] = useState(false);
    const [zoneSavedMessage, setZoneSavedMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchRules();
        fetchZoneConfig();
    }, []);

    const fetchRules = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_URL}/admin/shipping/rules`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setRules(data);
            } else {
                console.error("Shipping Rules API did not return an array:", data);
                setRules([]);
            }
        } catch (error) {
            console.error("Error fetching rules:", error);
            setRules([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchZoneConfig = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_URL}/admin/shipping/delivery-zones`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setZoneConfig({
                    enabled: Boolean(data.enabled),
                    allowedAreas: Array.isArray(data.allowedAreas) ? data.allowedAreas : [],
                    customPincodes: Array.isArray(data.customPincodes) ? data.customPincodes : []
                });
            }
        } catch (error) {
            console.error("Error fetching zone restrictions:", error);
        }
    };

    const handleSaveZoneConfig = async (newConfig?: DeliveryZoneConfig) => {
        const configToSave = newConfig || zoneConfig;
        setSavingZones(true);
        setZoneSavedMessage(null);

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_URL}/admin/shipping/delivery-zones`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(configToSave)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.config) {
                    setZoneConfig(data.config);
                }
                setZoneSavedMessage("Delivery restrictions updated successfully!");
                setTimeout(() => setZoneSavedMessage(null), 4000);
            } else {
                alert("Failed to save delivery restrictions");
            }
        } catch (error) {
            console.error("Failed to save delivery zone config:", error);
            alert("Error saving delivery restrictions");
        } finally {
            setSavingZones(false);
        }
    };

    const handleAddArea = (areaName: string) => {
        const trimmed = areaName.trim();
        if (!trimmed) return;
        if (zoneConfig.allowedAreas.some(a => a.toLowerCase() === trimmed.toLowerCase())) return;

        const updatedAreas = [...zoneConfig.allowedAreas, trimmed];
        setZoneConfig(prev => ({
            ...prev,
            enabled: true,
            allowedAreas: updatedAreas
        }));
        setCustomAreaInput("");
    };

    const handleRemoveArea = (areaToRemove: string) => {
        const updatedAreas = zoneConfig.allowedAreas.filter(
            a => a.toLowerCase() !== areaToRemove.toLowerCase()
        );
        setZoneConfig(prev => ({
            ...prev,
            enabled: updatedAreas.length > 0 ? prev.enabled : false,
            allowedAreas: updatedAreas
        }));
    };

    const handleAddPincode = (pincodeStr: string) => {
        const trimmed = pincodeStr.trim();
        if (!trimmed) return;
        if (zoneConfig.customPincodes.includes(trimmed)) return;

        setZoneConfig(prev => ({
            ...prev,
            enabled: true,
            customPincodes: [...prev.customPincodes, trimmed]
        }));
        setCustomPincodeInput("");
    };

    const handleRemovePincode = (pincodeToRemove: string) => {
        setZoneConfig(prev => ({
            ...prev,
            customPincodes: prev.customPincodes.filter(p => p !== pincodeToRemove)
        }));
    };

    // Quick presets
    const applyPreset = (preset: "all_india" | "chennai" | "chennai_suburbs" | "tamil_nadu") => {
        if (preset === "all_india") {
            const newConfig: DeliveryZoneConfig = {
                enabled: false,
                allowedAreas: [],
                customPincodes: []
            };
            setZoneConfig(newConfig);
            handleSaveZoneConfig(newConfig);
        } else if (preset === "chennai") {
            const newConfig: DeliveryZoneConfig = {
                enabled: true,
                allowedAreas: ["Chennai"],
                customPincodes: ["600*"]
            };
            setZoneConfig(newConfig);
            handleSaveZoneConfig(newConfig);
        } else if (preset === "chennai_suburbs") {
            const newConfig: DeliveryZoneConfig = {
                enabled: true,
                allowedAreas: ["Chennai", "Tiruvallur", "Kanchipuram", "Chengalpattu"],
                customPincodes: ["600*", "601*", "602*", "603*"]
            };
            setZoneConfig(newConfig);
            handleSaveZoneConfig(newConfig);
        } else if (preset === "tamil_nadu") {
            const newConfig: DeliveryZoneConfig = {
                enabled: true,
                allowedAreas: ["Tamil Nadu"],
                customPincodes: []
            };
            setZoneConfig(newConfig);
            handleSaveZoneConfig(newConfig);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_URL}/admin/shipping/rules`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newRule)
        });

        if (res.ok) {
            setShowAdd(false);
            setEditingRuleId(null);
            setNewRule({
                areaName: "",
                pincodes: "*",
                baseWeightLimit: "1.0",
                baseCharge: "",
                additionalChargePerKg: "",
                isActive: true
            });
            fetchRules();
        }
    };

    const handleEdit = (rule: ShippingRule) => {
        setNewRule({
            areaName: rule.areaName,
            pincodes: rule.pincodes,
            baseWeightLimit: rule.baseWeightLimit.toString(),
            baseCharge: rule.baseCharge.toString(),
            additionalChargePerKg: rule.additionalChargePerKg.toString(),
            isActive: rule.isActive
        });
        setEditingRuleId(rule.id);
        setShowAdd(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const token = localStorage.getItem("admin_token");
        await fetch(`${API_URL}/admin/shipping/rules/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        fetchRules();
    };

    const isRestrictedModeActive = zoneConfig.enabled && zoneConfig.allowedAreas.length > 0;

    return (
        <div className="p-8 space-y-10 max-w-7xl mx-auto">
            {/* ======================================================== */}
            {/* SECTION 1: ORDER ACCEPTANCE ZONES (RESTRICTED LOCATIONS)  */}
            {/* ======================================================== */}
            <div className="bg-white rounded-3xl p-8 border-2 border-orange-100 shadow-xl shadow-orange-950/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-2xl ${isRestrictedModeActive ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            <MapPin size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    Order Acceptance Locations
                                </h2>
                                {isRestrictedModeActive ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                                        <ShieldAlert size={14} /> Restricted Mode
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        <Globe size={14} /> All India Active
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 max-w-2xl font-medium">
                                Choose specific areas (e.g. Chennai, Tiruvallur) to restrict order intake. 
                                <span className="font-bold text-gray-700"> If no places are selected, orders will be accepted as usual from all locations across India.</span>
                            </p>
                        </div>
                    </div>

                    {/* Enable / Disable toggle */}
                    <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2">
                            {zoneConfig.enabled ? "Restricted" : "Open to All"}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                const nextState = !zoneConfig.enabled;
                                setZoneConfig(prev => ({ ...prev, enabled: nextState }));
                            }}
                            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                zoneConfig.enabled ? 'bg-orange-600' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                    zoneConfig.enabled ? 'translate-x-6' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="mt-6">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">
                        ⚡ Quick Presets
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                        <button
                            type="button"
                            onClick={() => applyPreset("all_india")}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                                !isRestrictedModeActive
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                            }`}
                        >
                            <Globe size={14} /> Open to All India
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset("chennai")}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                zoneConfig.allowedAreas.length === 1 && zoneConfig.allowedAreas[0].toLowerCase() === "chennai" && zoneConfig.enabled
                                    ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-500 hover:text-orange-600"
                            }`}
                        >
                            📍 Chennai Only
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset("chennai_suburbs")}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                zoneConfig.allowedAreas.length === 4 && zoneConfig.allowedAreas.includes("Tiruvallur") && zoneConfig.enabled
                                    ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-500 hover:text-orange-600"
                            }`}
                        >
                            📍 Chennai & Suburbs (Tiruvallur, Kanchi, Chengalpattu)
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset("tamil_nadu")}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                zoneConfig.allowedAreas.includes("Tamil Nadu") && zoneConfig.enabled
                                    ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-500 hover:text-orange-600"
                            }`}
                        >
                            📍 Tamil Nadu Only
                        </button>
                    </div>
                </div>

                {/* Selected Areas (Tags) */}
                <div className="mt-8 bg-orange-50/40 p-6 rounded-2xl border border-orange-100/80">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                        <div>
                            <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">
                                Accepted Locations ({zoneConfig.allowedAreas.length})
                            </label>
                            <span className="text-xs text-gray-500">
                                Orders with delivery addresses matching any of these names or their pincodes will be allowed.
                            </span>
                        </div>
                        {zoneConfig.allowedAreas.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setZoneConfig(prev => ({ ...prev, allowedAreas: [], enabled: false }))}
                                className="text-xs font-bold text-red-600 hover:text-red-700 underline self-start"
                            >
                                Clear all locations
                            </button>
                        )}
                    </div>

                    {/* Chips Display */}
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[44px] p-2 bg-white rounded-xl border border-orange-200/60 shadow-inner">
                        {zoneConfig.allowedAreas.map(area => (
                            <span
                                key={area}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-orange-100 text-orange-900 border border-orange-200 shadow-sm animate-in fade-in"
                            >
                                <span>{area}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveArea(area)}
                                    className="p-0.5 rounded-full hover:bg-orange-200 text-orange-700 hover:text-orange-950 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}

                        {zoneConfig.allowedAreas.length === 0 && (
                            <span className="text-xs text-gray-400 italic px-2 py-1 flex items-center gap-2">
                                <Globe size={14} className="text-emerald-500" />
                                No restrictions selected — All India orders accepted as usual.
                            </span>
                        )}
                    </div>

                    {/* Add Custom Location & Suggestions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={customAreaInput}
                                onChange={e => setCustomAreaInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddArea(customAreaInput);
                                    }
                                }}
                                placeholder="Type city/district name (e.g. Chennai, Tiruvallur) and press Enter"
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-600 focus:outline-none bg-white font-medium shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => handleAddArea(customAreaInput)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0"
                            >
                                <Plus size={16} /> Add Area
                            </button>
                        </div>
                    </div>

                    {/* Quick suggestion pills */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Common:</span>
                        {COMMON_TN_AREAS.map(area => {
                            const isSelected = zoneConfig.allowedAreas.some(a => a.toLowerCase() === area.toLowerCase());
                            if (isSelected) return null;
                            return (
                                <button
                                    key={area}
                                    type="button"
                                    onClick={() => handleAddArea(area)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-orange-100 text-gray-600 hover:text-orange-800 border border-gray-200 transition-colors"
                                >
                                    + {area}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Optional Custom Pincodes / Prefixes */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                            <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">
                                Additional Pincodes / Prefixes (Optional)
                            </label>
                            <span className="text-xs text-gray-500">
                                (Standard pincodes for selected cities like Chennai=600*, Tiruvallur=601*,602* are auto-mapped). Use this to add custom pincodes.
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {zoneConfig.customPincodes.map(pin => (
                            <span
                                key={pin}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-gray-100 text-gray-800 border border-gray-200"
                            >
                                <span>{pin}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemovePincode(pin)}
                                    className="p-0.5 rounded-full hover:bg-gray-200 text-gray-600"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-2 max-w-md">
                        <input
                            type="text"
                            value={customPincodeInput}
                            onChange={e => setCustomPincodeInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddPincode(customPincodeInput);
                                }
                            }}
                            placeholder="e.g. 600028 or 601*"
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-orange-600 focus:outline-none bg-white font-mono shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => handleAddPincode(customPincodeInput)}
                            className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
                        >
                            + Add Pin
                        </button>
                    </div>
                </div>

                {/* Save Button & Feedback */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {zoneSavedMessage && (
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 animate-in fade-in">
                                <CheckCircle2 size={16} /> {zoneSavedMessage}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => handleSaveZoneConfig()}
                        disabled={savingZones}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 shrink-0 disabled:opacity-50"
                    >
                        {savingZones ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                        Save Acceptance Settings
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* SECTION 2: AREA SHIPPING RATES (SLAB CHARGES)            */}
            {/* ======================================================== */}
            <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Truck className="text-orange-600" /> Area Shipping Rates
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Configure shipping charges based on delivery zone and weight slabs.</p>
                    </div>
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/20"
                    >
                        <Plus size={20} /> Add Shipping Rate
                    </button>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-8 flex gap-3 text-orange-800">
                    <Info className="flex-shrink-0" />
                    <p className="text-sm font-medium">
                        Charges are calculated as: <strong>Base Charge + (Total Weight - Base Weight Slab) * Extra Charge</strong>.
                        Standard base slab is usually 1KG. Extra KG is rounded up (e.g., 1.2KG = 2KG pricing).
                    </p>
                </div>

                {showAdd && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200 mb-8 max-w-3xl ring-2 ring-orange-500/10">
                        <h2 className="text-xl font-bold mb-4">{editingRuleId ? 'Edit Area Rule' : 'New Area Rule'}</h2>
                        <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Zone Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newRule.areaName}
                                    onChange={e => setNewRule({ ...newRule, areaName: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-orange-600 focus:outline-none"
                                    placeholder="e.g. CHENNAI"
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Pincodes / Wildcards (*)</label>
                                <input
                                    required
                                    type="text"
                                    value={newRule.pincodes}
                                    onChange={e => setNewRule({ ...newRule, pincodes: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-orange-600 focus:outline-none"
                                    placeholder="600*, 601001"
                                    title="Use * for all, or 600* for Chennai prefixes, or comma separated list"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Base Slab (KG)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.1"
                                    value={newRule.baseWeightLimit}
                                    onChange={e => setNewRule({ ...newRule, baseWeightLimit: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-orange-600 focus:outline-none"
                                    placeholder="1.0"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Base Rate (₹)</label>
                                <input
                                    required
                                    type="number"
                                    value={newRule.baseCharge}
                                    onChange={e => setNewRule({ ...newRule, baseCharge: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-orange-600 focus:outline-none"
                                    placeholder="150"
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Additional /KG Charge (₹)</label>
                                <input
                                    required
                                    type="number"
                                    value={newRule.additionalChargePerKg}
                                    onChange={e => setNewRule({ ...newRule, additionalChargePerKg: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-orange-600 focus:outline-none"
                                    placeholder="30"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-4 pt-4 flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={newRule.isActive}
                                        onChange={e => setNewRule({ ...newRule, isActive: e.target.checked })}
                                        className="w-5 h-5 accent-orange-600"
                                    />
                                    Active for Customers
                                </label>
                                 <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 rounded-xl font-bold transition-colors">
                                    {editingRuleId ? 'Update Rule' : 'Save Zone Rule'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowAdd(false);
                                        setEditingRuleId(null);
                                        setNewRule({
                                            areaName: "",
                                            pincodes: "*",
                                            baseWeightLimit: "1.0",
                                            baseCharge: "",
                                            additionalChargePerKg: "",
                                            isActive: true
                                        });
                                    }} 
                                    className="text-gray-500 font-bold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-600" size={40} /></div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Area / Zone</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Base rate (₹)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Extra /KG (₹)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rules.map(rule => (
                                    <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-black text-gray-900 tracking-tight">{rule.areaName}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Base slab: {rule.baseWeightLimit}KG</div>
                                            <div className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">Pins: {rule.pincodes}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-700 text-lg">
                                            ₹{rule.baseCharge}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-600 text-sm">
                                            +₹{rule.additionalChargePerKg} <span className="text-[10px] text-gray-400">per kg</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {rule.isActive ? (
                                                <span className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase"><CheckCircle2 size={14} /> Active</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-400 font-bold text-xs uppercase"><XCircle size={14} /> Inactive</span>
                                            )}
                                        </td>
                                         <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => handleEdit(rule)} 
                                                    className="text-gray-400 hover:text-orange-600 transition-colors p-1"
                                                    title="Edit Rule"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(rule.id)} 
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                    title="Delete Rule"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rules.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium">No zone rules defined.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
