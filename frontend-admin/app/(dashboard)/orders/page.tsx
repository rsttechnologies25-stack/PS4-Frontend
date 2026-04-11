"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, fetchWithAuth } from "@/lib/api";
import { formatImageUrl } from "@/lib/imageHelper";
import {
    Search,
    Filter,
    Loader2,
    ShoppingBag,
    ArrowRight,
    Clock,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Eye,
    Download,
    Calendar as CalendarIcon,
    ChevronDown,
    FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import {
    format,
    isToday,
    isThisWeek,
    isThisMonth,
    isThisYear,
    isWithinInterval,
    startOfDay,
    endOfDay
} from 'date-fns';

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    'PENDING': { label: "Pending", icon: Clock, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" },
    'PROCESSING': { label: "Processing", icon: Package, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
    'SHIPPED': { label: "Shipped", icon: Truck, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
    'DELIVERED': { label: "Delivered", icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50", border: "border-green-100" },
    'CANCELLED': { label: "Cancelled", icon: XCircle, color: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isRefineOpen, setIsRefineOpen] = useState(false);

    // Export States
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [exportPeriod, setExportPeriod] = useState("all"); // all, today, week, month, year, custom
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/admin/all`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        let ordersToExport = [...orders];

        // Apply Date Filtering
        const now = new Date();
        if (exportPeriod === "today") {
            ordersToExport = ordersToExport.filter(o => isToday(new Date(o.createdAt)));
        } else if (exportPeriod === "week") {
            ordersToExport = ordersToExport.filter(o => isThisWeek(new Date(o.createdAt)));
        } else if (exportPeriod === "month") {
            ordersToExport = ordersToExport.filter(o => isThisMonth(new Date(o.createdAt)));
        } else if (exportPeriod === "year") {
            ordersToExport = ordersToExport.filter(o => isThisYear(new Date(o.createdAt)));
        } else if (exportPeriod === "custom" && customStartDate && customEndDate) {
            const start = startOfDay(new Date(customStartDate));
            const end = endOfDay(new Date(customEndDate));
            ordersToExport = ordersToExport.filter(o => {
                const orderDate = new Date(o.createdAt);
                return isWithinInterval(orderDate, { start, end });
            });
        }

        if (ordersToExport.length === 0) {
            alert("No orders found for the selected period.");
            return;
        }

        // Map data for Excel
        const exportData = ordersToExport.map(order => {
            // Calculate GST splits (mirroring user frontend logic)
            // Product GST: 5% inclusive
            const productTotal = order.totalAmount - order.shippingCharge + order.discountAmount;
            const productBase = productTotal / 1.05;
            const productGST = productTotal - productBase;

            // Shipping GST: 18% inclusive
            const shippingBase = order.shippingCharge / 1.18;
            const shippingGST = order.shippingCharge - shippingBase;

            return {
                "Order ID": `#${order.id.slice(-8).toUpperCase()}`,
                "Date": format(new Date(order.createdAt), "dd MMM yyyy HH:mm"),
                "Customer Name": order.customerName || order.user?.name || "Guest",
                "Mobile Number": order.phoneNumber || "N/A",
                "Email": order.user?.email || "N/A",
                "Products": order.items.map((item: any) => `${item.productName || item.product?.name} (x${item.quantity})`).join(", "),
                "Base Product Value": Math.round(productBase * 100) / 100,
                "Product GST (5%)": Math.round(productGST * 100) / 100,
                "Base Shipping Value": Math.round(shippingBase * 100) / 100,
                "Shipping GST (18%)": Math.round(shippingGST * 100) / 100,
                "Discount Applied": order.discountAmount,
                "Grand Total": order.totalAmount,
                "Status": order.status,
                "Payment Status": order.paymentStatus || "PENDING",
                "Address": `${order.addressLine1 || ""}, ${order.addressLine2 || ""}, ${order.city || ""} - ${order.pincode || ""}`
            };
        });

        // Create Excel File
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");

        // Save File
        const fileName = `PS4_Orders_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
        XLSX.writeFile(wb, fileName);

        setIsExportOpen(false);
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-brand-maroon tracking-tight">Order Management</h1>
                    <p className="text-orange-900/50 mt-2 font-medium italic">Track and process your customer's sweet deliveries ({orders.length} total)</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 overflow-hidden">
                {/* Table Header / Actions */}
                <div className="p-8 border-b border-orange-100 flex flex-col gap-6 bg-orange-100/10">
                    <div className="flex flex-col md:flex-row gap-6 justify-between">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C2D12]/40" size={20} />
                            <input
                                type="text"
                                placeholder="Search Order ID or Customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 bg-white border border-orange-200 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all text-sm font-bold placeholder:text-[#7C2D12]/30"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsRefineOpen(!isRefineOpen)}
                                className={cn(
                                    "px-6 py-3.5 text-sm font-bold rounded-2xl flex items-center gap-2 transition-all shadow-sm border",
                                    isRefineOpen ? 'bg-brand-maroon text-white border-brand-maroon' : 'text-brand-maroon bg-white border-orange-100 hover:bg-orange-50'
                                )}
                            >
                                <Filter size={18} className={isRefineOpen ? "text-orange-200" : "text-orange-400"} />
                                Filter Status
                            </button>

                            <button
                                onClick={() => setIsExportOpen(!isExportOpen)}
                                className={cn(
                                    "px-6 py-3.5 text-sm font-bold rounded-2xl flex items-center gap-2 transition-all shadow-sm border",
                                    isExportOpen ? 'bg-green-600 text-white border-green-600' : 'text-green-700 bg-white border-green-100 hover:bg-green-50'
                                )}
                            >
                                <Download size={18} className={isExportOpen ? "text-green-100" : "text-green-500"} />
                                Analytics Export
                            </button>
                        </div>
                    </div>

                    {isExportOpen && (
                        <div className="p-6 bg-white border border-green-100 rounded-[2rem] shadow-inner animate-in slide-in-from-top-4 duration-300 space-y-6">
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { id: 'all', label: 'All Time' },
                                    { id: 'today', label: 'Today' },
                                    { id: 'week', label: 'This Week' },
                                    { id: 'month', label: 'This Month' },
                                    { id: 'year', label: 'This Year' },
                                    { id: 'custom', label: 'Custom Range' },
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setExportPeriod(p.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                                            exportPeriod === p.id
                                                ? "bg-green-600 text-white border-green-600"
                                                : "bg-white text-green-900/40 border-green-100 hover:bg-green-50"
                                        )}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            {exportPeriod === 'custom' && (
                                <div className="flex flex-wrap items-center gap-4 p-4 bg-green-50/50 rounded-2xl animate-in fade-in duration-300">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-green-900/40 uppercase tracking-widest px-1">Start Date</p>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className="px-4 py-2 bg-white border border-green-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-green-900/40 uppercase tracking-widest px-1">End Date</p>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className="px-4 py-2 bg-white border border-green-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-green-50 flex items-center justify-between">
                                <p className="text-[10px] text-green-900/40 font-bold italic flex items-center gap-2">
                                    <FileSpreadsheet size={14} />
                                    Generates a standard Excel .xlsx file with itemized tax splits
                                </p>
                                <button
                                    onClick={handleExport}
                                    className="px-8 py-3 bg-green-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-green-700 transition-all shadow-md active:scale-95"
                                >
                                    Generate XLS Report
                                </button>
                            </div>
                        </div>
                    )}

                    {isRefineOpen && (
                        <div className="flex flex-wrap gap-3 p-6 bg-white border border-orange-100 rounded-[2rem] shadow-inner animate-in slide-in-from-top-4 duration-300">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    statusFilter === "all" ? "bg-brand-maroon text-white" : "bg-orange-50 text-orange-900/40 hover:bg-orange-100"
                                )}
                            >
                                All Orders
                            </button>
                            {Object.keys(statusConfig).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                                        statusFilter === status
                                            ? `${statusConfig[status].bg} ${statusConfig[status].color} ${statusConfig[status].border}`
                                            : "bg-white text-orange-900/40 border-orange-100 hover:bg-orange-50"
                                    )}
                                >
                                    {statusConfig[status].label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-6 text-orange-900/20">
                            <Loader2 className="animate-spin text-primary" size={48} />
                            <p className="font-bold text-lg italic outfit tracking-wide">Gathering order details...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-6 text-orange-900/20">
                            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center">
                                <ShoppingBag size={48} />
                            </div>
                            <p className="font-bold text-lg italic outfit tracking-wide text-brand-maroon/30">No matching orders found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-orange-50/30">
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Order Summary</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Customer</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Order Timing</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Payment</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Purchase</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-orange-900/40 uppercase tracking-[0.2em] text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-50">
                                {filteredOrders.map((order) => {
                                    const StatusIcon = statusConfig[order.status]?.icon || ShoppingBag;
                                    const statusStyle = statusConfig[order.status] || statusConfig['PENDING'];

                                    return (
                                        <tr key={order.id} className="hover:bg-orange-100/5 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-[#7C2D12] text-sm outfit uppercase tracking-tighter">#{order.id.slice(-8).toUpperCase()}</p>
                                                    <p className="text-[10px] text-orange-900/40 font-black uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-brand-maroon font-black text-xs">
                                                        {(order.customerName || order.user?.name || 'C').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-brand-maroon text-sm">{order.customerName || order.user?.name || 'Guest'}</p>
                                                        <p className="text-[10px] text-orange-900/40 font-medium">Customer ID: {order.user?.id?.slice(-6) || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-brand-maroon">
                                                    <Clock size={16} className="opacity-50" />
                                                    <p className="font-bold text-sm tracking-wide">
                                                        {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm",
                                                    statusStyle.bg, statusStyle.color, statusStyle.border
                                                )}>
                                                    <StatusIcon size={14} />
                                                    {statusStyle.label}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all",
                                                    order.paymentStatus === 'PAID'
                                                        ? "bg-green-50 text-green-700 border-green-100 group-hover:bg-green-100"
                                                        : "bg-orange-50 text-orange-700 border-orange-100 group-hover:bg-orange-100"
                                                )}>
                                                    {order.paymentStatus || 'PENDING'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-sm text-brand-maroon">₹{order.totalAmount}</p>
                                                <p className="text-[10px] text-orange-900/40 font-bold italic">{order.items.length} Items</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="inline-flex items-center gap-2 p-3 text-brand-maroon hover:text-white hover:bg-brand-orange rounded-2xl transition-all shadow-sm group/btn"
                                                >
                                                    <Eye size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
