"use client";

export const runtime = "edge";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrderDetailView from "@/components/OrderDetailView";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    useEffect(() => {
        if (id) {
            router.replace(`/orders/view?id=${id}`);
        }
    }, [id, router]);

    return <OrderDetailView orderId={id} />;
}
