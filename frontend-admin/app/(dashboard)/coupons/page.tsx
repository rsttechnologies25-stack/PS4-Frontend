"use client";

import { useEffect, useState } from "react";
import { Ticket, Plus, Trash2, Calendar, Loader2 } from "lucide-react";

import { API_URL, fetchWithAuth } from "@/lib/api";

interface Coupon {
    id: string;
    code: string;
    type: string;
    value: number;
    minCartAmount: number;
    isActive: boolean;
    expiryDate: string | null;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        type: "FIXED",
        value: "",
        minCartAmount: "",
        expiryDate: ""
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_URL}/admin/coupons`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
            setCoupons(data);
        } else {
            console.error("Coupons API did not return an array:", data);
            setCoupons([]);
        }
        setLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("admin_token");
        if (newCoupon.type === 'FIXED' && parseFloat(newCoupon.minCartAmount) <= parseFloat(newCoupon.value)) {
            alert("Minimum spend must be higher than the discount value for flat discounts.");
            return;
        }

        const res = await fetch(`${API_URL}/admin/coupons`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newCoupon)
        });

        if (res.ok) {
            setShowAdd(false);
            setNewCoupon({ code: "", type: "FIXED", value: "", minCartAmount: "", expiryDate: "" });
            fetchCoupons();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const token = localStorage.getItem("admin_token");
        await fetch(`${API_URL}/admin/coupons/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        fetchCoupons();
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Ticket className="text-pink-600" /> Coupon Management
                    </h1>
                    <p className="text-gray-500 mt-1">Create and manage discount codes for your customers.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-pink-100"
                >
                    <Plus size={20} /> Create New Coupon
                </button>
            </div>

            {showAdd && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 max-w-2xl">
                    <h2 className="text-xl font-bold mb-4">New Coupon Details</h2>
                    <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Coupon Code</label>
                            <input
                                required
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-pink-600 focus:outline-none"
                                placeholder="E.g. SUMMER100"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                            <select
                                value={newCoupon.type}
                                onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-pink-600 focus:outline-none"
                            >
                                <option value="FIXED">Flat Discount (₹)</option>
                                <option value="PERCENT">Percentage (%)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Discount Value</label>
                            <input
                                required
                                type="number"
                                value={newCoupon.value}
                                onChange={e => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-pink-600 focus:outline-none"
                                placeholder="100 or 10"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Min Cart Amount</label>
                            <input
                                required
                                type="number"
                                value={newCoupon.minCartAmount}
                                onChange={e => setNewCoupon({ ...newCoupon, minCartAmount: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-pink-600 focus:outline-none"
                                placeholder="500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date (Optional)</label>
                            <input
                                type="date"
                                value={newCoupon.expiryDate}
                                onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-pink-600 focus:outline-none"
                            />
                        </div>
                        <div className="col-span-2 pt-4 flex gap-3">
                            <button type="submit" className="bg-gray-800 text-white px-8 py-2 rounded-xl font-bold">Create Coupon</button>
                            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-500 font-bold">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-pink-600" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(coupon => (
                        <div key={coupon.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm font-black tracking-widest border border-pink-100">
                                    {coupon.code}
                                </div>
                                <button onClick={() => handleDelete(coupon.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-gray-800">
                                    {coupon.type === 'FIXED' ? `₹${coupon.value} OFF` : `${coupon.value}% OFF`}
                                </p>
                                <p className="text-sm text-gray-500 font-medium">
                                    Min Spend: <span className="text-gray-800 font-bold">₹{coupon.minCartAmount}</span>
                                </p>
                                {coupon.expiryDate && (
                                    <p className="text-xs text-orange-600 flex items-center gap-1 font-bold">
                                        <Calendar size={12} /> Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
