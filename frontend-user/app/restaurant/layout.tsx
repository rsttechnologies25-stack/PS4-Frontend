import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Restaurant",
    description: "Our restaurant offers a warm ambiance, exceptional service, and delicious South Indian culinary delights. Visit us for an authentic dining experience.",
};

export default function RestaurantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
