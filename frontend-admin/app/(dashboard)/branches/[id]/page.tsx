"use client";

export const runtime = "edge";

import { useParams } from "next/navigation";
import BranchForm from "@/components/BranchForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function EditBranchPage() {
    const { id } = useParams();

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
                    <p className="text-gray-500 italic">Update store location details and contact info.</p>
                </div>
            </div>

            <BranchForm branchId={id as string} />
        </div>
    );
}
