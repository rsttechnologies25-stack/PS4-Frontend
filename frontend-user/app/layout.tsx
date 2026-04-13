import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LocationModal from "@/components/LocationModal";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { NotificationProvider } from "@/context/NotificationContext";
import HealthCheckWrapper from "@/components/wrapper/HealthCheckWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://perambursrinivasa.co.in"),
  title: {
    default: "Perambur Srinivasa Sweets | Authentic Southern Traditions since 1981",
    template: "%s | Perambur Srinivasa Sweets",
  },
  description: "Experience the authentic taste of South India with Perambur Sri Srinivasa. Premium Ghee Sweets, Cashew Delights, and Traditional Savouries crafted with purity since 1981.",
  keywords: ["South Indian Sweets", "Chennai Snacks", "Online Sweets Delivery", "Pure Ghee Sweets", "Gifting Boxes", "Perambur Srinivasa"],
  authors: [{ name: "Perambur Sri Srinivasa" }],
  creator: "Perambur Sri Srinivasa",
  publisher: "Perambur Sri Srinivasa",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/app-icon.png',
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://perambursrinivasa.co.in",
    siteName: "Perambur Srinivasa Sweets",
    title: "Perambur Srinivasa Sweets | Authentic Southern Traditions",
    description: "Authentic South Indian Sweets & Snacks crafted with purity since 1981. Order online for delivery across India.",
    images: [
      {
        url: "/hero_motichoor_laddu.jpg",
        width: 1200,
        height: 630,
        alt: "Perambur Srinivasa Sweets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Perambur Srinivasa Sweets | Authentic Southern Traditions",
    description: "Premium South Indian Sweets & Snacks since 1981.",
    images: ["/hero_motichoor_laddu.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Perambur Srinivasa Sweets",
              "url": "https://perambursrinivasa.co.in",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://perambursrinivasa.co.in/shop?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        <HealthCheckWrapper>
          <AuthProvider>
            <NotificationProvider>
              <LocationProvider>
                <CartProvider>
                  <LocationModal />
                  <Navbar />
                  <AnnouncementBanner />
                  <main>{children}</main>
                  <Footer />
                  <WhatsAppButton />
                  <Script
                    id="razorpay-checkout"
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    strategy="lazyOnload"
                  />
                </CartProvider>
              </LocationProvider>
            </NotificationProvider>
          </AuthProvider>
        </HealthCheckWrapper>
      </body>
    </html>
  );
}
