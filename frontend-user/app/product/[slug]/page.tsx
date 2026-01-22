"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    ShoppingCart,
    Truck,
    ShieldCheck,
    Clock,
    Leaf,
    Star,
    ChevronDown,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ui/ProductCard";
import { API_URL } from "@/lib/api";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    slug: string;
    categoryId: string;
    isBestSeller: boolean;
    isNewLaunch: boolean;
    category?: {
        name: string;
        slug: string;
    }
}

export default function ProductDetailPage() {
    const { slug } = useParams();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeight, setSelectedWeight] = useState("250g");
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("description");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Hardcoded more images for the "Masterpiece" feel since the DB only has one
    const productImages = product ? [
        product.image,
        product.image, // In a real app these would be different
        product.image,
    ] : [];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API_URL}/products/${slug}`);
                if (!res.ok) throw new Error("Product not found");
                const data = await res.json();
                setProduct(data);

                // Fetch related products
                const relRes = await fetch(`${API_URL}/products?category=${data.category.slug}`);
                const relData = await relRes.json();
                setRelatedProducts(relData.filter((p: any) => p.slug !== slug).slice(0, 4));
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchProduct();
    }, [slug]);

    const getPriceMultiplier = (weight: string) => {
        switch (weight) {
            case "500g": return 2;
            case "1kg": return 4;
            default: return 1;
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF5]">
            <h1 className="text-4xl font-black accent-font text-primary mb-4">Product Not Found</h1>
            <Link href="/" className="text-secondary hover:underline">Return to Home</Link>
        </div>
    );

    const finalPrice = product.price * getPriceMultiplier(selectedWeight);

    const handleAdd = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: finalPrice,
            image: product.image,
            weight: selectedWeight,
            slug: product.slug,
            categoryName: product.category?.name || "Sweets",
            isVeg: true
        });
    };

    return (
        <main className="min-h-screen bg-[#FFFBF5] bg-pattern pt-28 pb-20">
            <div className="container mx-auto px-4 md:px-6">

                {/* Breadcrumbs */}
                <nav className="mb-8 text-sm text-text-muted flex items-center gap-2">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href={`/category/${product.category?.slug}`} className="hover:text-primary transition-colors">{product.category?.name}</Link>
                    <span>/</span>
                    <span className="text-primary font-bold">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

                    {/* LEFT: Gallery Section */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-xl group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full"
                                >
                                    <Image
                                        src={product.image || "/hero_motichoor_laddu.jpg"}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Badges */}
                            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                <div className="bg-[#006837] text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                    <span className="h-2 w-2 bg-white rounded-full"></span> 100% VEG
                                </div>
                                {product.isBestSeller && (
                                    <div className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                                        BEST SELLER
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4">
                            {productImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-primary ring-4 ring-primary/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <Image src={product.image || "/hero_motichoor_laddu.jpg"} alt="thumb" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Info Section */}
                    <div className="flex flex-col">
                        <h1 className="serif text-4xl md:text-5xl lg:text-6xl text-secondary font-bold mb-4 leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex text-primary">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <span className="text-sm text-text-muted font-medium">(150+ Reviews)</span>
                        </div>

                        <p className="text-text-muted text-lg leading-relaxed mb-8 opacity-90 italic">
                            {product.description || "A timeless classic from the kitchens of Perambur Sri Srinivasa. Made with the finest ingredients and pure ghee, every bite is a celebration of tradition."}
                        </p>

                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 mb-8">
                            <div className="flex items-end gap-3 mb-8">
                                <span className="serif text-4xl md:text-5xl font-black text-primary">₹{finalPrice}</span>
                                <span className="text-text-muted text-lg line-through mb-1 opacity-50">₹{finalPrice + 100}</span>
                            </div>

                            {/* Options */}
                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">Select Weight</label>
                                    <div className="flex flex-wrap gap-3">
                                        {["250g", "500g", "1kg"].map((w) => (
                                            <button
                                                key={w}
                                                onClick={() => setSelectedWeight(w)}
                                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${selectedWeight === w ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-gray-100 text-text hover:border-primary/30'}`}
                                            >
                                                {w}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">Quantity</label>
                                    <div className="flex items-center border-2 border-gray-100 rounded-full w-fit bg-white px-2 py-1">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center text-text hover:text-primary transition-colors"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-12 text-center font-bold text-secondary">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center text-text hover:text-primary transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 bg-primary text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart size={20} /> ADD TO CART
                                </button>
                                <button className="flex-1 bg-secondary text-white font-bold py-4 rounded-xl hover:bg-black transition-all active:scale-[0.98]">
                                    BUY IT NOW
                                </button>
                            </div>
                        </div>

                        {/* Delivery Logic Bar */}
                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                    <Clock size={18} /> ORDER WITHIN 3 HOURS
                                </div>
                                <div className="text-text-muted text-xs font-bold">DISPATCH BY TODAY</div>
                            </div>
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                                <div className="absolute inset-y-0 left-0 w-1/3 bg-primary rounded-full"></div>
                                <div className="absolute inset-y-0 left-1/3 w-1/3 bg-primary/30"></div>
                            </div>
                            <div className="grid grid-cols-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <div className="text-primary">Ordered</div>
                                <div className="text-center">Dispatched</div>
                                <div className="text-right">Delivered</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FEATURE BAR */}
                <div className="bg-secondary/90 backdrop-blur-md rounded-3xl p-8 mb-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
                    <div className="flex flex-col items-center text-center gap-3">
                        <ShieldCheck size={32} className="text-primary" strokeWidth={1.5} />
                        <span className="text-xs font-bold tracking-widest uppercase">QUALITY ASSURANCE</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-3">
                        <Clock size={32} className="text-primary" strokeWidth={1.5} />
                        <span className="text-xs font-bold tracking-widest uppercase">FRESHLY PREPARED</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-3">
                        <Truck size={32} className="text-primary" strokeWidth={1.5} />
                        <span className="text-xs font-bold tracking-widest uppercase">FREE SHIPPING</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-3">
                        <Leaf size={32} className="text-primary" strokeWidth={1.5} />
                        <span className="text-xs font-bold tracking-widest uppercase">100% PURE VEG</span>
                    </div>
                </div>

                {/* DETAILS TABS */}
                <div className="max-w-4xl mx-auto mb-20">
                    <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                        {["description", "delivery-info", "reviews"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === t ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                            >
                                {t.replace('-', ' ')}
                                {activeTab === t && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
                            </button>
                        ))}
                    </div>

                    <div className="prose max-w-none text-text-muted leading-relaxed">
                        {activeTab === 'description' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <p className="text-lg">This product is a testament to the artisan heritage of Perambur Sri Srinivasa. Every batch is carefully monitored for texture, aroma, and taste, ensuring that our customers receive nothing but the best.</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                                    <li className="flex gap-3 bg-white p-4 rounded-xl border border-gray-100"><ArrowRight size={18} className="text-primary shrink-0" /> Zero preservatives added</li>
                                    <li className="flex gap-3 bg-white p-4 rounded-xl border border-gray-100"><ArrowRight size={18} className="text-primary shrink-0" /> Made with pure Cow Ghee</li>
                                    <li className="flex gap-3 bg-white p-4 rounded-xl border border-gray-100"><ArrowRight size={18} className="text-primary shrink-0" /> Traditional authentic recipe</li>
                                    <li className="flex gap-3 bg-white p-4 rounded-xl border border-gray-100"><ArrowRight size={18} className="text-primary shrink-0" /> Hygienically packed for freshness</li>
                                </ul>
                            </div>
                        )}
                        {activeTab === 'delivery-info' && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                <div className="bg-white p-6 rounded-2xl border border-primary/10">
                                    <h4 className="font-bold text-secondary mb-2">Chennai Delivery</h4>
                                    <p>Orders placed before 3:00 PM will be delivered on the next business day by 7:00 PM.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-primary/10">
                                    <h4 className="font-bold text-secondary mb-2">Rest of India</h4>
                                    <p>Dispatch occurs within 24 hours. Estimated delivery time is 2-4 business days.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RELATED PRODUCTS */}
                <section>
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="accent-font text-primary uppercase tracking-[0.4em] text-sm mb-4">Discover More</h2>
                            <h3 className="serif text-secondary text-4xl md:text-5xl">You Might Also Like</h3>
                        </div>
                        <Link href={`/category/${product.category?.slug}`} className="text-primary font-bold flex items-center gap-2 hover:underline">
                            View All <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} {...p} categoryName={product.category?.name} isVeg={true} />
                        ))}
                    </div>
                </section>

            </div>
        </main>
    );
}
