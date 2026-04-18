"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    ArrowRight,
    CheckCircle,
    MessageSquare,
    AlertCircle,
    CornerDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useDispatchInfo } from "@/hooks/useDispatchInfo";
import ProductCard from "@/components/ui/ProductCard";
import { API_URL } from "@/lib/api";
import { getProductBySlug, getProductsByCategory } from "@/lib/staticData";
import { formatImageUrl } from "@/lib/imageHelper";

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}

interface ProductVariant {
    id: string;
    weight: string;
    price: number;
    stock: number;
    isDefault: boolean;
    sortOrder: number;
}

interface ProductImage {
    id: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
    sortOrder: number;
}

interface Product {
    id: string;
    name: string;
    description: string;
    deliveryInfo?: string;
    price?: number;
    image: string;
    slug: string;
    categoryId: string;
    isBestSeller: boolean;
    isNewLaunch: boolean;
    isSoldOut: boolean;
    variants?: ProductVariant[];
    images?: ProductImage[];
    averageRating?: number;
    reviewCount?: number;
    category?: {
        name: string;
        slug: string;
        deliveryInfo?: string;
        parent?: {
            deliveryInfo?: string;
        };
    }
}

export default function ProductClient({ slug }: { slug: string }) {
    const { addToCart } = useCart();
    const { token, user } = useAuth();
    const { dispatchLabel, timeLeftString, deliveryEstimate, progress, limitTextTemplate } = useDispatchInfo();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("description");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", customerName: "" });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState({ type: "", text: "" });

    // Use real images from API, fall back to legacy single image field
    const productImages = product ? (
        product.images && product.images.length > 0
            ? product.images.map(img => img.url)
            : [product.image]
    ) : [];

    const deliveryInfo = product?.deliveryInfo || product?.category?.deliveryInfo || product?.category?.parent?.deliveryInfo;

    useEffect(() => {

        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API_URL}/products/${slug}`);
                if (!res.ok) throw new Error("Product not found");
                const data = await res.json();
                setProduct(data);

                // Pre-select default variant
                if (data.variants && data.variants.length > 0) {
                    const defaultVar = data.variants.find((v: ProductVariant) => v.isDefault) || data.variants[0];
                    setSelectedVariant(defaultVar);
                }

                const relRes = await fetch(`${API_URL}/products?category=${data.category.slug}&limit=20`);
                const relDataRaw = await relRes.json();
                const relData = Array.isArray(relDataRaw) ? relDataRaw : (relDataRaw?.data || []);
                setRelatedProducts(relData.filter((p: Product) => p.slug !== slug).slice(0, 4));
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchProduct();
    }, [slug]);

    useEffect(() => {
        if (!product?.id || activeTab !== 'reviews') return;

        const fetchReviews = async () => {
            setLoadingReviews(true);
            try {
                const res = await fetch(`${API_URL}/reviews/product/${product.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [product?.id, activeTab]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReview(true);
        setReviewMessage({ type: "", text: "" });

        if (!token) {
            setReviewMessage({ type: "error", text: "Please login to write a review" });
            setSubmittingReview(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product?.id,
                    ...reviewForm
                })
            });

            const data = await res.json();
            if (res.ok) {
                setReviewMessage({ type: "success", text: "Your review has been submitted successfully!" });
                setReviewForm({ rating: 5, comment: "", customerName: "" });
            } else {
                setReviewMessage({ type: "error", text: data.error || "Failed to submit review" });
            }
        } catch (error) {
            setReviewMessage({ type: "error", text: "Something went wrong. Please try again." });
        } finally {
            setSubmittingReview(false);
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

    const variants = product.variants || [];
    const finalPrice = selectedVariant ? selectedVariant.price : (product.price || 0);
    const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;
    const definitivelySoldOut = product.isSoldOut;

    const handleAdd = () => {
        // Fallback for products without variants
        const price = selectedVariant ? selectedVariant.price : (product.price || 0);
        const weight = selectedVariant ? selectedVariant.weight : "250g";
        const outOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;

        if (outOfStock || definitivelySoldOut) return;

        setIsAdding(true);
        addToCart({
            id: product.id,
            name: product.name,
            price: price,
            image: product.image,
            weight: weight,
            slug: product.slug,
            categoryName: product.category?.name || "Sweets",
            categoryId: product.categoryId,
            isVeg: true,
            isSoldOut: definitivelySoldOut
        }, quantity);

        setTimeout(() => {
            setIsAdding(false);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 3000);
        }, 600);
    };

    const handleBuyNow = () => {
        const price = selectedVariant ? selectedVariant.price : (product.price || 0);
        const weight = selectedVariant ? selectedVariant.weight : "250g";
        const outOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;

        if (outOfStock || definitivelySoldOut) return;

        addToCart({
            id: product.id,
            name: product.name,
            price: price,
            image: product.image,
            weight: weight,
            slug: product.slug,
            categoryName: product.category?.name || "Sweets",
            categoryId: product.categoryId,
            isVeg: true,
            isSoldOut: definitivelySoldOut
        }, quantity);

        router.push("/cart");
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": product.name,
                        "image": productImages.map(img => formatImageUrl(img)),
                        "description": product.description,
                        "sku": product.id,
                        "brand": {
                            "@type": "Brand",
                            "name": "Perambur Srinivasa Sweets"
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": `https://perambursrinivasa.co.in/product/${product.slug}`,
                            "priceCurrency": "INR",
                            "price": finalPrice,
                            "availability": definitivelySoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                            "itemCondition": "https://schema.org/NewCondition"
                        },
                        ...(product.averageRating ? {
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": product.averageRating,
                                "reviewCount": product.reviewCount || 1
                            }
                        } : {})
                    }),
                }}
            />
            <main className="min-h-screen bg-[#FFFBF5] pt-28 pb-20">
            <div className="container mx-auto px-4 md:px-6">

                <nav className="mb-8 text-sm text-text-muted flex items-center gap-2">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href={`/category/${product.category?.slug}`} className="hover:text-primary transition-colors">{product.category?.name}</Link>
                    <span>/</span>
                    <span className="text-primary font-bold">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
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
                                        src={formatImageUrl(productImages[currentImageIndex] || product.image)}
                                        alt={product.name}
                                        fill
                                        className={cn(
                                            "object-cover transition-transform duration-700 group-hover:scale-110",
                                            definitivelySoldOut && "grayscale contrast-[0.8]"
                                        )}
                                    />
                                    {definitivelySoldOut && (
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-20">
                                            <span className="bg-red-600 text-white text-xl font-black px-8 py-3 rounded-xl shadow-2xl tracking-tighter">
                                                SOLD OUT
                                            </span>
                                            <p className="text-white/60 mt-2 font-bold uppercase tracking-widest text-xs">Currently Unavailable</p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

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

                        <div className="flex gap-4">
                            {productImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-primary ring-4 ring-primary/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <Image src={formatImageUrl(productImages[idx])} alt={`Product image ${idx + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h1 className="serif text-4xl md:text-5xl lg:text-6xl text-secondary font-bold mb-4 leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex text-primary">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        fill={i < Math.round(product.averageRating || 0) ? "currentColor" : "none"}
                                        className={i < Math.round(product.averageRating || 0) ? "" : "text-gray-300"}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-text-muted font-bold">
                                {product.averageRating?.toFixed(1) || "0.0"} ({product.reviewCount || 0} Reviews)
                            </span>
                        </div>

                        <p className="text-text-muted text-lg leading-relaxed mb-8 opacity-90 italic">
                            {product.description || "A timeless classic from the kitchens of Perambur Sri Srinivasa. Made with the finest ingredients and pure ghee, every bite is a celebration of tradition."}
                        </p>

                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 mb-8">
                            <div className="flex items-end gap-3 mb-8">
                                <span className="serif text-4xl md:text-5xl font-black text-primary">₹{finalPrice}</span>
                                {selectedVariant && (
                                    <span className="text-text-muted text-sm font-bold mb-2 ml-2">
                                        / {selectedVariant.weight}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-6 mb-8">
                                {variants.length > 0 && (
                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">Select Size</label>
                                        <div className="flex flex-wrap gap-3">
                                            {variants.map((v) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => setSelectedVariant(v)}
                                                    disabled={v.stock <= 0 || definitivelySoldOut}
                                                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 relative ${(v.stock <= 0 || definitivelySoldOut)
                                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                        : selectedVariant?.id === v.id
                                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                                            : 'bg-white border-gray-100 text-text hover:border-primary/30'
                                                        }`}
                                                >
                                                    <span className={cn((v.stock <= 0 || definitivelySoldOut) && "line-through")}>{v.weight}</span>
                                                    <span className="ml-1.5 text-[11px] opacity-80">- ₹{v.price}</span>
                                                    {(v.stock <= 0 || definitivelySoldOut) && (
                                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                                            OUT
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                    disabled={isAdding || (selectedVariant ? selectedVariant.stock <= 0 : false) || definitivelySoldOut}
                                    className={`flex-1 font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] relative overflow-hidden ${(isAdding || (selectedVariant ? selectedVariant.stock <= 0 : false) || definitivelySoldOut)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                        : addedToCart
                                            ? 'bg-green-600 text-white shadow-green-200'
                                            : 'bg-primary text-white shadow-primary/20 hover:bg-secondary'
                                        }`}
                                >
                                    <AnimatePresence mode="wait">
                                        {isAdding ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"
                                            />
                                        ) : addedToCart ? (
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center gap-2"
                                            >
                                                <CheckCircle size={20} /> ADDED!
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="normal"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center gap-3"
                                            >
                                                <ShoppingCart size={20} /> {definitivelySoldOut ? 'SOLD OUT' : ((selectedVariant ? selectedVariant.stock <= 0 : false) ? 'OUT OF STOCK' : 'ADD TO CART')}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={(selectedVariant ? selectedVariant.stock <= 0 : false) || definitivelySoldOut}
                                    className={`flex-1 font-bold py-4 rounded-xl transition-all active:scale-[0.98] ${((selectedVariant ? selectedVariant.stock <= 0 : false) || definitivelySoldOut)
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-secondary text-white hover:bg-black'
                                        }`}
                                >
                                    BUY IT NOW
                                </button>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                    <Clock size={18} /> {timeLeftString ? limitTextTemplate.replace('{time}', timeLeftString) : 'ORDER NOW FOR FAST DISPATCH'}
                                </div>
                                <div className="text-text-muted text-[10px] font-black uppercase tracking-wider">{dispatchLabel}</div>
                            </div>
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(progress, 33.33)}%` }}
                                ></div>
                                <div 
                                    className="absolute inset-y-0 bg-primary/40 transition-all duration-1000"
                                    style={{ left: '33.33%', width: `${Math.max(0, Math.min(progress - 33.33, 33.33))}%` }}
                                ></div>
                                <div 
                                    className="absolute inset-y-0 bg-primary/10 transition-all duration-1000"
                                    style={{ left: '66.66%', width: `${Math.max(0, Math.min(progress - 66.66, 33.34))}%` }}
                                ></div>
                            </div>
                            <div className="grid grid-cols-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <div className="text-primary">Ordered</div>
                                <div className="text-center">Dispatched</div>
                                <div className="text-right">Delivered ({deliveryEstimate})</div>
                            </div>
                        </div>
                    </div>
                </div>

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
                                <p className="text-lg">{product.description || 'This product is a testament to the artisan heritage of Perambur Sri Srinivasa. Every batch is carefully monitored for texture, aroma, and taste, ensuring that our customers receive nothing but the best.'}</p>
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
                                {deliveryInfo ? (
                                    deliveryInfo.split('\n').filter(Boolean).map((line, i) => (
                                        <div key={i} className="bg-white p-6 rounded-2xl border border-primary/10">
                                            <p>{line}</p>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="bg-white p-6 rounded-2xl border border-primary/10">
                                            <h4 className="font-bold text-secondary mb-2">Chennai Delivery</h4>
                                            <p>Orders placed before 3:00 PM will be delivered on the next business day by 7:00 PM.</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-primary/10">
                                            <h4 className="font-bold text-secondary mb-2">Rest of India</h4>
                                            <p>Dispatch occurs within 24 hours. Estimated delivery time is 2-4 business days.</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                {/* Review Summary / Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white p-8 rounded-3xl border border-primary/5">
                                    <div className="text-center md:border-r border-gray-100">
                                        <div className="text-6xl font-black text-secondary mb-2">{product.averageRating?.toFixed(1) || "0.0"}</div>
                                        <div className="flex justify-center text-primary mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={20} fill={i < Math.round(product.averageRating || 0) ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                        <div className="text-xs font-bold text-text-muted uppercase tracking-widest">Average Rating</div>
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            const count = reviews.filter(r => r.rating === rating).length;
                                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                            return (
                                                <div key={rating} className="flex items-center gap-4">
                                                    <span className="text-xs font-bold w-4">{rating}</span>
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            className="h-full bg-primary"
                                                        />
                                                    </div>
                                                    <span className="text-xs text-text-muted w-10 text-right">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Review Form */}
                                <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                                    <h3 className="serif text-2xl text-secondary mb-6 flex items-center gap-3">
                                        <MessageSquare className="text-primary" /> Write a Review
                                    </h3>

                                    {!token && (
                                        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                                            <AlertCircle size={18} /> Please login to write a review
                                        </div>
                                    )}

                                    {reviewMessage.text && (
                                        <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${reviewMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {reviewMessage.text}
                                        </div>
                                    )}

                                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">Your Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={reviewForm.customerName}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                                                    placeholder="Enter your name"
                                                    className="w-full bg-white border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">Rating</label>
                                                <div className="flex gap-2 p-3 bg-white rounded-xl border border-gray-100 w-fit">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                            className="text-primary hover:scale-110 transition-transform"
                                                        >
                                                            <Star size={24} fill={star <= reviewForm.rating ? "currentColor" : "none"} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">Your Experience</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                placeholder="What did you like about this product?"
                                                className="w-full bg-white border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="bg-primary text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:bg-secondary transition-all disabled:opacity-50"
                                        >
                                            {submittingReview ? "SUBMITTING..." : "POST REVIEW"}
                                        </button>
                                    </form>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-8">
                                    <h3 className="serif text-2xl text-secondary flex items-center gap-3">
                                        Customer Reviews <span className="text-text-muted text-lg font-normal">({reviews.length})</span>
                                    </h3>

                                    {loadingReviews ? (
                                        <div className="flex justify-center p-12">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : reviews.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                            <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
                                            <p className="text-text-muted">No reviews yet. Be the first to review this product!</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            {reviews.map((review) => (
                                                <div key={review.id} className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h4 className="font-bold text-secondary">{review.customerName}</h4>
                                                                {review.isVerified && (
                                                                    <span className="bg-green-50 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-100">
                                                                        <CheckCircle size={10} /> VERIFIED PURCHASER
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex text-primary">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-text-muted font-medium">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-text-muted leading-relaxed italic">"{review.comment}"</p>

                                                    {review.adminReply && (
                                                        <div className="mt-6 ml-4 md:ml-8 p-6 bg-primary/5 rounded-2xl border-l-4 border-primary relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <CornerDownRight size={16} className="text-primary" />
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Official Response</span>
                                                                {review.repliedAt && (
                                                                    <span className="text-[9px] text-text-muted font-bold ml-auto">
                                                                        {new Date(review.repliedAt).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-secondary text-sm font-medium italic relative z-10">
                                                                "{review.adminReply}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

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
                            <ProductCard key={p.id} {...p} price={p.variants?.find(v => v.isDefault)?.price || p.variants?.[0]?.price || p.price || 0} categoryName={product.category?.name} categoryId={p.categoryId} isVeg={true} isSoldOut={p.isSoldOut} />
                        ))}
                    </div>
                </section>

            </div>
        </main>
        </>
    );
}
