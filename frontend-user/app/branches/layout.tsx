import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Outlets | Perambur Srinivasa Sweets",
    description: "Find a Perambur Srinivasa Sweets outlet near you. Visit our stores across Chennai and Tirupati for authentic South Indian sweets and savories.",
};

export default function BranchesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
