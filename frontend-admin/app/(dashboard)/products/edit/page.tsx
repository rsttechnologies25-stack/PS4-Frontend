"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function EditProductContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    if (!id) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No product ID provided.</p>
                <Link href="/products" className="text-primary hover:underline mt-2 inline-block">Return to Products</Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/products"
                    className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 shadow-sm transition-all"
                >
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-gray-500 italic">Update your product details and availability.</p>
                </div>
            </div>

            <ProductForm productId={id} />
        </div>
    );
}

export default function EditProductPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading product editor...</div>}>
            <EditProductContent />
        </Suspense>
    );
}
