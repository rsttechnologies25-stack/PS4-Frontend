import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop Full Collection | Perambur Srinivasa Sweets",
    description: "Explore our entire collection of authentic South Indian sweets, snacks, and savouries. Handcrafted with love and delivered fresh to your doorstep.",
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
