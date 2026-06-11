"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    CreditCard, Check, Zap, Building2,
    Stethoscope, Baby, Calendar, ArrowRight,
    Sparkles, ShieldCheck, History, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const PlanFeature = ({ text, bold }) => (
    <div className="flex items-start gap-4 text-white hover:translate-x-1 transition-transform cursor-default">
        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(52,199,89,0.2)]">
            <Check size={14} strokeWidth={3} />
        </div>
        <span className={cn("text-xs tracking-wide uppercase", bold ? "font-black" : "font-bold text-white/60")}>
            {text}
        </span>
    </div>
);

export default function ClinicSubscription() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/ClinicManagement/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="Clinique">
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin text-[#088395]" size={40} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Chargement de votre plan...</span>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-12 pb-10 text-white">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <CreditCard size={24} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Gestion <span className="text-white/40">Abonnement</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gérez votre plan et accédez à plus de fonctionnalités</p>
                    </div>
                </div>

                {/* Main Plan Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 bg-gradient-to-br from-[#088395] to-[#066a7a] rounded-[48px] p-10 lg:p-16 shadow-[0_40px_80px_rgba(8,131,149,0.4)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
                            <div className="flex-1 space-y-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                        Plan Actif <Sparkles size={12} className="text-yellow-400" />
                                    </div>
                                    <h2 className="text-6xl font-black italic tracking-tighter">
                                        {stats?.planType || 'STANDARD'} <span className="text-white/30 text-4xl not-italic">{stats?.type || 'Clinic'}</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-6 bg-white/10 rounded-[32px] border border-white/5 backdrop-blur-sm">
                                        <Stethoscope size={24} className="mb-4 text-white/60" />
                                        <div className="text-3xl font-black italic mb-1">
                                            {stats?.maxDoctors === -1 ? '∞' : stats?.maxDoctors || 0}
                                        </div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-white/40">Médecins Max</div>
                                    </div>
                                    <div className="p-6 bg-white/10 rounded-[32px] border border-white/5 backdrop-blur-sm">
                                        <Baby size={24} className="mb-4 text-white/60" />
                                        <div className="text-3xl font-black italic mb-1">
                                            {stats?.maxPatients === -1 ? '∞' : stats?.maxPatients || 0}
                                        </div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-white/40">Patients Max</div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button className="flex-1 py-6 bg-white text-[#088395] rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-98 transition-all shadow-2xl">
                                        Changer de Plan
                                    </button>
                                    <button className="flex-1 py-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/20 transition-all">
                                        Renouveler le contrat
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 lg:w-72">
                                <div className="p-8 bg-black/10 rounded-[40px] border border-white/5 space-y-6">
                                    <div className="flex items-center gap-3 text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">
                                        <Calendar size={14} /> Expiration
                                    </div>
                                    <div className="text-2xl font-black italic tracking-tighter uppercase">
                                        {stats?.expiryDate ? new Date(stats.expiryDate).toLocaleDateString() : 'INDÉFINIE'}
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-[100%] bg-white rounded-full bg-gradient-to-r from-success to-white" />
                                    </div>
                                    <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Abonnement en cours</div>
                                </div>
                                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest p-4 text-white/40 group cursor-help">
                                    <History size={16} className="group-hover:rotate-1.0.80 transition-transform duration-700" /> Voir Historique
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Features Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                            <div className="relative z-10 space-y-10">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Avantages Inclus</h3>
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Fonctionnalités activées pour votre clinique</p>
                                </div>

                                <div className="space-y-6">
                                    <PlanFeature text="Gestion sécurisée des dossiers" bold />
                                    <PlanFeature text="Alertes critiques temps réel" bold />
                                    <PlanFeature text="Statistiques avancées Analytics" />
                                    <PlanFeature text="Support prioritaire 24/7" bold />
                                    <PlanFeature text="Exportation rapports PDF" />
                                </div>

                                <div className="p-8 bg-[#1E88E5]/10 rounded-3xl border border-[#1E88E5]/20 text-center space-y-4">
                                    <ShieldCheck size={32} className="mx-auto text-[#1E88E5]" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#1E88E5]">Système sécurisé & Certifié conforme</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upgrade Promo */}
                <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 text-center max-w-2xl mx-auto space-y-6">
                    <Zap size={40} className="mx-auto text-yellow-500 animate-pulse" />
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Besoin de plus de <span className="text-[#088395]">Puissance ?</span></h2>
                    <p className="text-sm font-medium text-white/40 leading-relaxed px-10">
                        Votre clinique se développe ? Contactez-nous pour passer au plan sur-mesure pour les grands centres hospitaliers.
                    </p>
                    <button className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all">
                        Contacter le Commercial <ArrowRight size={16} />
                    </button>
                </div>

            </div>
        </DashboardLayout>
    );
}

