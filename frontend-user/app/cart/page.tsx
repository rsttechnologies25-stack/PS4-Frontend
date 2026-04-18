"use client";

import { useCart } from "@/context/CartContext";import { API_URL } from "@/lib/api";

import { useAuth } from "@/context/AuthContext";
import { Minus, Plus, Trash2, ArrowLeft, Loader2, CheckCircle2, ShoppingCart, AlertCircle, Package, MapPin, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatImageUrl } from "@/lib/imageHelper";

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}



const INDIAN_STATES = [
    "Tamil Nadu", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry"
];

// Simple hill area check based on common TN hill station cities/pincodes
const HILL_AREAS = [
    "oothy", "ooty", "kodaikanal", "yercaud", "valparai", "coonoor", "kotagiri", "nelliyampathy"
];

const RESTRICTED_PINCODE_PREFIXES = ["643"]; // Nilgiris / Ooty region
const RESTRICTED_PINCODES = [
    "624101", // Kodaikanal
    "636601", // Yercaud
    "642127", // Valparai
    "643101", "643102", "643202", "643213", "643217", // Coonoor/Kotagiri
];

export default function CartPage() {
    const {
        cartItems, updateQuantity, removeFromCart, totalAmount, clearCart,
        appliedCoupon, discountAmount, shippingFee, finalTotal,
        availableCoupons, applyCoupon, removeCoupon, addToCart, hasSoldOutItems,
        totalWeight, setDeliveryArea, setDeliveryState, deliveryArea, deliveryState
    } = useCart();
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [couponInput, setCouponInput] = useState("");
    const [couponStatus, setCouponStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    // Calculate Taxes
    // Product tax is calculated on the discounted amount
    const discountedProductTotal = totalAmount - discountAmount;
    const productBaseTotal = discountedProductTotal / 1.05;
    const productGST = discountedProductTotal - productBaseTotal;

    // We only calculate shipping GST if there's a shipping fee
    const shippingBase = shippingFee > 0 ? (shippingFee / 1.18) : 0;
    const shippingGST = shippingFee > 0 ? (shippingFee - shippingBase) : 0;

    const totalCGST = (productGST + shippingGST) / 2;
    const totalSGST = (productGST + shippingGST) / 2;

    // Delivery Address States
    const [address, setAddress] = useState({
        customerName: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "Tamil Nadu",
        pincode: ""
    });
    const [savedAddress, setSavedAddress] = useState<any>(null);
    const [useSavedAddress, setUseSavedAddress] = useState(true);
    const [fetchingProfile, setFetchingProfile] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    // Hill Area detection (City + Pincode prefixes)
    const isHillArea = useMemo(() => {
        const cityLower = address.city?.toLowerCase() || "";
        const pincode = address.pincode?.trim() || "";

        const isHillCity = HILL_AREAS.some(hill => cityLower.includes(hill));
        const isHillPincode = RESTRICTED_PINCODE_PREFIXES.some(prefix => pincode.startsWith(prefix)) ||
            RESTRICTED_PINCODES.includes(pincode);

        return isHillCity || isHillPincode;
    }, [address.city, address.pincode]);

    // Pincode format and City matching logic
    const pincodeError = useMemo(() => {
        const cityLower = address.city?.toLowerCase() || "";
        const pincode = address.pincode?.trim() || "";

        // 1. General Format Check (Strict 6 digits)
        if (pincode.length > 0 && (!/^\d{6}$/.test(pincode))) {
            return "Pincode must be exactly 6 digits.";
        }

        // 2. Chennai Specific Check
        if (cityLower.includes("chennai") && pincode.length >= 3 && !pincode.startsWith("600")) {
            return "Chennai pincodes must start with 600.";
        }

        // 3. Tamil Nadu Region Check
        if (address.state === "Tamil Nadu" && pincode.length >= 1 && !pincode.startsWith("6")) {
            return "Tamil Nadu pincodes must start with 6.";
        }

        return null;
    }, [address.city, address.pincode, address.state]);

    const phoneError = useMemo(() => {
        const phone = address.phoneNumber?.trim() || "";
        if (phone.length > 0 && !/^\d{10}$/.test(phone)) {
            return "Phone number must be exactly 10 digits.";
        }
        return null;
    }, [address.phoneNumber]);

    // Update delivery zone based on pincode and state
    useEffect(() => {
        if (address.pincode) {
            setDeliveryArea(address.pincode);
        }
        if (address.state) {
            setDeliveryState(address.state);
        }
    }, [address.pincode, address.state, setDeliveryArea, setDeliveryState]);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await res.json();

                    if (data && data.address) {
                        const addr = data.address;
                        const street = addr.road || addr.suburb || addr.neighbourhood || "";
                        const houseNumber = addr.house_number || "";

                        setAddress(prev => ({
                            ...prev,
                            addressLine1: `${houseNumber} ${street}`.trim() || data.display_name.split(',')[0],
                            addressLine2: addr.suburb || addr.neighbourhood || "",
                            city: addr.city || addr.town || addr.village || addr.county || "",
                            state: addr.state || "Tamil Nadu",
                            pincode: addr.postcode || ""
                        }));
                        setUseSavedAddress(false);
                    }
                } catch (err) {
                    console.error("Geocoding error:", err);
                    setError("Failed to determine address from location. Please enter manually.");
                } finally {
                    setLocationLoading(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                setError("Location access denied. Please enter address manually.");
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    // Fetch user profile for saved address
    useEffect(() => {
        if (user && token) {
            setFetchingProfile(true);
            fetch(`${API_URL}/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.customerName && data.addressLine1) {
                        setSavedAddress(data);
                        setAddress({
                            ...data,
                            state: data.state || "Tamil Nadu"
                        }); // Sync initial edit form with saved address
                        setUseSavedAddress(true);
                    } else {
                        setUseSavedAddress(false);
                    }
                })
                .catch(err => console.error("Error fetching profile:", err))
                .finally(() => setFetchingProfile(false));
        }
    }, [user, token]);

    const fetchSuggestions = async () => {
        if (cartItems.length === 0) {
            setSuggestions([]);
            return;
        }

        const categoryIds = [...new Set(cartItems.map(item => item.categoryId).filter(Boolean))];
        const excludeProductIds = cartItems.map(item => item.id);

        if (categoryIds.length === 0) return;

        setSuggestionsLoading(true);
        try {
            const res = await fetch(`${API_URL}/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryIds, excludeProductIds })
            });
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data);
            }
        } catch (err) {
            console.error("Error fetching suggestions:", err);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const prevCartCountRef = useRef(cartItems.length);
    useEffect(() => {
        if (cartItems.length !== prevCartCountRef.current || (cartItems.length > 0 && suggestions.length === 0)) {
            fetchSuggestions();
            prevCartCountRef.current = cartItems.length;
        }
    }, [cartItems]);

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        const result = await applyCoupon(couponInput);
        setCouponStatus(result);
        if (result.success) setCouponInput("");
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        if (hasSoldOutItems) {
            setError("One or more items in your cart are sold out. Please remove them to proceed.");
            return;
        }

        if (isHillArea) {
            setError("Sorry, we currently do not support delivery to hill areas.");
            return;
        }

        if (pincodeError || phoneError) {
            setError(pincodeError || phoneError);
            return;
        }

        if (!user || !token) {
            window.location.href = `/login?callbackUrl=/cart`;
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Create Order in Backend
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        weight: item.weight,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    totalAmount: finalTotal,
                    discountAmount,
                    shippingCharge: shippingFee,
                    couponCode: appliedCoupon?.code || null,
                    ...address
                })
            });

            const orderData = await res.json();

            if (!res.ok) {
                setError(orderData.error || "Failed to place order");
                setLoading(false);
                return;
            }

            // 2. Fetch Razorpay Public Key (Option B)
            let razorpayKey = "";
            try {
                const keyRes = await fetch(`${API_URL}/settings/razorpay-key`);
                const keyData = await keyRes.json();
                razorpayKey = keyData.keyId;
            } catch (err) {
                console.error("Failed to fetch Razorpay key", err);
            }

            if (!razorpayKey) {
                setError("Payment system configuration missing. Please contact support.");
                setLoading(false);
                return;
            }

            // 3. Initialize Razorpay Checkout
            const options = {
                key: razorpayKey,
                amount: orderData.totalAmount * 100,
                currency: "INR",
                name: "Perambur Sri Srinivasa",
                description: `Order ${orderData.readableId || "#" + orderData.id.slice(-8).toUpperCase()}`,
                order_id: orderData.razorpayOrderId,
                handler: async function (response: any) {
                    setLoading(true);
                    try {
                        // 3. Verify Payment in Backend
                        const verifyRes = await fetch(`${API_URL}/orders/verify-payment`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok && verifyData.success) {
                            setOrderSuccess(true);
                            clearCart();
                        } else {
                            setError(verifyData.error || "Payment verification failed");
                        }
                    } catch (err) {
                        setError("Error verifying payment");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: address.customerName,
                    email: user.email,
                    contact: address.phoneNumber,
                },
                theme: {
                    color: "#A85D2A",
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (err) {
            setError("Connection error. Please try again.");
            setLoading(false);
        }
    };

    const isAddressValid = address.customerName && address.phoneNumber && address.addressLine1 && address.city && address.state && address.pincode && !isHillArea && !pincodeError && !phoneError;

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-[#FFFBF5] pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600"
                >
                    <CheckCircle2 size={48} />
                </motion.div>
                <h1 className="text-4xl font-black accent-font text-[#8B4513] mb-4">Order Placed!</h1>
                <p className="text-gray-500 mb-8 text-lg">Thank you for your purchase. We&apos;re preparing your sweets.</p>
                <Link href="/orders" className="bg-[#A85D2A] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-black transition-colors">
                    View My Orders
                </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#FFFBF5] pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Trash2 className="text-primary w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black accent-font text-primary mb-4">Your Cart is Empty</h1>
                <p className="text-text-muted mb-8 text-lg">Looks like you haven&apos;t added any sweets yet.</p>
                <Link href="/shop" className="bg-[#A85D2A] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-secondary transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFFBF5] pt-24 md:pt-32 pb-20">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">

                <div className="mb-6 md:mb-10">
                    <Link href="/shop" className="inline-flex items-center text-primary font-medium hover:underline mb-4 text-sm">
                        <ArrowLeft size={16} className="mr-2" /> Back to Shop
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black accent-font text-[#A85D2A]">Your Shopping Cart</h1>
                </div>

                {hasSoldOutItems && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-red-50 border-2 border-red-200 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-red-900/5"
                    >
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <h3 className="text-red-800 font-black uppercase tracking-wider text-sm mb-1">Attention Required</h3>
                            <p className="text-red-700 font-medium">One or more items in your cart are currently <span className="font-black underline">Sold Out</span>. Please remove them from your cart to proceed with the checkout.</p>
                        </div>
                        <div className="shrink-0">
                            <div className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-lg animate-pulse uppercase tracking-widest">Action Required</div>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN - Cart Items & Address */}
                    <div className="lg:col-span-7 space-y-4 md:space-y-6">
                        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <h2 className="text-lg md:text-xl font-bold accent-font text-secondary mb-4 md:mb-6 border-b border-gray-100 pb-4">Items in Cart ({cartItems.length})</h2>

                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        key={item.variantId}
                                        className="flex gap-4 sm:gap-6 items-start"
                                    >
                                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                            <Image
                                                src={formatImageUrl(item.image)}
                                                alt={item.name}
                                                fill
                                                className={cn(
                                                    "object-cover transition-opacity duration-300",
                                                    item.isSoldOut && "grayscale contrast-[0.8] opacity-60"
                                                )}
                                            />
                                            {item.isSoldOut && (
                                                <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center p-2 text-center">
                                                    <span className="bg-red-600 text-white text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded shadow-lg">SOLD OUT</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow pt-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className={cn(
                                                        "serif text-lg sm:text-xl font-medium leading-tight mb-1",
                                                        item.isSoldOut ? "text-gray-400" : "text-text-main"
                                                    )}>{item.name}</h3>
                                                    <p className="text-sm text-text-muted font-medium bg-primary/5 inline-block px-2 py-0.5 rounded text-primary">{item.weight}</p>
                                                    {item.isSoldOut && (
                                                        <p className="text-[10px] text-red-500 font-black uppercase mt-1">Unavailable - Remove to Checkout</p>
                                                    )}
                                                </div>
                                                <p className="serif text-lg font-bold text-primary">₹{item.price * item.quantity}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-10 text-center font-medium text-text-main text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.variantId)}
                                                    className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Suggestions Section */}
                        {suggestions.length > 0 && (
                            <div className="pt-4">
                                <h3 className="text-xl font-bold accent-font text-secondary mb-4 flex items-center gap-2">
                                    <ShoppingCart size={20} className="text-primary" />
                                    Pairs Well With Your Selection
                                </h3>
                                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2 scroll-smooth">
                                    {suggestions.map((product) => {
                                        const defaultVariant = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
                                        const displayPrice = product.price || defaultVariant?.price || 0;
                                        const displayWeight = defaultVariant?.weight || product.weight || "250g";

                                        return (
                                            <div
                                                key={product.id}
                                                className="min-w-[180px] max-w-[180px] bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all group"
                                            >
                                                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-gray-50 border border-gray-50">
                                                    <Image
                                                        src={formatImageUrl(product.image)}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <h4 className="font-bold text-sm text-text-main line-clamp-1 mb-1">{product.name}</h4>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-primary font-bold text-sm">₹{displayPrice}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{displayWeight}</span>
                                                </div>
                                                <button
                                                    onClick={() => addToCart({
                                                        id: product.id,
                                                        name: product.name,
                                                        price: displayPrice,
                                                        image: product.image || "/hero_motichoor_laddu.jpg",
                                                        weight: displayWeight,
                                                        slug: product.slug,
                                                        categoryName: product.category?.name,
                                                        categoryId: product.categoryId,
                                                        isSoldOut: product.isSoldOut
                                                    })}
                                                    className="w-full bg-[#A85D2A]/10 hover:bg-[#A85D2A] text-[#A85D2A] hover:text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-lg transition-all active:scale-95"
                                                >
                                                    + Quick Add
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Delivery Address Section - Only for logged in users */}
                        {user ? (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold accent-font text-secondary mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                                    <Package className="text-[#A85D2A] w-5 h-5" />
                                    Delivery Address
                                </h2>

                                <div className="mb-6">
                                    <button
                                        type="button"
                                        onClick={detectLocation}
                                        disabled={locationLoading}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-[#A85D2A]/30 rounded-xl text-[#A85D2A] font-black uppercase text-xs tracking-widest hover:bg-[#A85D2A]/5 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {locationLoading ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <MapPin size={16} />
                                        )}
                                        {locationLoading ? "Detecting..." : "Use Current Location"}
                                    </button>
                                    <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">Using browser geolocation for address pre-filling</p>
                                </div>

                                {savedAddress && useSavedAddress ? (
                                    <div className="space-y-4">
                                        <div className="bg-[#A85D2A]/5 border border-[#A85D2A]/20 p-5 rounded-xl relative">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-secondary">{savedAddress.customerName}</p>
                                                    <p className="text-sm text-text-muted">{savedAddress.phoneNumber}</p>
                                                </div>
                                                <span className="bg-[#A85D2A] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">SAVED ADDRESS</span>
                                            </div>
                                            <p className="text-sm text-text-muted leading-relaxed">
                                                {savedAddress.addressLine1}, {savedAddress.addressLine2 && `${savedAddress.addressLine2}, `}
                                                {savedAddress.city}, {savedAddress.state && `${savedAddress.state} - `}{savedAddress.pincode}
                                            </p>
                                            <button
                                                onClick={() => setUseSavedAddress(false)}
                                                className="mt-4 text-xs font-bold text-[#A85D2A] hover:underline flex items-center gap-1"
                                            >
                                                Use Different Address?
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {savedAddress && (
                                            <button
                                                onClick={() => {
                                                    setUseSavedAddress(true);
                                                    setAddress({
                                                        ...savedAddress,
                                                        state: savedAddress.state || "Tamil Nadu"
                                                    });
                                                }}
                                                className="text-xs font-bold text-[#A85D2A] hover:underline mb-2 block"
                                            >
                                                ← Use Saved Address
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Recipient Name</label>
                                                <input
                                                    type="text"
                                                    name="customerName"
                                                    value={address.customerName}
                                                    onChange={handleAddressChange}
                                                    placeholder="Full Name"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A85D2A]/20 focus:border-[#A85D2A] transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={address.phoneNumber}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setAddress({ ...address, phoneNumber: val });
                                                    }}
                                                    placeholder="10-digit Mobile Number"
                                                    maxLength={10}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A85D2A]/20 focus:border-[#A85D2A] transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Address Line 1</label>
                                            <input
                                                type="text"
                                                name="addressLine1"
                                                value={address.addressLine1}
                                                onChange={handleAddressChange}
                                                placeholder="Flat, House no., Building, Company, Apartment"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A85D2A]/20 focus:border-[#A85D2A] transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Address Line 2 (Optional)</label>
                                            <input
                                                type="text"
                                                name="addressLine2"
                                                value={address.addressLine2}
                                                onChange={handleAddressChange}
                                                placeholder="Area, Street, Sector, Village"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A85D2A]/20 focus:border-[#A85D2A] transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Town/City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={address.city}
                                                    onChange={handleAddressChange}
                                                    placeholder="City"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A85D2A]/20 focus:border-[#A85D2A] transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">State</label>
                                                <select
                                                    name="state"
                                                    value={address.state}
                                                    onChange={handleAddressChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A85D2A]/20 focus:border-[#A85D2A] transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="">Select State</option>
                                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pincode</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={address.pincode}
                                                onChange={handleAddressChange}
                                                placeholder="6-digit Pincode"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A85D2A]/20 focus:border-[#A85D2A] transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {isHillArea && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600">
                                        <AlertCircle size={20} className="shrink-0" />
                                        <p className="text-xs font-bold leading-tight">Sorry, we currently do not support delivery to hill areas (Ooty, Kodaikanal, etc.) due to carrier restrictions.</p>
                                    </div>
                                )}

                                {(pincodeError || phoneError) && (
                                    <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3 text-orange-600">
                                        <AlertCircle size={20} className="shrink-0" />
                                        <p className="text-xs font-bold leading-tight">{pincodeError || phoneError} Please verify your address details.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="text-primary w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-2">Delivery Details</h3>
                                <p className="text-text-muted mb-6">Please log in to provide your delivery address and complete your order.</p>
                                <Link
                                    href={`/login?callbackUrl=/cart`}
                                    className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-secondary transition-all inline-block"
                                >
                                    Login to Proceed
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN - Checkout Summary */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Order Summary */}
                        <div className="bg-[#A85D2A]/5 rounded-3xl p-6 md:p-8 border border-[#A85D2A]/10 shadow-xl shadow-[#A85D2A]/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A85D2A]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <h2 className="text-2xl font-black accent-font text-secondary mb-8 flex items-center gap-3">
                                Payment Summary
                            </h2>

                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-text-muted font-bold text-sm uppercase tracking-wider">Subtotal</span>
                                    <span className="font-black text-text-main text-lg">₹{totalAmount}</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                                        <span className="font-bold text-xs uppercase">Coupon Discount</span>
                                        <span className="font-black">-₹{discountAmount}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                            Shipping
                                            <span className="text-[10px] bg-[#A85D2A]/10 text-[#A85D2A] px-2 py-0.5 rounded-full">{deliveryArea}</span>
                                        </span>
                                        {shippingFee > 0 ? (
                                            <span className="font-black text-text-main text-lg">₹{shippingFee}</span>
                                        ) : (
                                            <span className="text-green-600 font-black text-sm px-2 py-1 bg-green-100 rounded uppercase tracking-wider">Free</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                        <span>Total Weight: {totalWeight.toFixed(2)} KG</span>
                                    </div>
                                </div>

                                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50 space-y-3">
                                    <p className="text-[10px] font-black text-[#A85D2A] uppercase tracking-widest flex items-center gap-2">
                                        <Info size={12} /> Inclusive Tax Content
                                    </p>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-bold uppercase tracking-tighter">GST (5% Prod + 18% Ship)</span>
                                        <span className="font-black text-gray-700">₹{(productGST + shippingGST).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[#A85D2A]/20 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Grand Total</p>
                                        <span className="text-lg font-bold text-secondary accent-font">Payable Amount</span>
                                    </div>
                                    <span className="text-4xl font-black text-[#A85D2A] serif tracking-tighter">₹{finalTotal}</span>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-black uppercase text-center flex items-center justify-center gap-2"
                                >
                                    <AlertCircle size={14} /> {error}
                                </motion.div>
                            )}

                            <div className="mt-8 space-y-4">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading || hasSoldOutItems || !isAddressValid}
                                    className={cn(
                                        "w-full font-black py-5 rounded-2xl shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-sm",
                                        (loading || hasSoldOutItems || !isAddressValid)
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                            : "bg-[#A85D2A] text-white shadow-[#A85D2A]/30 hover:bg-black hover:shadow-black/20"
                                    )}
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> :
                                        hasSoldOutItems ? "Action: Remove Sold Out Items" :
                                            !isAddressValid ? (isHillArea ? "Shipping Unavailable" : "Complete Address to Proceed") :
                                                user ? "Secure Checkout" : "Login to Place Order"}
                                </button>

                                <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest opacity-60">
                                    100% Secure SSL Encrypted Payment
                                </p>
                            </div>
                        </div>

                        {/* Available Coupons Slider */}
                        {availableCoupons.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold accent-font text-secondary mb-4">Available Coupons</h3>
                                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                                    {availableCoupons.map((c) => (
                                        <div key={c.id} className="min-w-[200px] border-2 border-dashed border-primary/20 bg-primary/5 p-4 rounded-xl flex flex-col justify-between">
                                            <div>
                                                <p className="text-xs font-black text-primary tracking-widest uppercase mb-1">{c.code}</p>
                                                <p className="text-sm font-bold text-secondary">
                                                    {c.type === 'FIXED' ? `₹${c.value} OFF` : `${c.value}% OFF`}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-medium">on orders above ₹{c.minCartAmount}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setCouponInput(c.code);
                                                    applyCoupon(c.code).then(setCouponStatus);
                                                }}
                                                className="mt-3 text-[10px] font-black uppercase tracking-wider text-primary hover:text-secondary transition-colors text-left transition-all active:scale-95"
                                            >
                                                Apply Now →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Coupon Input */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold accent-font text-secondary mb-4 border-b border-gray-100 pb-4">Apply Coupon</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    placeholder="Enter Code"
                                    className="flex-grow bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase font-bold text-sm"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="bg-secondary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary transition-all shadow-md active:scale-95"
                                >
                                    Apply
                                </button>
                            </div>
                            {couponStatus && (
                                <p className={`text-[10px] font-black uppercase mt-2 ${couponStatus.success ? 'text-green-600' : 'text-red-500'}`}>
                                    {couponStatus.message}
                                </p>
                            )}

                            {appliedCoupon && (
                                <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-100 p-3 rounded-xl">
                                    <div>
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Applied Code</p>
                                        <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
                                    </div>
                                    <button onClick={removeCoupon} className="text-green-700 hover:text-red-500 font-black text-xs">REMOVE</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
