"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    CreditCard, Check, Shield, Star, Crown, Plus,
    Edit3, Trash2, Package, Clock, Users, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const plans = [
    {
        id: "basic",
        name: "Basic",
        price: "$49",
        duration: "Mensuel",
        limits: { doctors: 2, patients: 50 },
        features: ["Gestion des patients", "Journal de bord", "Support Email"],
        color: "from-slate-400 to-slate-600",
        icon: <Shield size={40} />
    },
    {
        id: "pro",
        name: "Pro",
        price: "$149",
        duration: "Mensuel",
        limits: { doctors: 10, patients: 500 },
        features: ["Analyse IA Basique", "Multi-Clinique", "Rapports PDF", "Support 24/7"],
        color: "from-[#1E88E5] to-[#1565C0]",
        icon: <Star size={40} />,
        isPopular: true
    },
    {
        id: "premium",
        name: "Premium",
        price: "$299",
        duration: "Mensuel",
        limits: { doctors: 50, patients: "Illimité" },
        features: ["DiaPote IA Expert", "Réalité Augmentée", "Statistiques Avancées", "API Dédiée"],
        color: "from-yellow-500 to-orange-600",
        icon: <Crown size={40} />
    }
];

export default function AdminSubscriptions() {
    return (
        <DashboardLayout role="Admin">
            <div className="space-y-16 pb-10 text-white">

                {/* Header SECTION 7.1 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                            Plans <span className="text-white/40">Tarifaires</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gestion des offres et des limites du système</p>
                    </div>
                    <button className="flex items-center gap-4 py-5 px-10 bg-white text-[#1E88E5] font-black rounded-[24px] text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl group">
                        <Plus size={24} /> Créer Nouveau Plan
                    </button>
                </div>

                {/* Plans List SECTION 7.1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 relative group hover:border-[#1E88E5]/50 transition-all overflow-hidden"
                        >
                            {plan.isPopular && (
                                <div className="absolute top-8 right-[-35px] bg-[#1E88E5] px-12 py-1 rotate-45 text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Populaire
                                </div>
                            )}

                            <div className={cn(
                                "w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-10 bg-gradient-to-br shadow-xl",
                                plan.color
                            )}>
                                {plan.icon}
                            </div>

                            <div className="space-y-4 mb-10">
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{plan.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black">{plan.price}</span>
                                    <span className="text-sm font-bold opacity-30 uppercase tracking-widest">/ {plan.duration}</span>
                                </div>
                            </div>

                            <div className="space-y-6 pt-10 border-t border-white/5 mb-12">
                                <div className="flex items-center gap-4 text-white/60">
                                    <Users size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest leading-none">Jusqu'à {plan.limits.doctors} Médecins</span>
                                </div>
                                <div className="flex items-center gap-4 text-white/60">
                                    <Zap size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest leading-none">{plan.limits.patients} Patients Max</span>
                                </div>
                                <div className="h-px bg-white/5 w-full my-4" />
                                {plan.features.map(f => (
                                    <div key={f} className="flex items-center gap-4 group/item">
                                        <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20 group-hover/item:scale-125 transition-transform"><Check size={12} strokeWidth={4} /></div>
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 py-5 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[#1E88E5] transition-all flex items-center justify-center gap-3 group">
                                    <Edit3 size={16} className="group-hover:rotate-12 transition-transform" /> Modifier
                                </button>
                                <button className="p-5 bg-white/5 rounded-2xl text-white/20 hover:text-accent hover:bg-accent/10 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </DashboardLayout>
    );
}
