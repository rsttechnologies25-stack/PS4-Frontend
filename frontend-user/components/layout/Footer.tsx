import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-background pt-20 pb-10 border-t border-primary/10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Mission */}
                    <div className="space-y-6">
                        <Image src="/logo-v1.png" alt="PS4 Logo" width={180} height={60} className="h-12 w-auto object-contain" />
                        <p className="text-text-muted text-sm leading-relaxed italic">
                            &quot;Handcrafting traditions since 1981. Dedicated to bringing the authentic taste of South India to your doorstep.&quot;
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://www.instagram.com/perambur_sri_srinivasa?igsh=dXVjNHd5ZnZqbXMy" target="_blank" className="w-10 h-10 rounded-full border border-primary/20 text-text flex items-center justify-center hover:bg-primary/10 hover:border-primary/20 transition-colors">
                                <Instagram size={18} />
                            </Link>
                            <Link href="https://www.facebook.com/profile.php?id=100088165535870&mibextid=rS40aB7S9Ucbxw6v" target="_blank" className="w-10 h-10 rounded-full border border-primary/20 text-text flex items-center justify-center hover:bg-primary/10 hover:border-primary/20 transition-colors">
                                <Facebook size={18} />
                            </Link>
                            <Link href="https://x.com/peramburand" target="_blank" className="w-10 h-10 rounded-full border border-primary/20 text-text flex items-center justify-center hover:bg-primary/10 hover:border-primary/20 transition-colors">
                                <Twitter size={18} />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="accent-font text-xs uppercase tracking-[0.3em] font-bold mb-8 text-primary">Explore</h4>
                        <ul className="space-y-4 text-sm text-text">
                            <li><Link href="/shop" className="hover:text-primary transition-colors">Shop All</Link></li>
                            <li><Link href="/category/sweets" className="hover:text-primary transition-colors">Sweets</Link></li>
                            <li><Link href="/category/sev" className="hover:text-primary transition-colors">Sev</Link></li>
                            <li><Link href="/category/savouries" className="hover:text-primary transition-colors">Savouries</Link></li>
                            <li><Link href="/branches" className="hover:text-primary transition-colors">Our Branches</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="accent-font text-xs uppercase tracking-[0.3em] font-bold mb-8 text-primary">Policy</h4>
                        <ul className="space-y-4 text-sm text-text">
                            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
                            <li><Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="accent-font text-xs uppercase tracking-[0.3em] font-bold mb-8 text-primary">Contact</h4>
                        <ul className="space-y-6 text-sm text-text">
                            <li className="flex gap-4">
                                <MapPin className="text-primary shrink-0" size={18} />
                                <span>No. 23/16 Perambur High Road, Perambur, Chennai – 600011</span>
                            </li>
                            <li className="flex gap-4">
                                <Phone className="text-primary shrink-0" size={18} />
                                <span>+91 92824 45577</span>
                            </li>
                            <li className="flex gap-4">
                                <Mail className="text-primary shrink-0" size={18} />
                                <span>info@perambursrinivasa.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-primary/10 pt-10 text-center flex flex-col items-center gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
                        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-text-muted">
                            © 2026 Perambur Sri Srinivasa Sweets & Snacks. All rights reserved.
                        </p>
                        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-text-muted">
                            Made by <a href="https://rexonsofttech.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-bold">Rexon Soft Tech</a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
