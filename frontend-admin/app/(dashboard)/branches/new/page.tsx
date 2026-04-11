"use client";

import BranchForm from "@/components/BranchForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewBranchPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/branches"
                    className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 shadow-sm transition-all"
                >
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Branch</h1>
                    <p className="text-gray-500 italic">Register a new store location for customers to visit.</p>
                </div>
            </div>

            <BranchForm />
        </div>
    );
}
