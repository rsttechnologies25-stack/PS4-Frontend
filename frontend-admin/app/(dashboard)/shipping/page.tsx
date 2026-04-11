"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, Trash2, Loader2, Info, CheckCircle2, XCircle, Pencil } from "lucide-react";

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

export default function ShippingPage() {
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

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
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
        setLoading(false);
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

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Truck className="text-orange-600" /> Area Shipping Rates
                    </h1>
                    <p className="text-gray-500 mt-1">Configure shipping charges based on delivery zone and weight slabs.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-orange-100"
                >
                    <Plus size={20} /> Add Delivery Zone
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
    );
}
