"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { API_URL, fetchWithAuth } from "@/lib/api";
import {
    TrendingUp,
    Download,
    Calendar as CalendarIcon,
    ShoppingBag,
    CreditCard,
    Percent,
    Truck,
    ArrowUpRight,
    Search,
    Eye,
    Filter,
    Loader2,
    RefreshCw,
    Package,
    ChevronDown,
    FileSpreadsheet,
    DollarSign,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import {
    format,
    isToday,
    isYesterday,
    isThisWeek,
    isThisMonth,
    isThisYear,
    isWithinInterval,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    subMonths,
    parseISO
} from "date-fns";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Available years for dropdown
const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function SalesAnalyticsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter modes: 'preset' | 'month' | 'year' | 'custom'
    const [filterType, setFilterType] = useState<"preset" | "month" | "year" | "custom">("preset");
    const [presetPeriod, setPresetPeriod] = useState<string>("month"); // 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'year' | 'all'
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
    const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
    const [customStartDate, setCustomStartDate] = useState<string>(
        format(startOfMonth(new Date()), "yyyy-MM-dd")
    );
    const [customEndDate, setCustomEndDate] = useState<string>(
        format(new Date(), "yyyy-MM-dd")
    );

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/admin/all`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders for sales analytics", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter strictly for confirmed paid orders
    const paidOrders = useMemo(() => {
        return orders.filter(
            (o) => o.paymentStatus === "PAID" || (o.status !== "PENDING" && o.status !== "CANCELLED")
        );
    }, [orders]);

    // Apply the active date filter
    const { filteredOrders, activePeriodLabel } = useMemo(() => {
        const now = new Date();
        let list: any[] = [];
        let label = "";

        if (filterType === "preset") {
            if (presetPeriod === "today") {
                list = paidOrders.filter((o) => isToday(new Date(o.createdAt)));
                label = `Today (${format(now, "dd MMM yyyy")})`;
            } else if (presetPeriod === "yesterday") {
                list = paidOrders.filter((o) => isYesterday(new Date(o.createdAt)));
                label = "Yesterday";
            } else if (presetPeriod === "week") {
                const weekStart = startOfWeek(now, { weekStartsOn: 1 });
                const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
                list = paidOrders.filter((o) =>
                    isWithinInterval(new Date(o.createdAt), { start: weekStart, end: weekEnd })
                );
                label = `This Week (${format(weekStart, "dd MMM")} - ${format(weekEnd, "dd MMM yyyy")})`;
            } else if (presetPeriod === "month") {
                list = paidOrders.filter((o) => isThisMonth(new Date(o.createdAt)));
                label = `This Month (${format(now, "MMMM yyyy")})`;
            } else if (presetPeriod === "last_month") {
                const lastMonthDate = subMonths(now, 1);
                const lmStart = startOfMonth(lastMonthDate);
                const lmEnd = endOfMonth(lastMonthDate);
                list = paidOrders.filter((o) =>
                    isWithinInterval(new Date(o.createdAt), { start: lmStart, end: lmEnd })
                );
                label = `Last Month (${format(lastMonthDate, "MMMM yyyy")})`;
            } else if (presetPeriod === "year") {
                list = paidOrders.filter((o) => isThisYear(new Date(o.createdAt)));
                label = `This Year (${format(now, "yyyy")})`;
            } else {
                list = paidOrders;
                label = "All Time";
            }
        } else if (filterType === "month") {
            const start = new Date(selectedYear, selectedMonth, 1);
            const end = endOfMonth(start);
            list = paidOrders.filter((o) =>
                isWithinInterval(new Date(o.createdAt), {
                    start: startOfDay(start),
                    end: endOfDay(end)
                })
            );
            label = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
        } else if (filterType === "year") {
            const start = new Date(selectedYear, 0, 1);
            const end = new Date(selectedYear, 11, 31, 23, 59, 59);
            list = paidOrders.filter((o) =>
                isWithinInterval(new Date(o.createdAt), {
                    start: startOfDay(start),
                    end: endOfDay(end)
                })
            );
            label = `Full Year ${selectedYear}`;
        } else if (filterType === "custom") {
            if (customStartDate && customEndDate) {
                const start = startOfDay(new Date(customStartDate));
                const end = endOfDay(new Date(customEndDate));
                list = paidOrders.filter((o) =>
                    isWithinInterval(new Date(o.createdAt), { start, end })
                );
                label = `${format(start, "dd MMM yyyy")} to ${format(end, "dd MMM yyyy")}`;
            } else {
                list = paidOrders;
                label = "Custom Range";
            }
        }

        return { filteredOrders: list, activePeriodLabel: label };
    }, [
        paidOrders,
        filterType,
        presetPeriod,
        selectedMonth,
        selectedYear,
        customStartDate,
        customEndDate
    ]);

    // Financial calculations
    const summary = useMemo(() => {
        let grossSales = 0;
        let totalDiscount = 0;
        let totalShipping = 0;
        let totalItemsSold = 0;

        filteredOrders.forEach((o) => {
            grossSales += o.totalAmount || 0;
            totalDiscount += o.discountAmount || 0;
            totalShipping += o.shippingCharge || 0;
            if (Array.isArray(o.items)) {
                o.items.forEach((item: any) => {
                    totalItemsSold += item.quantity || 1;
                });
            }
        });

        const netProductSales = grossSales - totalShipping + totalDiscount;
        const totalOrdersCount = filteredOrders.length;
        const aov = totalOrdersCount > 0 ? grossSales / totalOrdersCount : 0;

        // Estimated Taxes
        const productBase = netProductSales / 1.05;
        const productGST = netProductSales - productBase;
        const shippingBase = totalShipping > 0 ? totalShipping / 1.18 : 0;
        const shippingGST = totalShipping > 0 ? totalShipping - shippingBase : 0;
        const totalGST = productGST + shippingGST;

        return {
            grossSales,
            netProductSales,
            totalDiscount,
            totalShipping,
            totalOrdersCount,
            totalItemsSold,
            aov,
            productBase,
            productGST,
            shippingBase,
            shippingGST,
            totalGST
        };
    }, [filteredOrders]);

    // Top selling products aggregation
    const topProducts = useMemo(() => {
        const map: Record<string, { name: string; quantity: number; revenue: number }> = {};

        filteredOrders.forEach((o) => {
            if (Array.isArray(o.items)) {
                o.items.forEach((item: any) => {
                    const name = item.productName || item.product?.name || "Sweet / Snack";
                    if (!map[name]) {
                        map[name] = { name, quantity: 0, revenue: 0 };
                    }
                    map[name].quantity += item.quantity || 1;
                    map[name].revenue += (item.price || 0) * (item.quantity || 1);
                });
            }
        });

        return Object.values(map)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }, [filteredOrders]);

    // Time-series breakdown for visual charts
    const timeSeriesData = useMemo(() => {
        if (filteredOrders.length === 0) return [];

        const isYearView = filterType === "year" || (filterType === "preset" && presetPeriod === "year");
        const map: Record<string, { label: string; amount: number; count: number; dateKey: string }> = {};

        filteredOrders.forEach((o) => {
            const date = new Date(o.createdAt);
            const key = isYearView
                ? format(date, "yyyy-MM")
                : format(date, "yyyy-MM-dd");

            const label = isYearView
                ? format(date, "MMM yyyy")
                : format(date, "dd MMM");

            if (!map[key]) {
                map[key] = { label, amount: 0, count: 0, dateKey: key };
            }
            map[key].amount += o.totalAmount || 0;
            map[key].count += 1;
        });

        // Sort chronologically
        return Object.values(map).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    }, [filteredOrders, filterType, presetPeriod]);

    const maxChartAmount = useMemo(() => {
        if (timeSeriesData.length === 0) return 1;
        return Math.max(...timeSeriesData.map((d) => d.amount), 1);
    }, [timeSeriesData]);

    // Search filter on table
    const displayedOrders = useMemo(() => {
        if (!searchTerm) return filteredOrders;
        const q = searchTerm.toLowerCase();
        return filteredOrders.filter(
            (o) =>
                (o.readableId && o.readableId.toLowerCase().includes(q)) ||
                (o.id && o.id.toLowerCase().includes(q)) ||
                (o.customerName && o.customerName.toLowerCase().includes(q)) ||
                (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
                (o.phoneNumber && o.phoneNumber.includes(q))
        );
    }, [filteredOrders, searchTerm]);

    // Multi-sheet XLSX Export
    const handleExportSales = () => {
        if (filteredOrders.length === 0) {
            alert("No paid sales data available for the selected period.");
            return;
        }

        const wb = XLSX.utils.book_new();

        // Sheet 1: Executive KPI Summary
        const summaryData = [
            ["PERAMBUR SRI SRINIVASA SWEETS INDIA PRIVATE LIMITED - SALES REVENUE REPORT"],
            ["Report Period:", activePeriodLabel],
            ["Generated At:", format(new Date(), "dd MMM yyyy, HH:mm:ss")],
            [""],
            ["FINANCIAL METRIC", "AMOUNT (INR) / COUNT"],
            ["Total Gross Revenue (Amount)", summary.grossSales],
            ["Net Product Sales Value", summary.netProductSales],
            ["Product Base Value (Excl. Tax)", Math.round(summary.productBase * 100) / 100],
            ["Product GST (5% Inclusive)", Math.round(summary.productGST * 100) / 100],
            ["Shipping Charges Collected", summary.totalShipping],
            ["Shipping Base Value (Excl. Tax)", Math.round(summary.shippingBase * 100) / 100],
            ["Shipping GST (18% Inclusive)", Math.round(summary.shippingGST * 100) / 100],
            ["Total GST Liability", Math.round(summary.totalGST * 100) / 100],
            ["Total Discounts Given (Coupons)", summary.totalDiscount],
            ["Total Confirmed Orders", summary.totalOrdersCount],
            ["Total Items / Packs Sold", summary.totalItemsSold],
            ["Average Order Value (AOV)", Math.round(summary.aov * 100) / 100]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Sales Summary");

        // Sheet 2: Itemized Orders
        const ordersData = filteredOrders.map((o) => {
            const productTotal = o.totalAmount - (o.shippingCharge || 0) + (o.discountAmount || 0);
            const pBase = productTotal / 1.05;
            const pGST = productTotal - pBase;
            const sBase = (o.shippingCharge || 0) / 1.18;
            const sGST = (o.shippingCharge || 0) - sBase;

            return {
                "Order ID": o.readableId || `#${o.id.slice(-8).toUpperCase()}`,
                "Date": format(new Date(o.createdAt), "dd MMM yyyy"),
                "Time": format(new Date(o.createdAt), "HH:mm"),
                "Customer Name": o.customerName || o.user?.name || "Guest",
                "Mobile": o.phoneNumber || "N/A",
                "Email": o.user?.email || "N/A",
                "Items Description": (o.items || [])
                    .map((it: any) => `${it.productName || it.product?.name} (${it.weight || ""} x${it.quantity})`)
                    .join("; "),
                "Base Product Value": Math.round(pBase * 100) / 100,
                "Product GST (5%)": Math.round(pGST * 100) / 100,
                "Shipping Value": Math.round(sBase * 100) / 100,
                "Shipping GST (18%)": Math.round(sGST * 100) / 100,
                "Discount Applied": o.discountAmount || 0,
                "Total Amount": o.totalAmount,
                "Payment Status": o.paymentStatus || "PAID",
                "Order Status": o.status,
                "Delivery City": o.city || "N/A",
                "Pincode": o.pincode || "N/A"
            };
        });
        const wsOrders = XLSX.utils.json_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(wb, wsOrders, "Orders Registry");

        // Sheet 3: Top Selling Products
        const productsData = topProducts.map((p, idx) => ({
            "Rank": idx + 1,
            "Product Name": p.name,
            "Total Units Sold": p.quantity,
            "Total Revenue (INR)": p.revenue,
            "Revenue Contribution (%)": summary.grossSales > 0 ? `${((p.revenue / summary.grossSales) * 100).toFixed(1)}%` : "0%"
        }));
        const wsProducts = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(wb, wsProducts, "Top Products");

        const fileName = `PS4_Sales_Report_${activePeriodLabel.replace(/[^a-zA-Z0-9_-]/g, "_")}_${format(new Date(), "yyyyMMdd")}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-orange-100 pb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center text-white shadow-lg shadow-brand-orange/30">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-brand-maroon tracking-tight outfit">
                                Sales & Revenue Report
                            </h1>
                            <p className="text-orange-900/60 font-medium text-sm mt-0.5">
                                Real-time gross revenue, orders, and sales performance analysis
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="px-5 py-3 bg-white border border-orange-200 text-brand-maroon hover:bg-orange-50 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={cn(loading && "animate-spin")} />
                        Refresh Data
                    </button>

                    <button
                        onClick={handleExportSales}
                        disabled={filteredOrders.length === 0}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Download size={16} />
                        Export to Excel (.xlsx)
                    </button>
                </div>
            </div>

            {/* Timeframe Filtering Bar */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-900/5 border border-orange-100/60 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-orange-50">
                    <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-900/40">
                            Filter Sales Timeframe
                        </p>
                        <h3 className="text-xl font-black text-brand-maroon outfit flex items-center gap-2.5">
                            <CalendarIcon size={20} className="text-brand-orange" />
                            <span>{activePeriodLabel}</span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-brand-orange border border-orange-200">
                                {summary.totalOrdersCount} Paid Orders
                            </span>
                        </h3>
                    </div>

                    {/* Filter Mode Selector */}
                    <div className="flex flex-wrap items-center gap-2 bg-orange-50/50 p-1.5 rounded-2xl border border-orange-100">
                        {[
                            { id: "preset", label: "Quick Presets" },
                            { id: "month", label: "Specific Month" },
                            { id: "year", label: "Specific Year" },
                            { id: "custom", label: "Custom Dates" }
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setFilterType(m.id as any)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                    filterType === m.id
                                        ? "bg-brand-maroon text-white shadow-sm"
                                        : "text-orange-900/60 hover:text-brand-maroon hover:bg-white/50"
                                )}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sub-controls based on filter type */}
                {filterType === "preset" && (
                    <div className="flex flex-wrap gap-2.5 animate-in fade-in duration-300">
                        {[
                            { id: "today", label: "Today" },
                            { id: "yesterday", label: "Yesterday" },
                            { id: "week", label: "This Week (7 Days)" },
                            { id: "month", label: "This Month" },
                            { id: "last_month", label: "Last Month" },
                            { id: "year", label: "This Year" },
                            { id: "all", label: "All Time" }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPresetPeriod(p.id)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border",
                                    presetPeriod === p.id
                                        ? "bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/20"
                                        : "bg-white text-orange-950/70 border-orange-100 hover:bg-orange-50 hover:border-orange-200"
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                )}

                {filterType === "month" && (
                    <div className="flex flex-wrap items-center gap-4 p-5 bg-orange-50/30 rounded-2xl border border-orange-100 animate-in fade-in duration-300">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-orange-900/50 uppercase tracking-widest px-1">
                                Select Month
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="px-4 py-2.5 bg-white border border-orange-200 rounded-xl text-xs font-bold text-brand-maroon outline-none focus:ring-2 focus:ring-brand-orange/30 shadow-sm"
                            >
                                {MONTH_NAMES.map((name, idx) => (
                                    <option key={name} value={idx}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-orange-900/50 uppercase tracking-widest px-1">
                                Select Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="px-4 py-2.5 bg-white border border-orange-200 rounded-xl text-xs font-bold text-brand-maroon outline-none focus:ring-2 focus:ring-brand-orange/30 shadow-sm"
                            >
                                {AVAILABLE_YEARS.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {filterType === "year" && (
                    <div className="flex flex-wrap items-center gap-4 p-5 bg-orange-50/30 rounded-2xl border border-orange-100 animate-in fade-in duration-300">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-orange-900/50 uppercase tracking-widest px-1">
                                Choose Entire Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="px-6 py-2.5 bg-white border border-orange-200 rounded-xl text-xs font-bold text-brand-maroon outline-none focus:ring-2 focus:ring-brand-orange/30 shadow-sm"
                            >
                                {AVAILABLE_YEARS.map((y) => (
                                    <option key={y} value={y}>
                                        Full Year {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {filterType === "custom" && (
                    <div className="flex flex-wrap items-center gap-4 p-5 bg-orange-50/30 rounded-2xl border border-orange-100 animate-in fade-in duration-300">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-orange-900/50 uppercase tracking-widest px-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-orange-200 rounded-xl text-xs font-bold text-brand-maroon outline-none focus:ring-2 focus:ring-brand-orange/30 shadow-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-orange-900/50 uppercase tracking-widest px-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-orange-200 rounded-xl text-xs font-bold text-brand-maroon outline-none focus:ring-2 focus:ring-brand-orange/30 shadow-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Gross Revenue */}
                <div className="bg-gradient-to-br from-brand-maroon to-[#5A1F0C] text-white p-8 rounded-[2.5rem] shadow-xl shadow-brand-maroon/20 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-200/80">
                            Overall Sales (Gross)
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-orange">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-4xl font-black outfit tracking-tight">
                        ₹{summary.grossSales.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-orange-200/70 font-medium mt-2">
                        Total collected from customer purchases
                    </p>
                </div>

                {/* 2. Total Paid Orders */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-900/40">
                            Paid Orders
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <p className="text-4xl font-black text-brand-maroon outfit tracking-tight">
                        {summary.totalOrdersCount}
                    </p>
                    <p className="text-xs text-orange-900/50 font-medium mt-2">
                        {summary.totalItemsSold} sweet/snack packs sold
                    </p>
                </div>

                {/* 3. Average Order Value (AOV) */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-900/40">
                            Avg Order Value (AOV)
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <p className="text-4xl font-black text-brand-maroon outfit tracking-tight">
                        ₹{Math.round(summary.aov).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-orange-900/50 font-medium mt-2">
                        Average basket revenue per order
                    </p>
                </div>

                {/* 4. Shipping & Discounts */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-900/40">
                            Delivery & Discounts
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                            <Truck size={20} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs font-bold text-orange-900/60">Shipping:</span>
                            <span className="text-lg font-black text-brand-maroon">₹{summary.totalShipping.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs font-bold text-orange-900/60">Coupons:</span>
                            <span className="text-sm font-black text-green-700">-₹{summary.totalDiscount.toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-orange-900/40 font-bold uppercase tracking-wider mt-2">
                        Net: ₹{summary.netProductSales.toLocaleString("en-IN")} Products
                    </p>
                </div>
            </div>

            {/* Tax & GST Split Breakdown Banner */}
            <div className="bg-orange-50/60 border border-orange-200/60 rounded-[2rem] p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
                            Tax Compliance Estimation
                        </span>
                        <h4 className="text-lg font-bold text-brand-maroon outfit">
                            GST Liability Breakdown (Total: ₹{Math.round(summary.totalGST).toLocaleString("en-IN")})
                        </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs font-bold">
                        <div className="p-3 bg-white rounded-xl border border-orange-100 shadow-sm">
                            <p className="text-[10px] text-orange-900/40 uppercase font-black">Product GST (5% Incl.)</p>
                            <p className="text-base font-black text-brand-maroon">₹{Math.round(summary.productGST).toLocaleString("en-IN")}</p>
                            <p className="text-[10px] text-orange-900/50">Base: ₹{Math.round(summary.productBase).toLocaleString("en-IN")}</p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-orange-100 shadow-sm">
                            <p className="text-[10px] text-orange-900/40 uppercase font-black">Shipping GST (18% Incl.)</p>
                            <p className="text-base font-black text-brand-maroon">₹{Math.round(summary.shippingGST).toLocaleString("en-IN")}</p>
                            <p className="text-[10px] text-orange-900/50">Base: ₹{Math.round(summary.shippingBase).toLocaleString("en-IN")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Timeline Visualization & Top Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Timeline Chart */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-950/5 border border-orange-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-6 border-b border-orange-100">
                        <div>
                            <h3 className="text-xl font-bold text-brand-maroon outfit">Sales Revenue Timeline</h3>
                            <p className="text-xs text-orange-900/50 font-medium">Daily & monthly distribution of sales</p>
                        </div>
                        <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange">
                            {timeSeriesData.length} Data Points
                        </span>
                    </div>

                    {timeSeriesData.length === 0 ? (
                        <div className="py-20 text-center text-orange-900/30 font-bold italic">
                            No sales activity recorded in this period.
                        </div>
                    ) : (
                        <div className="pt-8 space-y-6">
                            <div className="h-64 flex items-end gap-2 md:gap-3 overflow-x-auto pb-4 pt-6">
                                {timeSeriesData.map((d) => {
                                    const heightPct = Math.max(Math.round((d.amount / maxChartAmount) * 100), 6);
                                    return (
                                        <div
                                            key={d.dateKey}
                                            className="flex-1 min-w-[36px] max-w-[60px] flex flex-col items-center gap-2 group relative"
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-maroon text-white text-[10px] font-black px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                                ₹{d.amount.toLocaleString("en-IN")} ({d.count} orders)
                                            </div>

                                            {/* Bar */}
                                            <div className="w-full bg-orange-100/60 rounded-xl h-full flex items-end overflow-hidden p-1">
                                                <div
                                                    style={{ height: `${heightPct}%` }}
                                                    className="w-full bg-gradient-to-t from-brand-maroon to-brand-orange rounded-lg transition-all duration-500 group-hover:brightness-110"
                                                />
                                            </div>

                                            {/* Date Label */}
                                            <span className="text-[9px] font-black text-orange-900/50 uppercase tracking-tighter truncate w-full text-center">
                                                {d.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-bold text-orange-900/40 pt-4 border-t border-orange-50">
                                <span>Timeline Range: {activePeriodLabel}</span>
                                <span>Peak Day: ₹{maxChartAmount.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Selling Products */}
                <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-950/5 border border-orange-100 flex flex-col">
                    <div className="pb-6 border-b border-orange-100">
                        <h3 className="text-xl font-bold text-brand-maroon outfit">Top Selling Sweets</h3>
                        <p className="text-xs text-orange-900/50 font-medium">Ranked by total revenue in period</p>
                    </div>

                    <div className="flex-1 divide-y divide-orange-50 py-4 overflow-y-auto max-h-[380px]">
                        {topProducts.length === 0 ? (
                            <div className="py-16 text-center text-orange-900/30 text-xs font-bold italic">
                                No items sold in this timeframe.
                            </div>
                        ) : (
                            topProducts.map((p, idx) => (
                                <div key={p.name} className="py-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-xl bg-orange-100 text-brand-orange font-black text-xs flex items-center justify-center shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-maroon text-xs truncate max-w-[160px]">
                                                {p.name}
                                            </p>
                                            <p className="text-[10px] text-orange-900/40 font-bold">
                                                {p.quantity} units sold
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-black text-xs text-brand-maroon">
                                        ₹{p.revenue.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100 overflow-hidden">
                <div className="p-8 border-b border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-orange-100/10">
                    <div>
                        <h3 className="text-xl font-bold text-brand-maroon outfit">
                            Orders in this Period ({displayedOrders.length})
                        </h3>
                        <p className="text-xs text-orange-900/50 font-medium">
                            Paid customer orders contributing to the {activePeriodLabel} sales
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-900/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-orange-200 rounded-2xl text-xs font-bold text-brand-maroon outline-none focus:ring-2 focus:ring-brand-orange/30 shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4 text-orange-900/30">
                            <Loader2 size={36} className="animate-spin text-brand-orange" />
                            <p className="font-bold text-sm italic">Aggregating sales figures...</p>
                        </div>
                    ) : displayedOrders.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-3 text-orange-900/30">
                            <ShoppingBag size={48} className="text-orange-200" />
                            <p className="font-bold text-sm italic">No matching paid orders found in this period.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-orange-50/40 border-b border-orange-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Order</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Date & Time</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Customer</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Items</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Sales Total</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em] text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-50">
                                {displayedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-orange-100/10 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-brand-maroon text-sm outfit">
                                                {order.readableId || "#" + order.id.slice(-8).toUpperCase()}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-brand-maroon">
                                                {format(new Date(order.createdAt), "dd MMM yyyy")}
                                            </p>
                                            <p className="text-[10px] text-orange-900/40 font-medium">
                                                {format(new Date(order.createdAt), "HH:mm")}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-brand-maroon">
                                                {order.customerName || order.user?.name || "Guest"}
                                            </p>
                                            <p className="text-[10px] text-orange-900/40">
                                                {order.phoneNumber || order.user?.email || "N/A"}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-brand-maroon">
                                                {order.items?.length || 0} Products
                                            </p>
                                            <p className="text-[10px] text-orange-900/40 truncate max-w-[200px]">
                                                {(order.items || []).map((it: any) => it.productName || it.product?.name).join(", ")}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-brand-maroon">
                                                ₹{order.totalAmount}
                                            </p>
                                            {order.discountAmount > 0 && (
                                                <p className="text-[10px] text-green-700 font-bold">
                                                    -₹{order.discountAmount} off
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="inline-flex p-2.5 rounded-xl bg-orange-50 text-brand-maroon hover:bg-brand-orange hover:text-white transition-all shadow-sm"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
