import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { formatImageUrl } from "@/lib/imageHelper";

interface ProductVariant {
    id: string;
    weight: string;
    price: number;
    stock: number;
    isDefault: boolean;
    sortOrder: number;
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}

interface ProductCardProps {
    id: string;
    name: string;
    description?: string;
    price: number;
    image: string;
    weight?: string;
    slug: string;
    variants?: ProductVariant[];
    categoryName?: string;
    categoryId?: string;
    isVeg?: boolean;
    isSoldOut?: boolean;
}

export default function ProductCard({ id, name, price, image, slug, description, variants, categoryName = "Sweets", categoryId, isVeg = true, isSoldOut = false }: ProductCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Manual override: product is definitively sold out if admin toggle is on
    const definitivelySoldOut = isSoldOut;

    // Use variants if available, otherwise fall back to single price
    const sortedVariants = useMemo(() => {
        if (!variants || variants.length === 0) return [];
        return [...variants].sort((a, b) => a.sortOrder - b.sortOrder);
    }, [variants]);

    const defaultVariant = sortedVariants.find(v => v.isDefault) || sortedVariants[0];
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant || null);

    const finalPrice = selectedVariant ? selectedVariant.price : price;
    const selectedWeight = selectedVariant ? selectedVariant.weight : "250g";
    const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;

    // Motion values for 3D tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Cart Context
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock || definitivelySoldOut) return;

        addToCart({
            id,
            name,
            price: finalPrice,
            image,
            weight: selectedWeight,
            slug,
            categoryName,
            categoryId,
            isVeg,
            isSoldOut: definitivelySoldOut
        });
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
            className="group relative flex flex-col bg-white rounded-xl shadow-md border border-gray-100 will-change-transform"
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
                            src={formatImageUrl(image)}
                            alt={`${name} - Authentic ${categoryName} from Perambur Srinivasa Sweets`}
                            fill
                            className={cn(
                                "object-cover transition-all duration-500",
                                definitivelySoldOut && "grayscale contrast-[0.8]"
                            )}
                        />
                    </motion.div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
                        {isVeg && (
                            <div className="bg-[#006837] text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm flex items-center gap-1 shadow-sm">
                                <span className="h-1 w-1 md:h-1.5 md:w-1.5 bg-white rounded-full"></span> Veg
                            </div>
                        )}
                    </div>

                    <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10">
                        <div className="bg-secondary text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full shadow-sm">
                            {categoryName}
                        </div>
                    </div>

                    {definitivelySoldOut ? (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-30 transition-all">
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-red-600 text-white text-[10px] md:text-xs font-black px-4 py-2 rounded-lg shadow-2xl tracking-tighter"
                            >
                                SOLD OUT
                            </motion.span>
                            <p className="text-[8px] md:text-[10px] text-white/60 mt-1 font-bold uppercase tracking-widest">Unavailable for Now</p>
                        </div>
                    ) : (isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
                            <span className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full">OUT OF STOCK</span>
                        </div>
                    ))}
                </Link>

                {/* Content Section */}
                <div className="p-3 md:p-5 flex flex-col flex-grow text-left">
                    <h3 className="serif text-base md:text-xl text-secondary font-medium mb-1 md:mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-1">{name}</h3>

                    <p className="text-[10px] md:text-sm text-text-muted mb-3 md:mb-4 line-clamp-2 leading-relaxed opacity-80">
                        {description || "Crispy, authentic, and made with pure ingredients. A perfect treat for any time of the day."}
                    </p>

                    <div className="mt-auto flex flex-col pt-2">
                        {/* Variant Selector */}
                        <div className="mb-3">
                            {sortedVariants.length > 0 ? (
                                <div className="relative inline-block w-full">
                                    <select
                                        value={selectedVariant?.id || ""}
                                        onChange={(e) => {
                                            const v = sortedVariants.find(v => v.id === e.target.value);
                                            if (v) setSelectedVariant(v);
                                        }}
                                        className="appearance-none w-full bg-white border border-gray-200 text-text-main py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 cursor-pointer transition-all hover:border-gray-300 shadow-sm"
                                    >
                                        {sortedVariants.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.weight} — ₹{v.price}{v.stock <= 0 ? ' (Out of Stock)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs text-text-muted">250g</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="serif text-lg md:text-2xl font-medium text-primary">₹{finalPrice}</span>

                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || definitivelySoldOut}
                                className={`text-[10px] md:text-sm font-bold px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg shadow-md flex items-center gap-1.5 md:gap-2 transition-all duration-300 hover:shadow-lg group/btn z-20 ${(isOutOfStock || definitivelySoldOut)
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                                    : 'bg-primary text-white hover:bg-secondary'
                                    }`}
                            >
                                <ShoppingCart size={14} className="md:w-4 md:h-4 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                                <span>{definitivelySoldOut ? 'Sold Out' : (isOutOfStock ? 'Unavailable' : 'Add')}</span>
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
