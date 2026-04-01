"use client";

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function ContactPage() {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col min-h-screen pt-40 px-6">
            <section id="contact" className="py-20 relative">
                <div className="max-w-4xl mx-auto text-center space-y-16">
                    <div className="space-y-4">
                        <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase">{t('nav.contact')}</h2>
                        <p className="text-white/40 font-bold uppercase tracking-[0.3em]">Nous sommes à votre écoute</p>
                    </div>

                    <div className="apple-card p-12 bg-white/5 border-white/10 text-left space-y-8">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Votre Nom</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-premium transition-colors" placeholder="flen" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Email</label>
                                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-premium transition-colors" placeholder="contact@example.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Message</label>
                            <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-premium transition-colors" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                        </div>
                        <button className="w-full btn-apple !py-6 text-xl">Envoyer le Message</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
