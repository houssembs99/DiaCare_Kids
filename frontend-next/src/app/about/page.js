"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col min-h-screen pt-40 px-6">
            <section id="about" className="py-20 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#088395]/10 rounded-full blur-[120px] -translate-x-1/2" />
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-5xl lg:text-7xl font-black text-white leading-none uppercase tracking-tighter">
                                {t('nav.about')} <br />
                                <span className="text-premium italic underline decoration-white/10 underline-offset-8">DiaCareKids</span>
                            </h2>
                            <p className="text-xl text-white/60 leading-relaxed font-medium">
                                DiaCareKids n'est pas seulement une application, c'est un écosystème conçu pour libérer les enfants du poids de la maladie chronique. Nous allions technologie de pointe et empathie pour redéfinir la pédiatrie moderne.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <div className="text-4xl font-black text-white">500+</div>
                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Champions Suivis</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl font-black text-white">99%</div>
                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Précision IA</div>
                            </div>
                        </div>
                    </div>
                    <div className="apple-card p-12 aspect-square relative bg-white/5 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#088395]/20 to-transparent" />
                        <Activity size={200} className="text-white/10 animate-pulse" />
                        <div className="relative z-10 text-center space-y-4">
                            <Shield size={64} className="mx-auto text-premium" />
                            <p className="text-2xl font-black text-white italic">"Sécurité & Innovation"</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
