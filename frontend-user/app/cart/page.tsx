"use client";

import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState("cod");

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#FFFBF5] pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Trash2 className="text-primary w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black accent-font text-primary mb-4">Your Cart is Empty</h1>
                <p className="text-text-muted mb-8 text-lg">Looks like you haven't added any sweets yet.</p>
                <Link href="/" className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-secondary transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFFBF5] bg-pattern pt-24 md:pt-32 pb-20">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">

                <div className="mb-6 md:mb-10">
                    <Link href="/" className="inline-flex items-center text-primary font-medium hover:underline mb-4 text-sm">
                        <ArrowLeft size={16} className="mr-2" /> Back to Shop
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black accent-font text-primary">Your Shopping Cart</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN - Cart Items */}
                    <div className="lg:col-span-7 space-y-4 md:space-y-6">
                        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
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
                                                src={item.image && item.image.length > 0 ? item.image : "/hero_motichoor_laddu.jpg"}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex-grow pt-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="serif text-lg sm:text-xl font-medium text-text-main leading-tight mb-1">{item.name}</h3>
                                                    <p className="text-sm text-text-muted font-medium bg-primary/5 inline-block px-2 py-0.5 rounded text-primary">{item.weight}</p>
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
                    </div>

                    {/* RIGHT COLUMN - Checkout Form */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold accent-font text-secondary mb-6 border-b border-gray-100 pb-4">Shipping Address</h2>
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">First Name</label>
                                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="John" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Last Name</label>
                                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Address</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="House No, Street Name" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">City</label>
                                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Chennai" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Zip Code</label>
                                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="600001" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Phone</label>
                                    <input type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="+91 98765 43210" />
                                </div>
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold accent-font text-secondary mb-6 border-b border-gray-100 pb-4">Payment Mode</h2>
                            <div className="space-y-3">
                                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                        className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                    />
                                    <span className="ml-3 font-medium text-text-main">Credit / Debit Card</span>
                                </label>

                                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={() => setPaymentMethod('upi')}
                                        className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                    />
                                    <span className="ml-3 font-medium text-text-main">UPI (GPay, PhonePe)</span>
                                </label>

                                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                    />
                                    <span className="ml-3 font-medium text-text-main">Cash on Delivery</span>
                                </label>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-text-muted font-medium">Subtotal</span>
                                <span className="font-bold text-text-main">₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-text-muted font-medium">Shipping</span>
                                <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-0.5 rounded">Free</span>
                            </div>
                            <div className="border-t border-primary/10 pt-4 flex justify-between items-end mb-6">
                                <span className="text-lg font-bold text-secondary accent-font">Total</span>
                                <span className="text-3xl font-black text-primary serif">₹{totalAmount}</span>
                            </div>

                            <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-secondary transition-all hover:shadow-xl active:scale-[0.98]">
                                Place Order
                            </button>
                            <p className="text-center text-xs text-text-muted mt-4 opacity-70">
                                Secure checkout powered by RST Technologies
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
