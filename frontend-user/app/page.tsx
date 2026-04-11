import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ExploreSection from "@/components/home/ExploreSection";
import CollectionsGrid from "@/components/home/CollectionsGrid";
import BrandsSection from "@/components/home/BrandsSection";
import DeliveryPopup from "@/components/ui/DeliveryPopup";
import ProductShowcase from "@/components/home/ProductShowcase";

export const metadata: Metadata = {
  title: "Perambur Srinivasa Sweets | Authentic Southern Traditions since 1981",
  description: "Purity in every bite. Discover handcrafted South Indian sweets, crisps, and traditional savories. Order online for authentic taste delivered to your doorstep.",
};

export default function Home() {
  return (
    <>
      <DeliveryPopup />
      <Hero />
      <ExploreSection />

      <ProductShowcase
        title="Sweets Selection"
        subtitle="The PS4 Classics"
        categorySlug="sweets"
        limit={4}
        viewAllHref="/category/sweets"
      />

      <CollectionsGrid />

      {/* Mid-page banner inspired by template */}
      <section className="bg-secondary/90 py-4 text-center backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white">Purity in every bite since 1981</p>
      </section>

      <ProductShowcase
        title="Savory Delights"
        subtitle="Crispy & Authentic"
        categorySlug="savouries"
        limit={4}
        viewAllHref="/category/savouries"
      />

      <ProductShowcase
        title="New Arrivals"
        subtitle="Just Launched"
        filter="isNewLaunch"
        limit={4}
        viewAllHref="/shop?filter=new-launch"
        dark={true}
      />

      <BrandsSection />
    </>
  );
}
