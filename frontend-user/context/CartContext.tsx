"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    isVeg?: boolean;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity" | "variantId">) => void;
    removeFromCart: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("ps4_cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                setTimeout(() => setCartItems(parsed), 0);
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to local storage whenever cart changes
    useEffect(() => {
        localStorage.setItem("ps4_cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item: Omit<CartItem, "quantity" | "variantId">) => {
        setCartItems((prev) => {
            const variantId = `${item.id}-${item.weight}`;
            const existingItem = prev.find((i) => i.variantId === variantId);

            if (existingItem) {
                return prev.map((i) =>
                    i.variantId === variantId
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }

            return [...prev, { ...item, variantId, quantity: 1 }];
        });
    };

    const removeFromCart = (variantId: string) => {
        setCartItems((prev) => prev.filter((i) => i.variantId !== variantId));
    };

    const updateQuantity = (variantId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(variantId);
            return;
        }
        setCartItems((prev) =>
            prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
