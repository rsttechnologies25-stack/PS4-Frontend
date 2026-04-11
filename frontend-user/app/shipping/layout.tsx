import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shipping & Returns | Perambur Srinivasa Sweets",
    description: "Learn about our shipping and delivery policies across India and our return policy for damaged items. Freshness and quality are our top priorities.",
};

export default function ShippingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
