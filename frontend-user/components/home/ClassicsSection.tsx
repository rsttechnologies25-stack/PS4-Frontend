"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const classics = [
    { name: "LADDU", image: "/ps4_sweets_hero_1.png" },
    { name: "MYSORE PAK", image: "/ps4_sweets_hero_1.png" },
    { name: "MURUKKU", image: "/ps4_snacks_hero_1.png" },
];

export default function ClassicsSection() {
    return (
        <section className="py-20 bg-background text-center">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl mx-auto"
                >
                    <h3 className="serif text-secondary text-3xl mb-4 italic">Responsible Indulgence</h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                        We believe that tradition and health can go hand in hand. Our recipes are balanced for purity and taste.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
