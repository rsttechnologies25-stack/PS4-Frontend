import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | Perambur Srinivasa Sweets",
    description: "Get in touch with us for feedback, bulk orders, or any inquiries about our sweets and services. We'd love to hear from you.",
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
