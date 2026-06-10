"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DiaPoteMascot from '@/components/DiaPoteMascot';
import DiaPoteInteraction from '@/components/DiaPoteInteraction';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Heart, Star, Sparkles,
    ChevronRight, ChevronLeft,
    Crown, Rocket, Shield, Loader2,
    Gamepad2, BookOpen, Trophy, LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import api from '@/lib/api';
import Link from 'next/link';
import Lottie from 'lottie-react';
import stableAnimData from '@/animations/diapotstable.json';

export default function KidDashboard() {
    const { t, locale } = useLanguage();
    const [energy, setEnergy] = useState(0);
    const [userName, setUserName] = useState("Aventurier");
    const [statusMessage, setStatusMessage] = useState('');
    const [force, setForce] = useState('-');
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showMascot, setShowMascot] = useState(false);
    const [isEducationOpen, setIsEducationOpen] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.fullName) {
            setUserName(user.fullName.split(' ')[0]);
        }
        if (user.xp !== undefined) {
            setXp(user.xp);
            setLevel(Math.floor(user.xp / 100) + 1);
        }

        // Show mascot on first visit of the session
        const hasSeenMascot = sessionStorage.getItem('hasSeenMascot');
        if (!hasSeenMascot) {
            setShowMascot(true);
            sessionStorage.setItem('hasSeenMascot', 'true');
        }

        const fetchHealthData = async () => {
            try {
                // Sync fresh user data (specifically XP from recent games)
                try {
                    const freshUser = await api.get(`/users/${user.id}`);
                    if (freshUser.data) {
                        setXp(freshUser.data.xp || 0);
                        setLevel(Math.floor((freshUser.data.xp || 0) / 100) + 1);
                        const updatedStore = { ...user, ...freshUser.data };
                        localStorage.setItem('user', JSON.stringify(updatedStore));
                    }
                } catch(e) { console.error("XP Sync failed", e); }

                const recordRes = await api.get(`/medicalrecords/patient/${user.id}`);
                const records = recordRes.data;

                if (records && records.length > 0) {
                    const latest = records[0];
                    const val = latest.glucoseValue;

                    if (val) {
                        let calculatedEnergy = 0;
                        if (val >= 70 && val <= 140) {
                            calculatedEnergy = 90 + Math.random() * 10;
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
                        const finalEnergy = Math.round(calculatedEnergy);
                        setEnergy(finalEnergy);
                        // Save to localStorage so Rewards page reads the same value
                        localStorage.setItem('kidEnergy', finalEnergy.toString());
                    }
                } else {
                    setStatusMessage("Ta batterie est en attente ! Demande vite à ton super-parent ou à ton docteur d'ajouter tes mesures pour voir ton niveau d'énergie réel ! 🔋🚀");
                    setForce("En attente");
                    setEnergy(0);
                    localStorage.setItem('kidEnergy', '0');
                }
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        const handleOpenEducation = () => setIsEducationOpen(true);
        window.addEventListener('open-education', handleOpenEducation);

        if (user.id) fetchHealthData();
        else setLoading(false);

        return () => {
            window.removeEventListener('open-education', handleOpenEducation);
        };
    }, [t]);

    const bentoCards = [
        { 
            title: t('kid.monMonde'), 
            icon: <LayoutDashboard size={32} />, 
            link: "/kid/dashboard", 
            color: "bg-[#0071E3]", 
            textColor: "text-white",
            span: "col-span-2 md:col-span-1"
        },
        { 
            title: t('kid.mesJeux'), 
            icon: <Gamepad2 size={32} />, 
            link: "/kid/games", 
            color: "bg-[#FF3B30]", 
            textColor: "text-white",
            span: "col-span-1"
        },
        { 
            title: t('kid.jApprends'), 
            icon: <BookOpen size={32} />, 
            link: "/kid/learn", 
            color: "bg-[#34C759]", 
            textColor: "text-white",
            span: "col-span-1"
        },
        { 
            title: t('kid.recompenses'), 
            icon: <Trophy size={32} />, 
            link: "/kid/rewards", 
            color: "bg-[#FF9500]", 
            textColor: "text-white",
            span: "col-span-1"
        },
        { 
            title: t('kid.arTitle'), 
            icon: <Sparkles size={32} />, 
            link: "/kid/ar", 
            color: "bg-gradient-to-br from-[#FFB300] to-[#FF9500]", 
            textColor: "text-[#0b1b2b]",
            span: "col-span-1"
        }
    ];

    return (
        <DashboardLayout role="Enfant">
            {showMascot && <DiaPoteMascot userName={userName} onClose={() => setShowMascot(false)} />}
            
            <AnimatePresence>
                {isEducationOpen && (
                    <DiaPoteInteraction 
                        energy={energy} 
                        userName={userName}
                        onClose={() => setIsEducationOpen(false)} 
                    />
                )}
            </AnimatePresence>

            <div className="min-h-screen pb-32 max-w-5xl mx-auto px-6 pt-6 md:pt-12 text-white overflow-hidden">
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <motion.div 
                            whileHover={{ rotate: 15 }}
                            className="w-14 h-14 md:w-20 md:h-20 bg-[#FFB300] rounded-2xl md:rounded-[32px] flex items-center justify-center text-black shadow-lg"
                        >
                            <Crown size={32} className="md:w-12 md:h-12" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                                Salut, <span className="text-white/40">{userName} !</span>
                            </h1>
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">Champion Niveau {level}</span>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-4">
                         <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-3">
                            <div className="bg-[#FFB300] px-4 py-1 rounded-full text-[#0b1b2b] text-[10px] font-black uppercase tracking-widest -rotate-2">
                                <span className="font-bold">{xp} XP</span>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Energy & Status */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t('kid.energyLevel')}</span>
                                <span className="text-2xl font-black italic text-[#FFB300]">{energy}%</span>
                            </div>
                            
                            <div className="h-6 bg-white/5 border border-white/10 rounded-full overflow-hidden p-1.5 mb-8">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${energy}%` }}
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        energy > 70 ? "bg-gradient-to-r from-[#34C759] to-[#4CAF50] shadow-[0_0_20px_rgba(52,199,89,0.4)]" :
                                        (energy < 40 ? "bg-gradient-to-r from-[#FF3B30] to-[#F44336] shadow-[0_0_20px_rgba(255,59,48,0.4)]" : "bg-gradient-to-r from-[#FF9500] to-[#FFB300] shadow-[0_0_20px_rgba(255,149,0,0.4)]")
                                    )}
                                />
                            </div>

                            <p className="text-xl font-black italic uppercase tracking-tighter leading-tight bg-white/5 p-6 rounded-3xl border border-white/5">
                                {loading ? <Loader2 className="animate-spin" /> : statusMessage}
                            </p>

                            <div className="mt-6 p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                                <div className="flex items-center gap-3 text-[#FFB300]">
                                    <Sparkles size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest Italix">Comment ça marche ?</span>
                                </div>
                                <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">
                                    Ton énergie dépend de ton sucre ! Si ton sucre est parfait, ta batterie est à 100%. S'il est trop haut ou trop bas, tu te fatigues un peu. 
                                    <br /><br />
                                    <span className="text-[#34C759]">Fais tes mesures avec tes parents pour charger ton énergie !</span>
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-3 text-white/40">
                                <Shield size={16} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Force : {force}</span>
                            </div>
                        </motion.div>

                        <div className="p-8 bg-gradient-to-br from-[#088395] to-[#0b1b2b] rounded-[40px] border border-white/10 relative overflow-hidden group">
                             <Rocket className="absolute -bottom-4 -right-4 w-32 h-32 opacity-5 group-hover:scale-110 transition-transform" />
                             <h3 className="text-sm font-black uppercase tracking-widest mb-4">Mission Active</h3>
                             <p className="text-2xl font-black italic leading-none mb-6 tracking-tighter uppercase">Le Détective des Repas</p>
                             <button className="bg-white text-[#088395] px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest">Jouer</button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Bento Grid Navigation */}
                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 h-full">
                            {bentoCards.map((card, idx) => {
                                const isEducation = card.title === t('kid.jApprends');
                                const Content = (
                                    <>
                                        <div className="absolute top-0 right-0 p-6 md:p-8 opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
                                            {card.icon}
                                        </div>
                                        <div className="relative z-10 h-full flex flex-col justify-end min-h-[120px]">
                                            <h3 className={cn("text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-none mb-2", card.textColor)}>
                                                {card.title}
                                            </h3>
                                            <div className="flex items-center gap-2 opacity-60">
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Ouvrir</span>
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </>
                                );

                                if (isEducation) {
                                    return (
                                        <button 
                                            key={idx} 
                                            onClick={() => setIsEducationOpen(true)}
                                            className={cn(
                                                "relative group overflow-hidden p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/10 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-left w-full",
                                                card.color,
                                                card.span
                                            )}
                                        >
                                            {Content}
                                        </button>
                                    );
                                }

                                return (
                                    <Link 
                                        key={idx} 
                                        href={card.link}
                                        className={cn(
                                            "relative group overflow-hidden p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/10 hover:scale-[1.02] active:scale-95 transition-all duration-300",
                                            card.color,
                                            card.span
                                        )}
                                    >
                                        {Content}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* Footer Message */}
                <div className="mt-20 text-center pb-10">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                        DiaCare Kids v2.0 • Propulsé par DiaPote IA
                    </p>
                </div>

            </div>

            {/* Manual DiaPote Trigger */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMascot(true)}
                className="fixed bottom-32 right-6 w-20 h-20 bg-[#FFB300] rounded-full shadow-2xl flex items-center justify-center text-[#0b1b2b] z-[100] border-4 border-white/20"
            >
                <div className="relative w-full h-full p-1">
                    <Lottie 
                        animationData={stableAnimData}
                        loop={true}
                        autoplay={true}
                        className="w-full h-full scale-[1.7] translate-y-2"
                    />
                    <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
            </motion.button>
        </DashboardLayout>
    );
}

