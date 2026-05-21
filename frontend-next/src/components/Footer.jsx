import React from 'react';
import Link from 'next/link';
import { Activity, Mail, Phone, MapPin, Heart, } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black/10 pt-24 pb-12 px-6 border-t border-white/10 backdrop-blur-3xl">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                <Activity className="text-[#088395] w-6 h-6" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-white uppercase">
                                DiaCare<span className="text-white/60 italic">Kids</span>
                            </span>
                        </Link>
                        <p className="text-cyan-100/60 text-sm leading-relaxed max-w-xs font-medium italic">
                            "Redonner le sourire aux petits champions à travers l'innovation et l'éducation intelligente."
                        </p>

                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-white">Explorer</h4>
                        <ul className="space-y-4">
                            <FooterLink href="#about">À Propos</FooterLink>
                            <FooterLink href="#features">Services</FooterLink>
                            <FooterLink href="#contact">Contact</FooterLink>
                            <FooterLink href="/privacy">Confidentialité</FooterLink>
                        </ul>
                    </div>


                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-white">Nous Joindre</h4>
                        <div className="space-y-4">
                            <ContactItem icon={<Phone size={16} />} text="+216 71 000 000" />
                            <ContactItem icon={<Mail size={16} />} text="hello@diacarekids.tn" />
                            <ContactItem icon={<MapPin size={16} />} text="Hôpital des Enfants, Tunis" />
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                        © 2026 DIACARE KIDS. TOUS DROITS RÉSERVÉS. PROJET PFE GÉNIE LOGICIEL.
                    </p>
                    <div className="flex items-center gap-2">
                        <Heart size={14} className="text-accent fill-accent" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Made with love by HBS</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ href, children }) => (
    <li>
        <Link href={href} className="text-sm font-medium text-white/50 hover:text-white transition-colors">
            {children}
        </Link>
    </li>
);

const ContactItem = ({ icon, text }) => (
    <div className="flex items-center gap-3 text-white/60">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
            {icon}
        </div>
        <span className="text-sm font-medium">{text}</span>
    </div>
);

const SocialIcon = ({ icon }) => (
    <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-300">
        {icon}
    </button>
);

export default Footer;
