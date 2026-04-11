"use client";

import Link from "next/link";
import { Leaf, Award, ShieldCheck, Zap, Truck, Heart } from "lucide-react";
import { motion } from "framer-motion";

const trustItems = [
    { icon: Leaf, title: "100% Vegetarian", desc: "Pure veg recipes" },
    { icon: Award, title: "Traditional Recipes", desc: "Authentic taste" },
    { icon: ShieldCheck, title: "Hygienic Manufacturing", desc: "50,000 sq.ft facility" },
    { icon: Zap, title: "Premium Ingredients", desc: "Quality first" },
    { icon: Heart, title: "No Artificial Preservatives", desc: "Fresh & natural" },
];

export default function TrustSection() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.15 }
                        }
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center"
                >
                    {trustItems.map((item, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
                            }}
                            className="flex flex-col items-center"
                        >
                            <div className="mb-4 text-primary p-4 bg-primary/10 rounded-full">
                                <item.icon size={32} strokeWidth={1} />
                            </div>
                            <h4 className="accent-font text-sm uppercase tracking-widest font-bold text-secondary mb-2">{item.title}</h4>
                            <p className="text-xs text-text-muted">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
