"use client";

export const runtime = "edge";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL, fetchWithAuth } from "@/lib/api";
import { formatImageUrl } from "@/lib/imageHelper";
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    User,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    Loader2,
    AlertCircle,
    ChevronDown,
    Save,
    Download,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    'PENDING': { label: "Pending", icon: Clock, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" },
    'PROCESSING': { label: "Processing", icon: Package, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
    'SHIPPED': { label: "Shipped", icon: Truck, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
    'DELIVERED': { label: "Delivered", icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50", border: "border-green-100" },
    'CANCELLED': { label: "Cancelled", icon: XCircle, color: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [trackingData, setTrackingData] = useState({
        deliveryManName: "",
        deliveryManPhone: "",
        trackingLink: "",
        trackingId: ""
    });

    useEffect(() => {
        if (id) fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/admin/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
                setNewStatus(data.status);
            } else {
                setError("Order not found or access denied.");
            }
        } catch (err) {
            setError("Failed to load order details.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (forceStatus?: string, extraData?: any) => {
        const statusToApply = forceStatus || newStatus;
        if (statusToApply === order.status && !forceStatus) return;

        // If shifting to SHIPPED and modal not yet shown, show it
        if (statusToApply === 'SHIPPED' && !forceStatus) {
            setShowTrackingModal(true);
            return;
        }

        setUpdating(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/admin/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: statusToApply,
                    ...extraData
                })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
                setNewStatus(updatedOrder.status);
                setShowTrackingModal(false);
                alert("Order status updated successfully!");
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to update status.");
            }
        } catch (err) {
            alert("Error updating order status.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-lg italic text-[#7C2D12]/20">Fetching the sweet details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-10">
                <AlertCircle size={64} className="text-red-300 mb-4" />
                <h1 className="text-3xl font-black text-brand-maroon uppercase tracking-tight">{error || "Something went wrong"}</h1>
                <Link href="/orders" className="bg-brand-orange text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:bg-brand-maroon transition-all">
                    Back to Orders
                </Link>
            </div>
        );
    }

    // --- Calculate Taxes ---
    const cartValue = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const discountAmount = order.discountAmount || 0;
    const shippingCharge = order.shippingCharge || 0;

    const discountedProductTotal = cartValue - discountAmount;
    const productBaseTotal = discountedProductTotal / 1.05;
    const productGST = discountedProductTotal - productBaseTotal;
    const productCGST = productGST / 2;
    const productSGST = productGST / 2;

    const shippingBase = shippingCharge > 0 ? (shippingCharge / 1.18) : 0;
    const shippingGST = shippingCharge > 0 ? (shippingCharge - shippingBase) : 0;
    const shippingCGST = shippingGST / 2;
    const shippingSGST = shippingGST / 2;

    const totalCGST = productCGST + shippingCGST;
    const totalSGST = productSGST + shippingSGST;
    const grandTotal = order.totalAmount;

    const handleDownloadInvoice = async () => {
        if (!order) return;

        // Dynamic imports to reduce bundle size
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF();
        
        // --- Header & Logo Setup ---
        const logoUrl = '/logo.png';
        const img = new Image();
        img.src = logoUrl;

        // Function to generate the rest of the PDF
        const generatePDF = () => {
            // Draw Logo (Top Right)
            try {
                doc.addImage(img, 'PNG', 145, 12, 50, 15);
            } catch (e) {
                console.warn("Logo failed to load for PDF");
            }

            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(139, 69, 19); // Brand Maroon
            doc.text("Perambur Sri Srinivasa", 14, 22);

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            doc.text("GSTIN: 33AAPCP6259C1ZA", 14, 28);
            
            doc.setFontSize(10);
            doc.text("TAX INVOICE", 14, 35);

            // --- Order & Customer Details ---
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text(`Order ID: ${order.readableId || "#" + order.id.slice(-8).toUpperCase()}`, 14, 45);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`, 14, 51);
            doc.text(`Status: ${order.status}`, 14, 57);

            doc.text(`Billed To:`, 120, 45);
            doc.text(`${order.customerName || order.user?.name || 'Customer'}`, 120, 51);
            if (order.phoneNumber) doc.text(`${order.phoneNumber}`, 120, 57);
            if (order.addressLine1) {
                const splitAddress = doc.splitTextToSize(`${order.addressLine1}, ${order.addressLine2 ? order.addressLine2 + ', ' : ''}${order.city} - ${order.pincode}`, 70);
                doc.text(splitAddress, 120, 63);
            }

            // --- Items Table ---
            const tableColumn = ["Item Description", "Unit Price", "Qty", "Total (Incl. Tax)"];
            const tableRows: any[] = [];

            order.items.forEach((item: any) => {
                const itemData = [
                    item.productName || item.product?.name || 'Removed Product',
                    `Rs. ${item.price.toFixed(2)}`,
                    item.quantity,
                    `Rs. ${(item.price * item.quantity).toFixed(2)}`
                ];
                tableRows.push(itemData);
            });

            autoTable(doc, {
                startY: 85,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [234, 88, 12], textColor: 255 }, // Brand Orange
                styles: { fontSize: 9 },
                margin: { top: 10 }
            });

            // --- Financial Summary ---
            const finalY = (doc as any).lastAutoTable.finalY || 100;

            doc.setFontSize(10);
            doc.setTextColor(0);

            let currentY = finalY + 15;
            const rColX = 140;
            const rValX = 175;

            doc.text("Product Base Total:", rColX, currentY);
            doc.text(`Rs. ${productBaseTotal.toFixed(2)}`, rValX, currentY);
            currentY += 6;

            if (discountAmount > 0) {
                doc.text("Coupon Discount:", rColX, currentY);
                doc.setTextColor(0, 150, 0); // green
                doc.text(`- Rs. ${discountAmount.toFixed(2)}`, rValX, currentY);
                doc.setTextColor(0);
                currentY += 6;
            }

            doc.text("Product CGST (2.5%):", rColX, currentY);
            doc.text(`Rs. ${productCGST.toFixed(2)}`, rValX, currentY);
            currentY += 6;

            doc.text("Product SGST (2.5%):", rColX, currentY);
            doc.text(`Rs. ${productSGST.toFixed(2)}`, rValX, currentY);
            currentY += 6;

            if (shippingCharge > 0) {
                currentY += 4;
                doc.text("Shipping Base:", rColX, currentY);
                doc.text(`Rs. ${shippingBase.toFixed(2)}`, rValX, currentY);
                currentY += 6;

                doc.text("Shipping CGST (9%):", rColX, currentY);
                doc.text(`Rs. ${shippingCGST.toFixed(2)}`, rValX, currentY);
                currentY += 6;

                doc.text("Shipping SGST (9%):", rColX, currentY);
                doc.text(`Rs. ${shippingSGST.toFixed(2)}`, rValX, currentY);
                currentY += 6;
            }

            currentY += 4;
            doc.line(140, currentY, 200, currentY);
            currentY += 6;

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Grand Total:", rColX, currentY);
            doc.text(`Rs. ${grandTotal.toFixed(2)}`, rValX, currentY);

            currentY += 15;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text("This is a computer generated invoice.", 14, currentY);

            doc.save(`Invoice_${(order.readableId || order.id.slice(-8)).toUpperCase().replace("#", "")}.pdf`);
        };

        // Ensure image is loaded before saving
        img.onload = () => generatePDF();
        img.onerror = () => generatePDF(); // fallback if image fails
    };

    const currentStatus = statusConfig[order.status] || statusConfig['PENDING'];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div>
                <Link href="/orders" className="inline-flex items-center text-brand-orange font-bold hover:underline mb-6 text-sm gap-2">
                    <ArrowLeft size={16} /> Back to Order Registry
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-brand-maroon uppercase tracking-tight outfit">Order {order.readableId || "#" + order.id.slice(-8).toUpperCase()}</h1>
                        <p className="text-orange-900/40 font-black text-[10px] tracking-[0.3em] uppercase mt-2 flex items-center gap-2">
                            <Calendar size={14} className="text-brand-orange" /> Recorded on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })} at {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* Status Management Bar */}
                    <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-xl border border-orange-100">
                        <div className={cn(
                            "px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest flex items-center gap-3",
                            currentStatus.bg, currentStatus.color, currentStatus.border
                        )}>
                            <currentStatus.icon size={18} />
                            {currentStatus.label}
                        </div>

                        <div className="h-10 w-px bg-orange-100 mx-2" />

                        <div className="flex items-center gap-3 pr-4">
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-2.5 text-xs font-black text-brand-maroon outline-none focus:ring-2 focus:ring-brand-orange/20"
                            >
                                {Object.keys(statusConfig).map(status => (
                                    <option key={status} value={status}>{statusConfig[status].label}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => handleUpdateStatus()}
                                disabled={updating || newStatus === order.status}
                                className="bg-brand-maroon text-white p-2.5 rounded-xl hover:bg-brand-orange transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                            >
                                {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Download Invoice Action */}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleDownloadInvoice}
                        className="bg-white border-2 border-brand-maroon text-brand-maroon font-black py-3 px-8 rounded-2xl shadow-lg hover:bg-brand-maroon hover:text-white transition-all flex items-center gap-3 active:scale-95"
                    >
                        <Download size={18} /> DOWNLOAD TAX INVOICE
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Delivery Information */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-orange-100 overflow-hidden">
                        <div className="p-8 border-b border-orange-50 bg-orange-50/10">
                            <h3 className="text-xl font-black text-brand-maroon uppercase tracking-tight flex items-center gap-3">
                                <MapPin className="text-brand-orange" /> Consignee & Delivery Address
                            </h3>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-brand-orange">
                                        <User size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-orange-900/30 uppercase tracking-widest mb-1">Customer Name</p>
                                        <p className="font-bold text-brand-maroon text-lg">{order.customerName || order.user?.name || 'Customer'}</p>
                                        <p className="text-xs text-orange-900/40 font-medium mt-1">{order.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-brand-orange">
                                        <Phone size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-orange-900/30 uppercase tracking-widest mb-1">Contact Number</p>
                                        <p className="font-bold text-brand-maroon text-lg">{order.phoneNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-50/30 p-8 rounded-[2rem] border border-orange-100/50">
                                <p className="text-[10px] font-black text-orange-900/30 uppercase tracking-widest mb-4">Shipping Destination</p>
                                <div className="space-y-1 font-bold text-brand-maroon">
                                    <p>{order.addressLine1}</p>
                                    {order.addressLine2 && <p className="opacity-60">{order.addressLine2}</p>}
                                    <div className="h-4" />
                                    <p className="text-2xl font-black tracking-tight serif">{order.city}</p>
                                    <p className="text-brand-orange text-lg tracking-[0.2em] font-black uppercase font-mono">{order.pincode}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-orange-100 overflow-hidden">
                        <div className="p-8 border-b border-orange-50 bg-brand-maroon text-white flex items-center justify-between">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <ShoppingBag className="text-brand-orange" /> Itemized Breakdown
                            </h3>
                            <span className="text-[10px] font-black bg-white/10 px-4 py-1.5 rounded-full border border-white/20 tracking-widest uppercase">
                                {order.items.length} Products Packed
                            </span>
                        </div>
                        <div className="divide-y divide-orange-50">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-8 flex items-center gap-8 group hover:bg-orange-50/20 transition-colors">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white border border-orange-100 flex-shrink-0 p-1 group-hover:scale-105 transition-transform duration-500">
                                        <img
                                            src={formatImageUrl(item.product?.image)}
                                            alt={item.productName || item.product?.name || "Product Removed"}
                                            className="object-cover w-full h-full rounded-2xl"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-xl font-black text-brand-maroon outfit">
                                            {item.productName || item.product?.name || <span className="text-orange-900/40 italic">Product Removed from Catalog</span>}
                                        </h4>
                                        <div className="flex items-center gap-5 mt-3">
                                            <span className="text-[10px] font-black text-brand-orange bg-orange-100 px-3 py-1 rounded-lg uppercase tracking-widest border border-orange-200">{item.weight}</span>
                                            <div className="flex items-center gap-2 text-brand-maroon/40 font-bold text-sm italic">
                                                <span>Unit: ₹{item.price}</span>
                                                <div className="w-1 h-1 rounded-full bg-orange-200" />
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-[10px] font-black text-orange-900/20 uppercase tracking-[0.2em] mb-1">Total</p>
                                        <p className="text-2xl font-black text-brand-maroon outfit">₹{item.price * item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="lg:col-span-4 h-fit sticky top-10 space-y-8">
                    <div className="bg-brand-maroon rounded-[2.5rem] p-10 text-white shadow-2xl shadow-orange-950/40 relative overflow-hidden brand-pattern dark">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <ShoppingBag size={200} />
                        </div>

                        <h3 className="font-black mb-10 text-brand-orange uppercase tracking-[.3em] text-[10px]">Financial Summary</h3>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-sm font-bold opacity-70">
                                <span>Cart Value</span>
                                <span>₹{cartValue}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-sm font-bold text-green-400">
                                    <div className="flex flex-col">
                                        <span>Discount Apply</span>
                                        <span className="text-[8px] uppercase tracking-widest opacity-60">Code: {order.couponCode}</span>
                                    </div>
                                    <span>-₹{discountAmount}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm font-bold opacity-70">
                                <span>Shipping Logistics</span>
                                <span>{shippingCharge === 0 ? 'COMPLIMENTARY' : `+₹${shippingCharge}`}</span>
                            </div>

                            {/* --- Inclusive Tax Breakdown UI --- */}
                            <div className="mt-6 pt-6 border-t border-white/20">
                                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-orange mb-4">Inclusive Tax Breakdown</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs opacity-80">
                                        <span>Product Base Value</span>
                                        <span>₹{productBaseTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs opacity-80">
                                        <span>Product CGST (2.5%)</span>
                                        <span>₹{productCGST.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs opacity-80">
                                        <span>Product SGST (2.5%)</span>
                                        <span>₹{productSGST.toFixed(2)}</span>
                                    </div>
                                </div>

                                {shippingCharge > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs opacity-80">
                                            <span>Shipping Base Value</span>
                                            <span>₹{shippingBase.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs opacity-80">
                                            <span>Shipping CGST (9%)</span>
                                            <span>₹{shippingCGST.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs opacity-80">
                                            <span>Shipping SGST (9%)</span>
                                            <span>₹{shippingSGST.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 border-t border-white/10 mt-10 rounded-3xl">
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black text-brand-orange uppercase tracking-[.4em] mb-2 px-1">Grand Total</p>
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-5xl font-black outfit tracking-tighter">₹{grandTotal}</p>
                                        <div className="p-4 bg-white/5 rounded-2xl">
                                            <Package className="text-brand-orange opacity-40" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 italic text-[11px] font-medium opacity-60 text-center">
                            Admin authorized status update required for further logistics processing.
                        </div>
                    </div>

                    {/* Logistics Details Card */}
                    {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                        <div className="bg-white rounded-[2.5rem] p-8 border border-purple-100 shadow-xl shadow-purple-900/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Truck size={120} />
                            </div>

                            <h3 className="text-[10px] font-black text-purple-900/40 uppercase tracking-[.2em] mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Logistics Details
                            </h3>

                            <div className="space-y-6">
                                {(order.deliveryManName || order.deliveryManPhone) && (
                                    <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-100/50">
                                        <p className="text-[9px] font-black text-purple-900/30 uppercase tracking-widest mb-2 font-mono">Delivery Personnel</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="font-black text-brand-maroon text-sm">{order.deliveryManName || "Assigned Driver"}</p>
                                                <p className="text-[10px] text-purple-900/40 font-bold">{order.deliveryManPhone || "No contact info"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <p className="text-[9px] font-black text-purple-900/30 uppercase tracking-widest px-1 font-mono">Real-time Tracking</p>
                                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                                        <p className="text-[9px] font-black text-orange-900/30 uppercase tracking-widest mb-1.5">Tracking ID</p>
                                        <p className="font-mono text-sm font-black text-brand-maroon mb-4 select-all">{order.trackingId}</p>

                                        <a
                                            href={order.trackingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-brand-maroon text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand-orange transition-all shadow-lg shadow-orange-950/20"
                                        >
                                            Track Order Now <ArrowLeft className="rotate-[135deg]" size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Info Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-xl">
                        <h3 className="text-xs font-black text-brand-maroon uppercase tracking-[.2em] mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" /> Transaction Details
                        </h3>

                        <div className="space-y-6">
                            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                                <p className="text-[9px] font-black text-orange-900/30 uppercase tracking-widest mb-1.5">Payment Method</p>
                                <p className="font-bold text-brand-maroon text-sm uppercase italic outfit">Razorpay Checkout</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-orange-900/40 uppercase tracking-wider">Status</span>
                                <span className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                    order.paymentStatus === 'PAID' ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"
                                )}>
                                    {order.paymentStatus || 'PENDING'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-orange-900/30 uppercase tracking-widest">Razorpay Order ID</p>
                                <p className="font-mono text-xs text-brand-maroon bg-orange-100/30 p-2.5 rounded-xl border border-orange-100/50 break-all select-all">
                                    {order.razorpayOrderId || 'N/A'}
                                </p>
                            </div>

                            {order.razorpayPaymentId && (
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-orange-900/30 uppercase tracking-widest">Razorpay Payment ID</p>
                                    <p className="font-mono text-xs text-brand-maroon bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 break-all select-all">
                                        {order.razorpayPaymentId}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipped Details Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-brand-maroon/40 backdrop-blur-sm" onClick={() => setShowTrackingModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-orange-100 overflow-hidden"
                    >
                        <div className="p-8 border-b border-orange-50 bg-orange-50/10 flex items-center justify-between">
                            <h3 className="text-xl font-black text-brand-maroon uppercase tracking-tight flex items-center gap-3">
                                <Truck className="text-brand-orange" /> Shipping & Logistics Details
                            </h3>
                            <button onClick={() => setShowTrackingModal(false)} className="text-orange-900/20 hover:text-brand-orange transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-orange-900/40 uppercase tracking-widest px-1">Delivery Partner Name (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ramesh"
                                        value={trackingData.deliveryManName}
                                        onChange={(e) => setTrackingData({ ...trackingData, deliveryManName: e.target.value })}
                                        className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-4 text-brand-maroon font-bold outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-orange-900/40 uppercase tracking-widest px-1">Delivery Contact No. (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 9876543210"
                                        value={trackingData.deliveryManPhone}
                                        onChange={(e) => setTrackingData({ ...trackingData, deliveryManPhone: e.target.value })}
                                        className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-4 text-brand-maroon font-bold outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-orange-900/40 uppercase tracking-widest px-1">
                                    Tracking Link <span className="text-brand-orange">*</span>
                                </label>
                                <input
                                    type="url"
                                    placeholder="e.g. https://shiprocket.co/tracking/..."
                                    value={trackingData.trackingLink}
                                    onChange={(e) => setTrackingData({ ...trackingData, trackingLink: e.target.value })}
                                    className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-4 text-brand-maroon font-bold outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-orange-900/40 uppercase tracking-widest px-1">
                                    Tracking ID / AWB Number <span className="text-brand-orange">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. SR12345678"
                                    value={trackingData.trackingId}
                                    onChange={(e) => setTrackingData({ ...trackingData, trackingId: e.target.value })}
                                    className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-4 text-brand-maroon font-bold outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    onClick={() => setShowTrackingModal(false)}
                                    className="flex-1 border-2 border-orange-100 text-orange-900/40 font-black py-4 rounded-2xl hover:bg-orange-50 transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus('SHIPPED', trackingData)}
                                    disabled={!trackingData.trackingLink || !trackingData.trackingId || updating}
                                    className="flex-[2] bg-brand-maroon text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-900/20 hover:bg-brand-orange transition-all disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                >
                                    {updating ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            <Save size={18} /> Confirm Shipping
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
