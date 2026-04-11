"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function BrandsSection() {
    return (
        <section className="bg-primary py-20 text-white text-center">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="accent-font text-sm uppercase tracking-[0.4em] font-bold mb-8 opacity-70">The Tastemakers of Chennai</h2>
                    <div className="serif text-5xl md:text-7xl mb-12 font-medium leading-tight">
                        Heritage in every grain, tradition in every bite.
                    </div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 }
                        }
                    }}
                    className="flex flex-wrap justify-center items-center gap-12 mt-20 opacity-90"
                >
                    {/* Logo placeholders for PS4 sub-brands or values */}
                    {[
                        "Srinivasa",
                        "Madras",
                        "PureVeg",
                        "Heritage",
                        "Authentic"
                    ].map((brand, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, scale: 0.9 },
                                show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
                            }}
                            className="text-2xl font-bold italic serif tracking-wide"
                        >
                            {brand}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
