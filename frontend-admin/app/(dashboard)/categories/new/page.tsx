"use client";

import CategoryForm from "@/components/CategoryForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewCategoryPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/categories"
                    className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 shadow-sm transition-all"
                >
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
                    <p className="text-gray-500 italic">Create a new container for your sweet products.</p>
                </div>
            </div>

            <CategoryForm />
        </div>
    );
}
