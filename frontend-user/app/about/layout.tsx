import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | Perambur Srinivasa Sweets",
    description: "Our story began in 1981 with a small sweet shop in Perambur. Today, we are a household name across South India, known for our authentic taste and commitment to quality.",
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
