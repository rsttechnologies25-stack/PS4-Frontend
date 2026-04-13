"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";import { API_URL } from "@/lib/api";

import { useAuth } from "./AuthContext";

export interface CartItem {
    id: string;
    variantId: string; // Composite ID: itemId + weight
    name: string;
    description?: string;
    price: number;
    image: string;
    weight: string;
    slug: string;
    quantity: number;
    categoryName?: string;
    categoryId?: string;
    isVeg?: boolean;
    isSoldOut?: boolean;
}

export interface Coupon {
    id: string;
    code: string;
    type: string;
    value: number;
    minCartAmount: number;
}

export interface ShippingRule {
    id: string;
    areaName: string;
    pincodes: string;
    baseWeightLimit: number;
    baseCharge: number;
    additionalChargePerKg: number;
    isActive: boolean;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity" | "variantId">, quantityToAdd?: number) => void;
    removeFromCart: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
    totalItems: number;
    totalWeight: number;
    hasSoldOutItems: boolean;
    // Coupon & Shipping
    appliedCoupon: Coupon | null;
    discountAmount: number;
    shippingFee: number;
    finalTotal: number;
    availableCoupons: Coupon[];
    deliveryArea: string;
    deliveryState: string;
    setDeliveryArea: (area: string) => void;
    setDeliveryState: (state: string) => void;
    applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
    removeCoupon: () => void;
}



