import Hero from "@/components/home/Hero";
import ExploreSection from "@/components/home/ExploreSection";
import CollectionsGrid from "@/components/home/CollectionsGrid";
import TrustSection from "@/components/home/TrustSection";
import ClassicsSection from "@/components/home/ClassicsSection";
import PressSection from "@/components/home/PressSection";
import BrandsSection from "@/components/home/BrandsSection";

import DeliveryPopup from "@/components/ui/DeliveryPopup";

export default function Home() {
  return (
    <>
      <DeliveryPopup />
      <Hero />
      <ExploreSection />
      <CollectionsGrid />

      {/* Mid-page banner inspired by template */}
      {/* Mid-page banner inspired by template */}
      <section className="bg-secondary/90 py-4 text-center backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white">Purity in every bite since 1981</p>
      </section>

      <ClassicsSection />
      <TrustSection />
      <PressSection />
      <BrandsSection />
    </>
  );
}
