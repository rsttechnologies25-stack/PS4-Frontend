import Link from "next/link";
import { Leaf, Award, ShieldCheck, Zap, Truck, Heart } from "lucide-react";

const trustItems = [
    { icon: Leaf, title: "100% Vegetarian", desc: "Pure veg recipes" },
    { icon: Award, title: "Traditional Recipes", desc: "Authentic taste" },
    { icon: ShieldCheck, title: "Hygienic Manufacturing", desc: "50,000 sq.ft facility" },
    { icon: Zap, title: "Premium Ingredients", desc: "Quality first" },
    { icon: Heart, title: "No Artificial Preservatives", desc: "Fresh & natural" },
];

export default function TrustSection() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
                    {trustItems.map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="mb-4 text-primary p-4 bg-primary/10 rounded-full">
                                <item.icon size={32} strokeWidth={1} />
                            </div>
                            <h4 className="accent-font text-sm uppercase tracking-widest font-bold text-secondary mb-2">{item.title}</h4>
                            <p className="text-xs text-text-muted">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
