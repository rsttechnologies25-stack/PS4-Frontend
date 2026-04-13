"use client";
import dynamic from 'next/dynamic';

// Dynamically import the heavy interactive client component with SSR disabled
// This conclusively prevents Cloudflare Edge sandbox violations during RSC generation
const ProductClient = dynamic(() => import('./ProductClient'), { ssr: false });

export default function ProductClientWrapper({ slug }: { slug: string }) {
    return <ProductClient slug={slug} />;
}
