"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BranchForm from "@/components/BranchForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function EditBranchContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    if (!id) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No branch ID provided.</p>
                <Link href="/branches" className="text-primary hover:underline mt-2 inline-block">Return to Branches</Link>
            </div>
        );
    }

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
                    <h1 className="text-3xl font-bold text-gray-900">Edit Branch</h1>
                    <p className="text-gray-500 italic">Update store location details and operating hours.</p>
                </div>
            </div>

            <BranchForm branchId={id} />
        </div>
    );
}

export default function EditBranchPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading branch editor...</div>}>
            <EditBranchContent />
        </Suspense>
    );
}