const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
    const [deliveryArea, setDeliveryArea] = useState<string>("CHENNAI");
    const [deliveryState, setDeliveryState] = useState<string>("Tamil Nadu");
    const { user, token, isLoading: authLoading } = useAuth();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // 1. Initial Load: Rules and Initial Cart (Guest vs DB)
    useEffect(() => {
        const loadInitialData = async () => {
            await fetchRules();

            if (!authLoading) {
                if (token) {
                    await fetchBackendCart();
                } else {
                    const savedCart = localStorage.getItem("ps4_cart");
                    if (savedCart) {
                        try {
                            const parsed = JSON.parse(savedCart);
                            setCartItems(parsed);
                        } catch (e) {
                            console.error("Failed to parse cart", e);
                        }
                    }
                }
                setIsInitialLoad(false);
            }
        };

        loadInitialData();
    }, [authLoading, token]);

    const fetchRules = async () => {
        try {
            const [cRes, sRes] = await Promise.all([
                fetch(`${API_URL}/coupons`),
                fetch(`${API_URL}/shipping/rules`)
            ]);
            if (cRes.ok) setAvailableCoupons(await cRes.json());
            if (sRes.ok) setShippingRules(await sRes.json());
        } catch (error) {
            console.error("Failed to fetch rules", error);
        }
    };

    const fetchBackendCart = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch backend cart", error);
        }
    };

    // 2. Guest Persistence: Save to localStorage whenever cartItems changes
    useEffect(() => {
        if (!isInitialLoad && !token) {
            localStorage.setItem("ps4_cart", JSON.stringify(cartItems));
        }
    }, [cartItems, token, isInitialLoad]);

    // 2. Auth Sync: When user logs in, merge local guest cart with DB cart
    useEffect(() => {
        if (user && token) {
            syncCartOnLogin();
        } else if (!user && !token && !authLoading) {
            // Logout cleanup: Clear in-memory cart
            setCartItems([]);
            setAppliedCoupon(null);
            // After clearing memory, the next cycle will load ps4_cart if it exists
        }
    }, [user, token, authLoading]);

    const syncCartOnLogin = async () => {
        const localCart = localStorage.getItem("ps4_cart");
        if (!localCart) return;

        try {
            const guestItems = JSON.parse(localCart);
            if (!Array.isArray(guestItems) || guestItems.length === 0) {
                localStorage.removeItem("ps4_cart");
                return;
            }

            const res = await fetch(`${API_URL}/cart/sync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ items: guestItems })
            });

            if (res.ok) {
                const mergedCart = await res.json();
                setCartItems(mergedCart);
                localStorage.removeItem("ps4_cart");
            }
        } catch (error) {
            console.error("Cart sync error", error);
        }
    };

    const addToCart = async (item: Omit<CartItem, "quantity" | "variantId">, quantityToAdd: number = 1) => {
        const variantId = `${item.id}-${item.weight}`;
        const existingItem = cartItems.find((i) => i.variantId === variantId);
        const newItems = existingItem
            ? cartItems.map((i) => (i.variantId === variantId ? { ...i, quantity: i.quantity + quantityToAdd } : i))
            : [...cartItems, { ...item, variantId, quantity: quantityToAdd }];

        setCartItems(newItems);

        if (user && token) {
            await updateBackendCart(variantId, item.id, item.weight, (existingItem?.quantity || 0) + quantityToAdd);
        }
    };

    const removeFromCart = async (variantId: string) => {
        const newItems = cartItems.filter((i) => i.variantId !== variantId);
        setCartItems(newItems);

        if (user && token) {
            await updateBackendCart(variantId, "", "", 0);
        }
    };

    const updateQuantity = async (variantId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(variantId);
            return;
        }
        const item = cartItems.find(i => i.variantId === variantId);
        const newItems = cartItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i));
        setCartItems(newItems);

        if (user && token && item) {
            await updateBackendCart(variantId, item.id, item.weight, quantity);
        }
    };

    const updateBackendCart = async (variantId: string, productId: string, weight: string, quantity: number) => {
        try {
            await fetch(`${API_URL}/cart`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ variantId, productId, weight, quantity })
            });
        } catch (error) {
            console.error("Failed to sync cart item with backend", error);
        }
    };

    const clearCart = () => {
        setCartItems([]);
        setAppliedCoupon(null);
        localStorage.removeItem("ps4_cart");
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const hasSoldOutItems = cartItems.some(item => item.isSoldOut);

    // Helper to parse weight strings (e.g., "250g", "1kg", "1.5kg") to kg numeric
    const parseWeightToKg = (weightStr: string): number => {
        const numeric = parseFloat(weightStr);
        if (isNaN(numeric)) return 0;
        if (weightStr.toLowerCase().includes('kg')) return numeric;
        if (weightStr.toLowerCase().includes('g')) return numeric / 1000;
        return numeric; // Default to kg if no unit found
    };

    const totalWeight = cartItems.reduce((sum, item) => {
        const itemWeightKg = parseWeightToKg(item.weight);
        return sum + (itemWeightKg * item.quantity);
    }, 0);

    // Helper to match pincode against rule patterns (e.g., "600012" or "600*")
    const isPincodeInArea = (pincode: string, pincodeList: string | null) => {
        if (!pincode || !pincodeList) return false;
        if (pincodeList === "*") return true;
        
        const targets = pincodeList.split(",").map(p => p.trim().toLowerCase());
        const search = pincode.trim().toLowerCase();
        
        return targets.some(target => {
            if (target.endsWith("*")) {
                return search.startsWith(target.slice(0, -1));
            }
            return search === target;
        });
    };

    // TIERED SHIPPING CATEGORIZATION (Priority Based)
    const getActiveRule = () => {
        if (shippingRules.length === 0) return null;

        // Tier 1: Exact Pincode Match (Rule 1: Specific Areas like 600012)
        const exactMatch = shippingRules.find(r => 
            r.pincodes !== "*" && !r.pincodes.includes("*") && isPincodeInArea(deliveryArea, r.pincodes) && r.isActive
        );
        if (exactMatch) return exactMatch;

        // Tier 2: Wildcard Pincode Match (Rule 2: 600* etc)
        const wildcardMatch = shippingRules.find(r => 
            r.pincodes.includes("*") && r.pincodes !== "*" && isPincodeInArea(deliveryArea, r.pincodes) && r.isActive
        );
        if (wildcardMatch) return wildcardMatch;

        // Tier 3: State-based Match (Rule 3: TAMIL NADU)
        if (deliveryState === "Tamil Nadu") {
            const stateMatch = shippingRules.find(r => 
                r.areaName.toUpperCase() === "TAMIL NADU" && r.isActive
            );
            if (stateMatch) return stateMatch;
        }

        // Tier 4: Global Fallback (Rule 4: OTHER STATES)
        return shippingRules.find(r => r.areaName.toUpperCase() === "OTHER STATES" && r.isActive) || null;
    };

    const activeRule = getActiveRule();

    const shippingFee = activeRule
        ? activeRule.baseCharge + Math.max(0, Math.ceil(totalWeight - activeRule.baseWeightLimit)) * activeRule.additionalChargePerKg
        : 0;

    // Calculate Discount
    const isCouponValid = appliedCoupon && Number(totalAmount) >= Number(appliedCoupon.minCartAmount);

    const discountAmount = isCouponValid
        ? (appliedCoupon.type === 'FIXED' ? appliedCoupon.value : (totalAmount * appliedCoupon.value) / 100)
        : 0;

    const finalTotal = totalAmount - discountAmount + shippingFee;

    const applyCoupon = async (code: string) => {
        try {
            const res = await fetch(`${API_URL}/coupons/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, cartTotal: totalAmount })
            });
            const data = await res.json();
            if (data.valid) {
                setAppliedCoupon({
                    id: data.code, // Backend returns code as ID for simulation
                    code: data.code,
                    type: data.type,
                    value: data.value,
                    minCartAmount: data.minCartAmount || 0
                });
                return { success: true, message: "Coupon applied successfully!" };
            }
            return { success: false, message: data.error || "Invalid coupon" };
        } catch (error) {
            return { success: false, message: "Failed to validate coupon" };
        }
    };

    const removeCoupon = () => setAppliedCoupon(null);

    // Auto-remove coupon if cart total drops below minCartAmount
    useEffect(() => {
        if (appliedCoupon) {
            const threshold = Number(appliedCoupon.minCartAmount);
            if (Number(totalAmount) < threshold) {
                setAppliedCoupon(null);
            }
        }
    }, [totalAmount, appliedCoupon]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalAmount,
                totalItems,
                totalWeight,
                hasSoldOutItems,
                appliedCoupon,
                discountAmount,
                shippingFee,
                finalTotal,
                availableCoupons,
                deliveryArea,
                deliveryState,
                setDeliveryArea,
                setDeliveryState,
                applyCoupon,
                removeCoupon
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
