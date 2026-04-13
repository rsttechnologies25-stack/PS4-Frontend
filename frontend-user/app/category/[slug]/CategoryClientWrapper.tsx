"use client";
import dynamic from 'next/dynamic';

const CategoryClient = dynamic(() => import('./CategoryClient'), { ssr: false });

export default function CategoryClientWrapper({ slug }: { slug: string }) {
    return <CategoryClient slug={slug} />;
}
