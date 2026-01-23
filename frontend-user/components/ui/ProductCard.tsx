import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
    id: string;
    name: string;
    description?: string;
    price: number;
    image: string;
    weight?: string;
    slug: string;
    // Optional props for badges if data becomes available later
    categoryName?: string;
    isVeg?: boolean;
}

export default function ProductCard({ id, name, price, image, slug, description, categoryName = "Sweets", isVeg = true }: ProductCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [selectedWeight, setSelectedWeight] = useState("250g");

    // Calculate Price based on weight
    const getPriceMultiplier = (weight: string) => {
        switch (weight) {
            case "500g": return 2;
            case "1kg": return 4;
            default: return 1;
        }
    };

    const finalPrice = price * getPriceMultiplier(selectedWeight);

    // Motion values for 3D tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Cart Context
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        addToCart({
            id,
            name,
            price: finalPrice,
            image,
            weight: selectedWeight,
            slug,
            categoryName,
            isVeg
        });

        // Removed immediate redirect as requested
    };

    // Spring physics for smooth animation
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial="initial"
            whileHover="hover"
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="group relative flex flex-col bg-white rounded-xl shadow-md border border-gray-100 will-change-transform" // Removed overflow-hidden to allow glow to show behind
        >
            {/* Shader-based Glow Animation (Behind) */}
            <div
                className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"
            />

            {/* Scale Wrapper for content */}
            <motion.div
                variants={{
                    initial: { scale: 1 },
                    hover: { scale: 1.05 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative flex flex-col h-full bg-white rounded-xl overflow-hidden"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Image Section */}
                <Link href={`/product/${slug}`} className="relative aspect-[4/3] overflow-hidden bg-primary/5">
                    {/* Shimmer/Shine Overlay */}
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] transition-all duration-1000 group-hover:left-[200%]" />
                    </div>

                    <motion.div
                        variants={{
                            initial: { scale: 1 },
                            hover: { scale: 1.1 }
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                    >
                        <Image
                            src={image && image.length > 0 ? image : "/hero_motichoor_laddu.jpg"}
                            alt={name || "Product Image"}
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10">
                        {isVeg && (
                            <div className="bg-[#006837] text-white text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                                <span className="h-1.5 w-1.5 bg-white rounded-full"></span> Veg
                            </div>
                        )}
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            {categoryName}
                        </div>
                    </div>

                </Link>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow text-left">
                    <h3 className="serif text-xl text-secondary font-medium mb-2 leading-tight group-hover:text-primary transition-colors">{name}</h3>

                    <p className="text-sm text-text-muted mb-4 line-clamp-2 leading-relaxed opacity-80">
                        {description || "Crispy, authentic, and made with pure ingredients. A perfect treat for any time of the day."}
                    </p>

                    <div className="mt-auto flex flex-col pt-2">
                        {/* Weight Selector */}
                        <div className="mb-3">
                            <div className="relative inline-block w-full">
                                <select
                                    value={selectedWeight}
                                    onChange={(e) => setSelectedWeight(e.target.value)}
                                    className="appearance-none w-full bg-white border border-gray-200 text-text-main py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 cursor-pointer transition-all hover:border-gray-300 shadow-sm"
                                >
                                    <option value="250g">250g</option>
                                    <option value="500g">500g</option>
                                    <option value="1kg">1kg</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="serif text-2xl font-medium text-primary">₹{finalPrice}</span>

                            <button
                                onClick={handleAddToCart}
                                className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 hover:bg-secondary transition-all duration-300 hover:shadow-lg group/btn z-20"
                            >
                                <ShoppingCart size={16} className="group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Border Fade Effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/20 transition-colors duration-500 pointer-events-none" />

            </motion.div>
        </motion.div>
    );
}
