"use client";

import { useEffect, useState, use } from "react";import { API_URL } from "@/lib/api";

import { useAuth } from "@/context/AuthContext";
import {
    Package,
    Calendar,
    MapPin,
    Truck,
    CheckCircle2,
    Clock,
    ArrowLeft,
    ShoppingBag,
    Phone,
    User,
    ChevronRight,
    Loader2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatImageUrl } from "@/lib/imageHelper";

interface OrderItem {
    id: string;
    productId?: string;
    productName?: string;
    weight: string;
    price: number;
    quantity: number;
    product?: {
        name: string;
        image: string;
        slug?: string;
        categoryId?: string;
        category?: {
            name: string;
        }
    }
}

interface Order {
    id: string;
    readableId: string | null;
    status: string;
    totalAmount: number;
    discountAmount: number;
    shippingCharge: number;
    couponCode: string | null;
    customerName: string | null;
    phoneNumber: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    pincode: string | null;
    createdAt: string;
    deliveryManName?: string | null;
    deliveryManPhone?: string | null;
    trackingLink?: string | null;
    trackingId?: string | null;
    items: OrderItem[];
}

export default function OrderClient({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, token } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token && id) {
            fetchOrderDetail();
        }
    }, [token, id]);

    const fetchOrderDetail = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                setError("Order not found or access denied.");
            }
        } catch (err) {
            setError("Failed to load order details.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center bg-[#FFFBF5]">
                <AlertCircle size={48} className="text-red-500 mb-4 opacity-20" />
                <h1 className="text-2xl font-black text-secondary uppercase tracking-tight mb-4">{error || "Something went wrong"}</h1>
                <Link href="/orders" className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-secondary transition-all">
                    Back to Orders
                </Link>
            </div>
        );
    }

    const statusSteps = [
        { label: "Pending", icon: Clock, status: "PENDING" },
        { label: "Processing", icon: Package, status: "PROCESSING" },
        { label: "Shipped", icon: Truck, status: "SHIPPED" },
        { label: "Delivered", icon: CheckCircle2, status: "DELIVERED" }
    ];

    const currentStepIndex = statusSteps.findIndex(step => step.status === order.status);

    // --- Calculate Taxes for Invoice ---
    const cartValue = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

    const handleDownloadInvoice = async () => {
        if (!order) return;

        // Dynamic imports for modern Next.js environments
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
            const displayId = order.readableId || `#${order.id.slice(-8).toUpperCase()}`;
            doc.text(`Order ID: ${displayId}`, 14, 45);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`, 14, 51);
            doc.text(`Status: ${order.status}`, 14, 57);

            doc.text(`Billed To:`, 120, 45);
            doc.text(`${order.customerName || user?.name || 'Customer'}`, 120, 51);
            if (order.phoneNumber) doc.text(`${order.phoneNumber}`, 120, 57);
            if (order.addressLine1) {
                const splitAddress = doc.splitTextToSize(`${order.addressLine1}, ${order.addressLine2 ? order.addressLine2 + ', ' : ''}${order.city} - ${order.pincode}`, 70);
                doc.text(splitAddress, 120, 63);
            }

            // --- Items Table ---
            const tableColumn = ["Item Description", "Unit Price", "Qty", "Total (Incl. Tax)"];
            const tableRows: any[] = [];

            order.items.forEach((item) => {
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
                headStyles: { fillColor: [139, 69, 19], textColor: 255 }, // Brand Maroon
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
            doc.text(`Rs. ${order.totalAmount.toFixed(2)}`, rValX, currentY);

            currentY += 15;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text("This is a computer generated invoice.", 14, currentY);

            const displayIdForFilename = (order.readableId || order.id.slice(-8).toUpperCase()).replace(/#/g, '');
            doc.save(`Invoice_${displayIdForFilename}.pdf`);
        };

        // Ensure image is loaded before saving to prevent blank logos
        img.onload = () => generatePDF();
        img.onerror = () => generatePDF(); // fallback if image fails
    };

    return (
        <main className="min-h-screen bg-[#FFFBF5] pt-24 md:pt-32 pb-20 px-4 md:px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href="/orders" className="inline-flex items-center text-primary font-bold hover:underline mb-4 text-sm gap-2">
                        <ArrowLeft size={16} /> Back to My Orders
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tight serif">Order {order.readableId || `#${order.id.slice(-8).toUpperCase()}`}</h1>
                            <p className="text-primary font-black text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center gap-2">
                                <Calendar size={12} /> Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </p>
                        </div>
                        <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs font-black text-primary uppercase tracking-widest">{order.status}</span>
                        </div>
                    </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-primary/5 mb-8">
                    <h2 className="text-lg font-bold text-secondary mb-8 accent-font">Delivery Progress</h2>
                    <div className="relative flex justify-between items-start">
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-1000"
                            style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                        ></div>

                        {statusSteps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            const Icon = step.icon;

                            return (
                                <div key={step.status} className="flex flex-col items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-white border-2 border-gray-100 text-gray-300"
                                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                                        <Icon size={20} />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-center ${isCompleted ? "text-secondary" : "text-gray-300"}`}>
                                        {step.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Logistics & Tracking */}
                {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                    <div className="mb-8 bg-white p-8 rounded-3xl shadow-sm border-2 border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                            <Truck size={100} />
                        </div>
                        <h2 className="text-lg font-black text-secondary mb-6 accent-font flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Logistics & Tracking
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Delivery Personnel</p>
                                <div className="flex items-center gap-4 bg-[#FFFBF5] p-5 rounded-2xl border border-primary/5">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <User size={22} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-secondary">{order.deliveryManName || "Assigned for Delivery"}</p>
                                        <p className="text-xs text-gray-500 font-medium">{order.deliveryManPhone || "Contact details hidden for privacy"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Shipment Tracking</p>
                                {(order.trackingId || order.trackingLink) ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-xs font-bold text-secondary/60">Tracking ID:</span>
                                            <span className="text-xs font-mono font-black text-primary">{order.trackingId || "N/A"}</span>
                                        </div>
                                        {order.trackingLink && (
                                            <a
                                                href={order.trackingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-secondary text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-secondary/20 group/btn"
                                            >
                                                Track My Order <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-[#FFFBF5] p-5 rounded-2xl border border-primary/5 text-center text-sm text-gray-500 font-medium">
                                        Tracking information not available yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Items Section */}
                    <div className="lg:col-span-12">
                        <div className="bg-white rounded-3xl shadow-sm border border-primary/5 overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between bg-primary/5">
                                <h3 className="font-bold text-secondary flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-primary" />
                                    Items Breakdown
                                </h3>
                                <span className="text-[10px] font-black text-primary bg-white px-3 py-1 rounded-full border border-primary/10 tracking-widest uppercase">
                                    {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>
                            <div className="p-6 md:p-8 space-y-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-6 group">
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 group-hover:scale-105 transition-transform duration-500">
                                            <img
                                                src={formatImageUrl(item.product?.image)}
                                                alt={item.productName || item.product?.name || 'Product'}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="text-lg font-bold text-secondary serif">{item.productName || item.product?.name || 'Removed Product'}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wider">{item.weight}</span>
                                                <span className="text-xs font-medium text-gray-400">Qty: <span className="text-secondary font-black">{item.quantity}</span></span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
                                            <p className="text-lg font-black text-secondary serif">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Delivery & Billing Split */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl shadow-sm border border-primary/5 p-8 h-full">
                            <h3 className="font-bold text-secondary mb-6 flex items-center gap-2">
                                <MapPin size={20} className="text-primary" />
                                Delivery Details
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</p>
                                        <p className="font-bold text-secondary">{order.customerName || user?.name || 'Customer'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                        <p className="font-bold text-secondary">+91 {order.phoneNumber || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping Address</p>
                                        <div className="text-sm font-medium text-gray-600 space-y-0.5">
                                            <p>{order.addressLine1}</p>
                                            {order.addressLine2 && <p>{order.addressLine2}</p>}
                                            <p className="font-bold text-secondary text-base mt-2">{order.city} - {order.pincode}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="bg-secondary rounded-3xl p-8 text-white h-full relative overflow-hidden">
                            {/* Decorative Pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <h3 className="font-bold mb-6 text-white/80 uppercase tracking-widest text-xs">Financial Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-white/60">Subtotal</span>
                                    <span>₹{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                                </div>

                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-sm font-medium text-green-400">
                                        <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                        <span>-₹{order.discountAmount}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-white/60">Shipping</span>
                                    <span>{order.shippingCharge === 0 ? 'FREE' : `+₹${order.shippingCharge}`}</span>
                                </div>

                                <div className="pt-4 border-t border-white/10 mt-6 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total Paid</p>
                                        <p className="text-4xl font-black serif">₹{order.totalAmount}</p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-2xl">
                                        <Package className="text-white/20" size={24} />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleDownloadInvoice}
                                className="w-full mt-10 bg-white text-secondary font-black py-4 rounded-2xl shadow-xl hover:bg-primary hover:text-white transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                            >
                                Download Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
