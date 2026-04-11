"use client";

import { motion } from "framer-motion";

export default function TermsAndConditions() {
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
                            Terms & Conditions
                        </h1>
                        <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
                        <p className="text-text-muted italic text-lg">
                            Rules & Guidelines for Using Our Services
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
                        Welcome to Perambur Sri Srinivasa Sweets and Snacks. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Proprietorship</h2>
                    <p className="text-text">
                        The website Perambur Sri Srinivasa Sweets and Snacks is owned and operated by Perambur Sri Srinivasa Sweets and Snacks.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Acceptance of Terms</h2>
                    <p className="text-text">
                        By using this website, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Product Availability</h2>
                    <p className="text-text">
                        While we strive to ensure that all products listed on the website are available, we cannot guarantee stock at all times. In the event of unavailability, we will inform you as soon as possible.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Pricing and Payment</h2>
                    <p className="text-text">
                        All prices are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices without prior notice. Payment must be made in full at the time of ordering.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Order Cancellation and Refunds</h2>
                    <p className="text-text">
                        Orders can be cancelled within a limited timeframe after placement. After this period, no cancellations will be accepted. Refunds for cancelled orders or damaged products will be processed as per our internal policies.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Intellectual Property</h2>
                    <p className="text-text">
                        All content on this website, including text, graphics, logos, and images, is the property of Perambur Sri Srinivasa Sweets and Snacks and is protected by intellectual property laws.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Limitation of Liability</h2>
                    <p className="text-text">
                        Perambur Sri Srinivasa Sweets and Snacks shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Governing Law</h2>
                    <p className="text-text">
                        These Terms and Conditions are governed by the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Chennai.
                    </p>

                    <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10">
                        <h2 className="serif text-2xl text-primary mt-0 mb-4">Contact Information</h2>
                        <p className="text-text mb-4 italic">For any questions regarding these Terms and Conditions, please contact us at:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="font-bold text-secondary">Address:</p>
                                <p className="text-text">No 23/16 Perambur High Road,<br />Perambur, Chennai - 600011</p>
                            </div>
                            <div>
                                <p className="font-bold text-secondary">Email & Phone:</p>
                                <p className="text-text">
                                    <a href="mailto:info@perambursrinivasa.com" className="hover:text-primary transition-colors">info@perambursrinivasa.com</a><br />
                                    <a href="tel:+919282445577" className="hover:text-primary transition-colors">+91 92824 45577</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
