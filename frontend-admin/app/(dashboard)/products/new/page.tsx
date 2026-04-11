"use client";

import ProductForm from "@/components/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewProductPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-500 italic">Expand your sweet collection with a new item.</p>
                </div>
            </div>

            <ProductForm />
        </div>
    );
}
