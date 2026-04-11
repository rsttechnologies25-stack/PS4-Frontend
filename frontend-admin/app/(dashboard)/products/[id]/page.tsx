"use client";

export const runtime = "edge";

import { useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function EditProductPage() {
    const { id } = useParams();

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

            <ProductForm productId={id as string} />
        </div>
    );
}
