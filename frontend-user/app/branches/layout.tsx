import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Branches",
    description: "Find our branches in Chennai and Tirupati. Visit our outlets for authentic South Indian sweets, snacks, and delicious savories.",
};

export default function BranchesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
