"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import OrderDetailView from "@/components/OrderDetailView";

function OrderViewContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    if (!id) {
        return (
            <div className="p-8 text-center text-brand-maroon/60">
                <p className="font-bold">No order ID provided.</p>
                <Link href="/orders" className="text-brand-orange hover:underline mt-2 inline-block font-bold">
                    Return to Orders
                </Link>
            </div>
        );
    }

    return <OrderDetailView orderId={id} />;
}

export default function OrderViewPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-brand-maroon/40 font-bold">Loading order details...</div>}>
            <OrderViewContent />
        </Suspense>
    );
}
