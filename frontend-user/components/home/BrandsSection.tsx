import Image from "next/image";

export default function BrandsSection() {
    return (
        <section className="bg-primary py-20 text-white text-center">
            <div className="container mx-auto px-4">
                <h2 className="accent-font text-sm uppercase tracking-[0.4em] font-bold mb-8 opacity-70">The Tastemakers of Chennai</h2>
                <div className="serif text-5xl md:text-7xl mb-12 font-medium leading-tight">
                    Heritage in every grain, tradition in every bite.
                </div>

                <div className="flex flex-wrap justify-center items-center gap-12 mt-20 opacity-90">
                    {/* Logo placeholders for PS4 sub-brands or values */}
                    <div className="text-2xl font-bold italic serif tracking-wide">Srinivasa</div>
                    <div className="text-2xl font-bold italic serif tracking-wide">Devendra</div>
                    <div className="text-2xl font-bold italic serif tracking-wide">PureVeg</div>
                    <div className="text-2xl font-semibold italic serif tracking-wide">Heritage</div>
                    <div className="text-2xl font-semibold italic serif tracking-wide">Authentic</div>
                </div>
            </div>
        </section>
    );
}
