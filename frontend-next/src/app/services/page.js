"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Trophy, Smartphone, BookOpen } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';

const BentoCard = ({ title, desc, icon, visual, className }) => (
    <motion.div
        whileHover={{ y: -8 }}
        className={cn("apple-card p-10 flex flex-col justify-between overflow-hidden relative group", className)}
    >
        <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-3">{title}</h3>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed italic">{desc}</p>
            </div>
        </div>
        {visual && (
            <div className="absolute inset-0 z-0">
                {visual}
            </div>
        )}
    </motion.div>
);

export default function ServicesPage() {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col min-h-screen pt-40 px-6">
            <section id="features" className="py-20">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter">
                            {t('nav.services')} <span className="text-premium italic">Premium</span>
                        </h2>
                        <p className="text-white/40 font-bold uppercase tracking-[0.3em]">Innovation au service de la vie</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <BentoCard
                            className="md:col-span-8 border-white/10"
                            title="Aide à la décision intelligente"
                            desc="Notre IA analyse instantanément chaque mesure pour vous donner des conseils médicaux validés."
                            icon={<Shield size={32} className="text-white" />}
                            visual={<div className="h-full w-full bg-gradient-to-tr from-white/5 to-transparent flex items-center justify-center"><Activity className="w-32 h-32 text-white/5" /></div>}
                        />
                        <BentoCard
                            className="md:col-span-4 border-white/10"
                            title="Gamification"
                            desc="Transformez le suivi en jeu d'aventure."
                            icon={<Trophy size={32} className="text-accent" />}
                        />
                        <BentoCard
                            className="md:col-span-4 border-white/10"
                            title="Réalité Augmentée"
                            desc="Explorez le corps humain en 3D."
                            icon={<Smartphone size={32} className="text-success" />}
                        />
                        <BentoCard
                            className="md:col-span-8 border-white/10"
                            title="Journal de Santé"
                            desc="Un historique complet et structuré pour votre pédiatre avec exportation PDF intelligente."
                            icon={<BookOpen size={32} className="text-white" />}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
