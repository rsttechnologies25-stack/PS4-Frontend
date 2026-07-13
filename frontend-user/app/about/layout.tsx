import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us",
    description: "Perambur Sri Srinivasa Sweets and Snacks (PS4) roots can be traced back to 1981. Learn about our heritage, our commitment to quality, and our sweet traditional journey.",
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
