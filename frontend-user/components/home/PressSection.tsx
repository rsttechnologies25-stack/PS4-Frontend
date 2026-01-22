import { Facebook, Instagram, Youtube } from "lucide-react";

const press = [
    { name: "Outlook", text: "The legacy brand from Perambur that conquered hearts across India with its authentic taste." },
    { name: "The Hindu", text: "A household name in Chennai for over four decades, PS4 continues to set benchmarks in hygiene." },
    { name: "Times of India", text: "Traditional recipes meet modern craftsmanship at Perambur Sri Srinivasa." },
];

export default function PressSection() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 text-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {press.map((item) => (
                        <div key={item.name} className="flex flex-col items-center">
                            <h3 className="serif text-3xl font-bold text-secondary mb-6 italic">{item.name}</h3>
                            <p className="serif text-lg text-text-muted italic leading-relaxed px-6">
                                "{item.text}"
                            </p>
                            <button className="mt-8 accent-font text-xs uppercase font-bold tracking-widest text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors">
                                Read More
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-32">
                    <h2 className="accent-font text-primary uppercase tracking-[0.4em] text-sm mb-12">Stalk Us On</h2>
                    <div className="flex justify-center gap-12">
                        {/* Social Circle buttons scaled up */}
                        <a href="#" className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer hover:border-transparent">
                            <Facebook size={24} />
                        </a>
                        <a href="#" className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer hover:border-transparent">
                            {/* X Logo */}
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-6.49 6.817H1.158l7.73-8.835L.75 2.25h6.886l4.639 6.136 5.969-6.136Zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        </a>
                        <a href="#" className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer hover:border-transparent">
                            <Instagram size={24} />
                        </a>
                        <a href="#" className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer hover:border-transparent">
                            <Youtube size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
