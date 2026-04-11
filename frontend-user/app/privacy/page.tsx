"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicy() {
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
                            Privacy Policy
                        </h1>
                        <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
                        <p className="text-text-muted italic text-lg">
                            Your Privacy Matters to Us
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
                        At Perambur Sri Srinivasa Sweets and Snacks, we are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Information We Collect</h2>
                    <ul className="list-disc pl-6 space-y-2 text-text">
                        <li>Personal information such as name, contact details, and payment information when you place an order.</li>
                        <li>Non-personal information like browsing data for website analytics.</li>
                    </ul>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-2 text-text">
                        <li>To process and deliver your orders.</li>
                        <li>To improve our website and services based on user feedback.</li>
                        <li>To send promotional offers (with your consent).</li>
                    </ul>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Data Sharing</h2>
                    <p className="text-text">
                        We do not share your personal information with third parties, except for payment processing or legal requirements.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Cookies</h2>
                    <p className="text-text">
                        Our website uses cookies to enhance your browsing experience. You can disable cookies in your browser settings.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Data Security</h2>
                    <p className="text-text">
                        We implement secure systems to protect your data from unauthorized access.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Your Rights</h2>
                    <p className="text-text">
                        You can request to view, update, or delete your personal information by contacting us.
                    </p>

                    <h2 className="serif text-2xl text-secondary mt-10 mb-4">Policy Updates</h2>
                    <p className="text-text">
                        This Privacy Policy may be updated periodically. Please review it regularly.
                    </p>

                    <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10">
                        <h2 className="serif text-2xl text-primary mt-0 mb-4">Contact Us</h2>
                        <p className="text-text mb-2">For privacy-related concerns, email us at:</p>
                        <p className="font-bold text-secondary">
                            <a href="mailto:info@perambursrinivasa.com" className="hover:text-primary transition-colors">info@perambursrinivasa.com</a>
                        </p>
                        <p className="font-bold text-secondary mt-2">
                            <a href="tel:+919282445577" className="hover:text-primary transition-colors">+91 92824 45577</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
