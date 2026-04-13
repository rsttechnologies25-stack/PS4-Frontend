"use client";
import dynamic from 'next/dynamic';

const OrderClient = dynamic(() => import('./OrderClient'), { ssr: false });

export default function OrderClientWrapper({ params }: { params: Promise<{ id: string }> }) {
    return <OrderClient params={params} />;
}
