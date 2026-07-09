"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Gamepad2, Network, ShieldCheck, Cloud, Lock, ArrowRight, Building2, Stethoscope, Baby } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

// Simple counter animation hook
const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percent = Math.min(progress / duration, 1);
            // Ease out quad
            const easeOut = percent * (2 - percent);
            setCount(Math.floor(easeOut * end));
            if (percent < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
};

const StatCard = ({ icon, label, value }) => {
    const count = useCounter(value);
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-[32px]"
        >
            <div className="w-16 h-16 bg-[#088395]/10 border border-[#088395]/20 rounded-2xl flex items-center justify-center text-[#088395] mb-6">
                {icon}
            </div>
            <div className="text-5xl font-black text-white italic mb-2">
                {count}+
            </div>
            <div className="text-sm font-bold text-white/50 uppercase tracking-widest text-center">
                {label}
            </div>
        </motion.div>
    );
};

export default function AboutPage() {
    const [stats, setStats] = useState({ clinics: 12, doctors: 45, patients: 350 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/Stats/public-summary');
                setStats({
                    clinics: response.data.clinicsCount || 12,
                    doctors: response.data.doctorsCount || 45,
                    patients: response.data.patientsCount || 350
                });
            } catch (error) {
                console.error("Impossible de récupérer les statistiques publiques", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="flex flex-col min-h-screen pt-32 px-4 sm:px-8 pb-20 overflow-x-hidden text-center lg:text-left">
            {/* HER0 SECTION */}
            <section className="max-w-7xl mx-auto w-full mb-32 relative text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#088395]/10 rounded-full blur-[150px] pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 relative z-10"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                        L'Avenir de la <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#088395] to-white italic inline-block mt-4">
                            Médecine Connectée
                        </span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/50 font-medium">
                        DiaCare Kids est né d'un constat simple : la gestion du diabète de type 1 chez l'enfant ne doit plus être un fardeau médical froid et stressant. Nous associons technologie et bienveillance au sein d'une seule et même plateforme sécurisée, pour redonner le sourire aux enfants et le contrôle aux familles.
                    </p>
                </motion.div>
            </section>

            {/* THREE PILLARS (BENTO GRID) */}
            <section className="max-w-7xl mx-auto w-full mb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* IA Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 border border-white/10 rounded-[40px] p-10 hover:border-[#088395]/30 transition-colors group relative overflow-hidden"
                    >
                        <div className="w-14 h-14 bg-[#088395]/10 border border-[#088395]/20 rounded-2xl flex items-center justify-center text-[#088395] mb-8">
                            <Brain size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Anticipation Intelligente</h3>
                        <p className="text-sm text-white/50 font-medium leading-relaxed">
                            Notre algorithme analyse discrètement les tendances glycémiques pour prévenir les risques. DiaCare Kids alerte parents et médecins d'une baisse ou d'un pic bien avant que cela ne devienne critique.
                        </p>
                    </motion.div>

                    {/* AR Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-[40px] p-10 hover:border-[#088395]/30 transition-colors group relative overflow-hidden"
                    >
                        <div className="w-14 h-14 bg-[#088395]/10 border border-[#088395]/20 rounded-2xl flex items-center justify-center text-[#088395] mb-8">
                            <Gamepad2 size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">La Magie Visuelle 3D</h3>
                        <p className="text-sm text-white/50 font-medium leading-relaxed">
                            Le monde médical ne doit plus effrayer les plus petits. À travers l'écran du téléphone, l'enfant explore son corps en image pour comprendre comment son traitement le protège.
                        </p>
                    </motion.div>

                    {/* Ecosystem Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-[40px] p-10 hover:border-[#088395]/30 transition-colors group relative overflow-hidden"
                    >
                        <div className="w-14 h-14 bg-[#088395]/10 border border-[#088395]/20 rounded-2xl flex items-center justify-center text-[#088395] mb-8">
                            <Network size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Lien Parent-Médecin</h3>
                        <p className="text-sm text-white/50 font-medium leading-relaxed">
                            Finis les carnets papier perdus. Tout le suivi est instantanément partagé entre la maison et le cabinet médical. Le pédiatre garde un œil bienveillant en permanence.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* DYNAMIC STATS SECTION */}
            <section className="max-w-7xl mx-auto w-full mb-32">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter">La Communauté DiaCare</h2>
                    <p className="text-white/50">Rejoignez un réseau grandissant dédié à la santé des enfants.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<Building2 size={32} />} label="Cliniques Engagées" value={stats.clinics} />
                    <StatCard icon={<Stethoscope size={32} />} label="Médecins Spécialistes" value={stats.doctors} />
                    <StatCard icon={<Baby size={32} />} label="Enfants Accompagnés" value={stats.patients} />
                </div>
            </section>

            {/* SECURITY SECTION */}
            <section className="max-w-7xl mx-auto w-full mb-32 bg-[#0b1b2b] border border-[#088395]/30 rounded-[60px] p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 text-left">
                <div className="absolute inset-0 bg-gradient-to-br from-[#088395]/10 to-transparent pointer-events-none" />
                <div className="flex-1 space-y-8 relative z-10 w-full">
                    <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                        Le secret médical, <br />
                        <span className="text-[#088395] italic">totalement garanti.</span>
                    </h2>
                    <p className="text-lg text-white/60 font-medium max-w-xl">
                        Parce que la santé d'un enfant est ce qu'il y a de plus intime, nous avons bâti une plateforme qui verrouille intégralement vos données.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-xl border border-[#088395]/30 flex items-center justify-center text-[#088395]">
                                <Cloud size={20} />
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-widest">Espace Sécurisé</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-xl border border-[#088395]/30 flex items-center justify-center text-[#088395]">
                                <Lock size={20} />
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-widest">Données Anonymisées</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-xl border border-[#088395]/30 flex items-center justify-center text-[#088395]">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-widest">Accès Exclusif</span>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/3 flex justify-center relative z-10">
                    <div className="w-64 h-64 bg-[#088395]/5 rounded-full border border-[#088395]/20 flex items-center justify-center shadow-[0_0_100px_rgba(8,131,149,0.2)]">
                        <ShieldCheck size={120} className="text-[#088395]" />
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="max-w-4xl mx-auto text-center space-y-12">
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Prêt à simplifier le quotidien ?</h2>
                    <p className="text-white/50 font-medium max-w-2xl mx-auto">
                        Découvrez en détail nos <Link href="/services" className="text-[#088395] hover:underline underline-offset-4">services interactifs</Link> ou créez un compte.
                    </p>
                </div>
                <div className="flex justify-center">
                    <Link href="/auth" className="px-12 py-5 bg-[#088395] text-white rounded-full font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(8,131,149,0.3)]">
                        S'inscrire Maintenant <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
