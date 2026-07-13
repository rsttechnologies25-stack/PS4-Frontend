import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Products",
    description: "Indulge in the richness of our sweets and snacks. Explore our entire collection of authentic South Indian sweets, snacks, and savouries delivered fresh to your doorstep.",
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
