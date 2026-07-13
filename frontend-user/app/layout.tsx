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
  metadataBase: new URL("https://perambursrinivasa.com"),
  title: {
    default: "Perambur Srinivasa Sweets | 100% Veg Sweets & Snacks",
    template: "%s | Perambur Srinivasa Sweets",
  },
  description: "Order 100% Veg traditional South Indian sweets and snacks online with 10% off. Handcrafted with no artificial preservatives and no MSG. We offer customized gifting for corporate & bulk orders.",
  keywords: [
    "South Indian Sweets", 
    "Chennai Snacks", 
    "Online Sweets Delivery", 
    "100% Veg Sweets", 
    "No MSG Snacks", 
    "No Artificial Preservatives Sweets", 
    "Corporate Gifting Sweets", 
    "Bulk Orders Sweets", 
    "Customized Gift Boxes", 
    "Perambur Srinivasa"
  ],
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
    url: "https://perambursrinivasa.com",
    siteName: "Perambur Srinivasa Sweets",
    title: "Perambur Srinivasa Sweets | 100% Veg Sweets & Snacks",
    description: "Order 100% Veg traditional South Indian sweets and snacks online with 10% off. Crafted with no artificial preservatives and no MSG. Ideal for corporate & bulk orders.",
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
    title: "Perambur Srinivasa Sweets | 100% Veg Sweets & Snacks",
    description: "100% Veg South Indian sweets and snacks online with 10% off. No artificial preservatives and no MSG.",
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
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Perambur Srinivasa Sweets",
                "url": "https://perambursrinivasa.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://perambursrinivasa.com/shop?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Perambur Srinivasa Sweets",
                "url": "https://perambursrinivasa.com",
                "logo": "https://perambursrinivasa.com/app-icon.png",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+91-92824-45577",
                  "contactType": "customer service"
                }
              }
            ]),
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
