"use client";

import { motion } from "framer-motion";

export default function RefundPolicy() {
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
                            Refund Policy
                        </h1>
                        <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
                        <p className="text-text-muted italic text-lg">
                            Our Commitment to Your Satisfaction
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
                    <p className="lead text-lg mb-8">
                        At Perambur Sri Srinivasa Sweets and Snacks, we take great pride in the quality of our products. Due to the perishable nature of our sweets and snacks, our refund policy is designed to be fair while ensuring food safety.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Refunds & Returns</h2>
                    <p className="text-text mb-4">
                        We generally do not accept returns for food products once they have been delivered, except in cases where:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text">
                        <li>The product received is damaged or tampered with.</li>
                        <li>The product received is past its expiry date at the time of delivery.</li>
                        <li>The wrong item was delivered.</li>
                    </ul>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">How to Request a Refund</h2>
                    <p className="text-text mb-4">
                        If you receive a product that meets any of the criteria above, please:
                    </p>
                    <ul className="list-decimal pl-6 space-y-2 text-text">
                        <li>Contact us within 24 hours of delivery.</li>
                        <li>Provide your order number and clear photographs of the issue.</li>
                        <li>Email the details to <a href="mailto:info@perambursrinivasa.com" className="text-primary font-bold">info@perambursrinivasa.com</a>.</li>
                    </ul>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Cancellation Policy</h2>
                    <p className="text-text">
                        Orders can be cancelled only before they are dispatched. Once the order has been handed over to our delivery partner, cancellations are not possible.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Non-Refundable Situations</h2>
                    <p className="text-text mb-4">
                        Refunds will not be issued in the following cases:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text">
                        <li>Incorrect or incomplete shipping address provided by the customer.</li>
                        <li>The recipient is unavailable at the time of delivery after multiple attempts.</li>
                        <li>Minor taste/texture variations (as our products are handcrafted).</li>
                    </ul>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Processing Time</h2>
                    <p className="text-text">
                        Approved refunds will be processed within 5-7 business days and will be credited back to the original payment method used during the purchase.
                    </p>

                    <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10">
                        <h2 className="serif text-2xl text-primary mt-0 mb-4">Need Help?</h2>
                        <p className="text-text">Our customer support team is here to help you. Reach out to us via email or phone for any refund-related queries.</p>
                        <p className="font-bold text-secondary mt-4">
                            Email: <a href="mailto:info@perambursrinivasa.com" className="hover:text-primary">info@perambursrinivasa.com</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
