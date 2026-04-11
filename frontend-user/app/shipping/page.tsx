"use client";

import { motion } from "framer-motion";

export default function ShippingPolicy() {
    return (
        <main className="bg-[#FFFBF5] min-h-screen pb-20 pt-24 md:pt-32">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black accent-font text-primary mb-4 uppercase tracking-wider">
                            Shipping Policy
                        </h1>
                        <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
                        <p className="text-text-muted italic text-lg">
                            Fast & Safe Delivery of Your Treats
                        </p>
                    </motion.div>
                </div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-primary/10 shadow-xl prose prose-brown max-w-none"
                >
                    <p className="lead text-lg mb-10">
                        Perambur Sri Srinivasa Sweets and Snacks (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website Perambur Sri Srinivasa Sweets. By placing an order through our Website, you agree to the terms outlined below. These terms are intended to clearly define mutual responsibilities and set expectations to ensure a smooth and transparent transaction.
                    </p>

                    <h2 className="serif text-3xl text-secondary mt-12 mb-6 border-b border-primary/10 pb-2">1. Delivery Terms</h2>

                    <h3 className="serif text-xl text-primary mt-8 mb-4 uppercase tracking-wider">Estimated Delivery Timeframes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="font-bold text-secondary mb-1">Chennai:</p>
                            <p className="text-text">1 to 2 business days</p>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="font-bold text-secondary mb-1">Rest of Tamil Nadu (ROTN):</p>
                            <p className="text-text">2 to 3 business days</p>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="font-bold text-secondary mb-1">Rest of India (ROI):</p>
                            <p className="text-text">3 to 4 business days</p>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="font-bold text-secondary mb-1">Remote Locations:</p>
                            <p className="text-text">8 to 9 business days</p>
                        </div>
                    </div>

                    <h3 className="serif text-xl text-primary mt-8 mb-4 uppercase tracking-wider">Out-of-Stock Items</h3>
                    <p className="text-text">
                        If any item in your order is currently unavailable, we will hold the shipment until the item is back in stock. The available items in your order will be reserved during this period.
                    </p>

                    <h3 className="serif text-xl text-primary mt-8 mb-4 uppercase tracking-wider">Delivery Delays</h3>
                    <p className="text-text">
                        If your order is delayed beyond the expected timeframe, please reach out to us so we can investigate and resolve the issue promptly.
                    </p>

                    <h2 className="serif text-3xl text-secondary mt-12 mb-6 border-b border-primary/10 pb-2">2. Shipping Charges</h2>
                    <p className="text-text">
                        Shipping costs are calculated during the checkout process based on the weight, size, and destination of your order. These charges are collected at the time of purchase and represent the final cost for shipping.
                    </p>

                    <h2 className="serif text-3xl text-secondary mt-12 mb-6 border-b border-primary/10 pb-2">3. Stock Availability</h2>
                    <p className="text-text mb-4">
                        All orders are processed subject to product availability. While we strive to maintain accurate stock levels on our Website, discrepancies may occasionally occur. If we are unable to fulfill your entire order:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text">
                        <li>We will ship the available items, and</li>
                        <li>Contact you to choose between waiting for the restock or receiving a refund for the missing item(s).</li>
                    </ul>

                    <h2 className="serif text-3xl text-secondary mt-12 mb-6 border-b border-primary/10 pb-2">4. Shipment Tracking</h2>
                    <p className="text-text">
                        Once your order has been dispatched, you will receive a tracking link to monitor your shipment in real-time, based on updates provided by our courier partner.
                    </p>

                    <h2 className="serif text-3xl text-secondary mt-12 mb-6 border-b border-primary/10 pb-2">5. Damaged or Lost Shipments</h2>

                    <h3 className="serif text-xl text-primary mt-8 mb-4 uppercase tracking-wider">Damaged Shipments</h3>
                    <p className="text-text mb-4">
                        If you receive a damaged package, please refuse the delivery (if possible) and notify our customer service team immediately. If you were not present at the time of delivery, contact us with details and next steps will be provided.
                    </p>
                    <p className="text-text">
                        Refunds or replacements will be processed once the courier completes their damage assessment.
                    </p>

                    <h3 className="serif text-xl text-primary mt-8 mb-4 uppercase tracking-wider">Lost Shipments</h3>
                    <p className="text-text">
                        In cases where a package is confirmed lost by the courier following their investigation, we will initiate a refund or replacement.
                    </p>

                    <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                        <h2 className="serif text-2xl text-primary mt-0 mb-4">Customer Support</h2>
                        <p className="text-text mb-4 italic">For any questions or support regarding your order, please email us at:</p>
                        <p className="font-bold text-3xl text-secondary text-primary">
                            <a href="mailto:info@perambursrinivasa.com" className="hover:text-primary transition-colors">info@perambursrinivasa.com</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
