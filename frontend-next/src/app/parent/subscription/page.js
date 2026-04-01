"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import {
    CreditCard, Calendar, Clock, ShieldCheck,
    Baby, ChevronRight, Loader2, AlertCircle, CheckCircle2, Stethoscope, Building2
} from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';

export default function ParentSubscription() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [subData, setSubData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/parent/dashboard-summary');
            setSubData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getDaysRemaining = (expiryDate) => {
        if (!expiryDate) return 0;
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = Math.max(0, expiry - now);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <DashboardLayout role="Parent">
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin text-[#088395]" size={40} />
                    <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Calcul de vos jours restants...</span>
                </div>
            </DashboardLayout>
        );
    }

    const sub = subData?.subscription;
    const days = getDaysRemaining(sub?.expiryDate);
    const kidsUsed = subData?.children?.length || 0;
    const kidsMax = sub?.maxKids || 1;

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-10 pb-20">

                {/* Header */}
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic text-white">
                        Mon <span className="text-white/40">Abonnement</span>
                    </h1>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-3">Gestion de votre plan de protection familiale</p>
                </div>

                {/* Main Card with Glassmorphism */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Status & Countdown Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 apple-card p-10 bg-gradient-to-br from-[#0b1b2b] to-[#088395]/10 border-[#088395]/20 relative overflow-hidden"
                    >
                        <div className="absolute -right-20 -bottom-20 text-[#088395]/5 scale-[3]">
                            <Clock size={200} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                        sub?.isActive ? "bg-success/20 text-success" : "bg-accent/20 text-accent"
                                    )}>
                                        {sub?.isActive ? "Statut: Actif" : "Statut: Inactif"}
                                    </div>
                                    <div className="px-4 py-2 bg-white/5 rounded-xl text-white/40 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                        Plan {sub?.planType}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-white italic tracking-tighter">
                                        {days} <span className="text-xl text-white/40 not-italic uppercase tracking-widest ml-2">Jours Restants</span>
                                    </h2>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Calendar size={12} /> Expire le {sub?.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : '---'}
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto">
                                <button className="w-full md:w-auto px-10 py-5 bg-white text-[#088395] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-all">
                                    Renouveler mon plan
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-12 relative z-10">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Utilisation de la licence</span>
                                <span className="text-xs font-black text-white">{days > 0 ? Math.round((days / 365) * 100) : 0}%</span>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: days > 0 ? `${(days / 365) * 100}%` : '0%' }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#088395] to-white rounded-full shadow-[0_0_20px_rgba(8,131,149,0.5)]"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* License Details Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="apple-card p-10 bg-white/5 border-white/10 flex flex-col justify-between"
                    >
                        <div className="space-y-8">
                            <div className="w-16 h-16 bg-[#088395] rounded-2xl flex items-center justify-center text-white shadow-2xl">
                                <Baby size={30} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Nombre de héros</h3>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2 leading-relaxed">
                                    Votre plan actuel vous permet de gérer jusqu'à <strong>{kidsMax} enfants</strong> simultanément.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-4 border-b border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Inscrits</span>
                                    <span className="text-sm font-black text-white">{kidsUsed}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Disponibles</span>
                                    <span className="text-sm font-black text-[#088395]">{kidsMax - kidsUsed}</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:bg-white/10 hover:text-white transition-all mt-8">
                            Changer de plan <ChevronRight size={14} className="inline ml-2" />
                        </button>
                    </motion.div>
                </div>

                {/* Medical Team Section - Moved here */}
                {subData?.children?.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pl-4">{t('parent.medicalTeam')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subData.children.map((child, idx) => (
                                <motion.div
                                    key={child.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="apple-card p-6 bg-white/5 border-white/10 group active:scale-95 transition-all"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-[#088395]/10 rounded-2xl flex items-center justify-center text-[#088395] group-hover:bg-[#088395] group-hover:text-white transition-all shadow-lg">
                                            <Baby size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-black italic tracking-tight text-white">{child.fullName}</div>
                                            <div className="flex flex-col gap-1 mt-3">
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                                    <Stethoscope size={10} className="text-[#088395]" />
                                                    {child.doctorName}
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                                    <Building2 size={10} className="text-[#088395]" />
                                                    {child.clinicName}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-white/20 group-hover:text-white transition-all" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Features Included */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureItem icon={<ShieldCheck />} title="Protection Sécurisée" desc="Données chiffrées de bout en bout." />
                    <FeatureItem icon={<Stethoscope />} title="Suivi Médical" desc="Connexion directe avec vos médecins." />
                    <FeatureItem icon={<CheckCircle2 />} title="Alertes Temps Réel" desc="Notifications instantanées sur les crises." />
                </div>

            </div>
        </DashboardLayout>
    );
}

const FeatureItem = ({ icon, title, desc }) => (
    <div className="apple-card p-6 bg-white/5 border-white/10 flex items-start gap-4">
        <div className="w-10 h-10 bg-[#088395]/20 rounded-xl flex items-center justify-center text-[#088395]">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{title}</h4>
            <p className="text-[9px] font-medium text-white/40 mt-1">{desc}</p>
        </div>
    </div>
);
