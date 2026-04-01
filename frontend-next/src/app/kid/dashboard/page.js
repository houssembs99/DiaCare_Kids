"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Heart, Star, Sparkles,
    ChevronRight, ChevronLeft,
    Crown, Rocket, Shield, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import api from '@/lib/api';

export default function KidDashboard() {
    const { t } = useLanguage();
    const [energy, setEnergy] = useState(0);
    const [avatarIndex, setAvatarIndex] = useState(0);
    const [userName, setUserName] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [force, setForce] = useState('-');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.fullName) {
            setUserName(user.fullName.split(' ')[0]);
        }

        const fetchHealthData = async () => {
            try {
                // Try to find the patient first to get targets
                // In this architecture, we check if there's a medical record for this user id
                const recordRes = await api.get(`/medicalrecords/patient/${user.id}`);
                const records = recordRes.data;

                if (records && records.length > 0) {
                    const latest = records[0];
                    const val = latest.glucoseValue;

                    if (val) {
                        // Dynamic Energy Calculation (Safe range 70-150)
                        let calculatedEnergy = 0;
                        if (val >= 70 && val <= 140) {
                            calculatedEnergy = 90 + Math.random() * 10; // High energy when in range
                            setForce("Maxima ⚡");
                            setStatusMessage(t('kid.perfectMsg'));
                        } else if (val < 70) {
                            calculatedEnergy = Math.max(10, val / 1.5);
                            setForce("Fatigue 💤");
                            setStatusMessage(t('kid.lowEnergyMsg'));
                        } else {
                            calculatedEnergy = Math.max(20, 100 - (val - 140) / 2);
                            setForce("Feu 🔥");
                            setStatusMessage(t('kid.highEnergyMsg'));
                        }
                        setEnergy(Math.round(calculatedEnergy));
                    }
                } else {
                    setStatusMessage("En attente de tes premières mesures !");
                    setForce("Initialisation");
                }
            } catch (err) {
                console.error("Dashboard error:", err);
                setStatusMessage("Connectez-vous pour voir vos exploits !");
            } finally {
                setLoading(false);
            }
        };

        if (user.id) fetchHealthData();
        else setLoading(false);
    }, [t]);

    const avatars = [
        { id: 1, name: "Super Théo", color: "bg-blue-400", accessories: "🚀" },
        { id: 2, name: "Léa l'Héroïne", color: "bg-pink-400", accessories: "⭐" },
        { id: 3, name: "Capitaine Dia", color: "bg-green-400", accessories: "🛡️" }
    ];

    return (
        <DashboardLayout role="Enfant">
            <div className="min-h-screen flex flex-col space-y-10 pb-32 max-w-lg mx-auto px-6 pt-10 text-white overflow-hidden">

                {/* Profile Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#FFB300] rounded-[24px] flex items-center justify-center text-black shadow-[0_10px_30px_rgba(255,179,0,0.4)]">
                            <Crown size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                                {userName || 'Amine'} <span className="text-[#FFB300]">Le Roi</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Star size={12} className="text-[#FFB300] fill-[#FFB300]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Niveau 0 • 0 XP</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                        <Rocket size={24} className="text-white/20" />
                    </div>
                </div>

                {/* Main Avatar World SECTION 4.1 */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative flex flex-col items-center justify-center py-10"
                >
                    {/* Animated Glow Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#088395]/20 to-transparent blur-[100px] rounded-full scale-150" />

                    {/* Character Platform */}
                    <div className="relative z-10 w-full aspect-square max-w-[300px] flex items-center justify-center group">

                        {/* Avatar Picker */}
                        <button
                            onClick={() => setAvatarIndex((avatarIndex - 1 + avatars.length) % avatars.length)}
                            className="absolute left-0 p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all z-20"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={avatarIndex}
                                initial={{ x: 20, opacity: 0, rotate: -10 }}
                                animate={{ x: 0, opacity: 1, rotate: 0 }}
                                exit={{ x: -20, opacity: 0, rotate: 10 }}
                                className={cn(
                                    "w-48 h-48 rounded-[60px] flex items-center justify-center text-7xl shadow-3xl border-4 border-white/20 relative",
                                    avatars[avatarIndex].color
                                )}
                            >
                                <span className="drop-shadow-2xl">{avatars[avatarIndex].accessories}</span>

                                {/* Floating Badge */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-6 -right-6 w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center border-4 border-[#0b1b2b] shadow-xl"
                                >
                                    <Sparkles size={32} className="text-[#0b1b2b]" />
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>

                        <button
                            onClick={() => setAvatarIndex((avatarIndex + 1) % avatars.length)}
                            className="absolute right-0 p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all z-20"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Energy Halo */}
                        <div className={cn(
                            "absolute inset-0 border-4 border-dashed rounded-full animate-spin-slow opacity-20",
                            energy > 70 ? "border-success" : (energy < 40 ? "border-accent" : "border-warning")
                        )} />
                    </div>

                    {/* Energy Bar SECTION 4.2 */}
                    <div className="w-full mt-12 space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t('kid.energyLevel')}</span>
                            <span className="text-xl font-black italic">{energy}%</span>
                        </div>
                        <div className="h-4 bg-white/5 border border-white/10 rounded-full overflow-hidden p-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${energy}%` }}
                                className={cn(
                                    "h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]",
                                    energy > 70 ? "bg-gradient-to-r from-success to-[#4CAF50]" :
                                        (energy < 40 ? "bg-gradient-to-r from-accent to-[#F44336]" : "bg-gradient-to-r from-warning to-[#FFB300]")
                                )}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Motivating Message SECTION 4.3 */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 relative overflow-hidden group hover:border-[#FFB300]/30 transition-all shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                        <Heart size={40} className="text-[#FFB300]" />
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-4 py-4">
                            <Loader2 className="animate-spin text-white/20" />
                            <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Calcul de tes forces...</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-xl font-black italic uppercase tracking-tighter leading-tight pr-10">
                                {statusMessage}
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#FFB300]/20 rounded-xl flex items-center justify-center text-[#FFB300]">
                                    <Shield size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Force : {force}</span>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Quick Quest */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 pl-4">Mission du Jour</h3>
                    <div className="p-6 bg-gradient-to-br from-[#088395] to-[#066a7a] rounded-[32px] flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <div>
                                <div className="text-[11px] font-black uppercase tracking-tight">Le Combat du Sucre</div>
                                <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Gagner 200 XP</div>
                            </div>
                        </div>
                        <button className="w-10 h-10 bg-white text-[#088395] rounded-full flex items-center justify-center shadow-lg">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

            </div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
        </DashboardLayout>
    );
}
