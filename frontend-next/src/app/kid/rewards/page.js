"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Star, Medal, Crown,
    Gift, Sparkles, ChevronRight,
    ShieldCheck, Heart, Zap, Rocket,
    CheckCircle2, Flame, Award,
    BatteryCharging
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import api from '@/lib/api';

const BadgeCard = ({ name, icon: Icon, color, unlocked, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className={cn(
            "aspect-square rounded-[40px] flex flex-col items-center justify-center p-4 border-2 transition-all relative overflow-hidden group shadow-xl",
            unlocked ? "bg-white/5 border-white/20" : "bg-black/20 border-white/5 grayscale"
        )}
    >
        {unlocked && <div className={cn("absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity", color)} />}
        <div className={cn(
            "w-16 h-16 rounded-3xl flex items-center justify-center mb-3 shadow-3xl transition-transform group-hover:scale-110",
            unlocked ? cn("text-white", color) : "bg-white/5 text-white/20"
        )}>
            <Icon size={32} />
        </div>
        <span className={cn(
            "text-[9px] font-black uppercase tracking-tighter text-center",
            unlocked ? "text-white" : "text-white/20"
        )}>{name}</span>
        {unlocked && (
            <div className="absolute top-2 right-2">
                <CheckCircle2 size={12} className="text-success" />
            </div>
        )}
    </motion.div>
);

export default function KidRewards() {
    const { t } = useLanguage();
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [energy, setEnergy] = useState(0);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Read XP from local user store
        const currentXp = user.xp || 0;
        setXp(currentXp);
        setLevel(Math.floor(currentXp / 100) + 1);

        // Read energy saved by the Dashboard page — same value, no re-calculation
        const savedEnergy = parseInt(localStorage.getItem('kidEnergy') || '0', 10);
        setEnergy(savedEnergy);

        // Optionally sync fresh XP from server in background
        const syncXp = async () => {
            try {
                if (user.id) {
                    const res = await api.get(`/users/${user.id}`);
                    if (res.data) {
                        const freshXp = res.data.xp || 0;
                        setXp(freshXp);
                        setLevel(Math.floor(freshXp / 100) + 1);
                        localStorage.setItem('user', JSON.stringify({ ...user, xp: freshXp }));
                    }
                }
            } catch (e) {
                console.error('XP sync failed', e);
            }
        };
        syncXp();
    }, []);

    // 9 Badges based on XP and Energy
    const badges = [
        { id: 1, name: "Champion Débutant", icon: Trophy, color: "bg-[#FFB300]", unlocked: xp >= 0 },
        { id: 2, name: "Explorateur", icon: Sparkles, color: "bg-blue-500", unlocked: xp >= 200 },
        { id: 3, name: "Maître du Repas", icon: Heart, color: "bg-accent", unlocked: xp >= 500 },
        { id: 4, name: "Vif Éclair", icon: Zap, color: "bg-orange-500", unlocked: xp >= 1000 },
        { id: 5, name: "Super Énergie", icon: BatteryCharging, color: "bg-green-500", unlocked: xp >= 1500 && energy > 50 },
        { id: 6, name: "Garde du Corps", icon: ShieldCheck, color: "bg-success", unlocked: xp >= 3000 },
        { id: 7, name: "Flamme Dorée", icon: Flame, color: "bg-red-500", unlocked: xp >= 5000 && energy > 70 },
        { id: 8, name: "Génie Diabète", icon: Award, color: "bg-purple-500", unlocked: xp >= 7500 },
        { id: 9, name: "Pilote Rocket", icon: Rocket, color: "bg-indigo-500", unlocked: xp >= 10000 }
    ];

    const unlockedCount = badges.filter(b => b.unlocked).length;
    const canOpenChest = xp >= 10000 || unlockedCount === 9; // Ultimate goal!

    const handleOpenChest = () => {
        if (!canOpenChest) {
            alert("Tu dois encore accumuler de l'XP ou gagner des badges pour ouvrir le Super Coffre !");
            return;
        }
        alert("Félicitations !! Tu reçois ton cadeau de tes parents ! 🎁🎉");
    };

    return (
        <DashboardLayout role="Enfant">
            <div className="min-h-screen space-y-12 pb-32 max-w-lg mx-auto px-6 pt-10 text-white">

                {/* Header SECTION 7.1 */}
                <div className="flex flex-col items-center space-y-8">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                            className="absolute -inset-10 bg-gradient-to-tr from-[#FFB300] to-transparent blur-3xl opacity-20"
                        />
                        <div className="w-32 h-32 bg-white/5 border-4 border-white/10 rounded-[48px] flex items-center justify-center text-[#FFB300] relative z-10 shadow-5xl outline outline-8 outline-[#FFB300]/5">
                            <Crown size={64} />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-8 py-2 bg-[#FFB300] text-black rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">
                            NIVEAU {level}
                        </div>
                    </div>

                    <div className="text-center space-y-8 w-full px-4 md:px-10">
                        {/* Progress 1: 3000 XP Goal */}
                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center px-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300]">{xp >= 3000 ? "3000" : xp} / 3000 XP</span>
                                <span className="text-[10px] items-center flex gap-1 font-black uppercase tracking-widest text-white/50">
                                    <Star size={10}/> Palier 1
                                </span>
                            </div>
                            <div className="h-4 bg-white/5 border border-white/10 rounded-full overflow-hidden shadow-inner p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((xp / 3000) * 100, 100)}%` }}
                                    className="h-full bg-gradient-to-r from-[#FFB300] to-[#FFA000] rounded-full shadow-[0_0_20px_rgba(255,179,0,0.5)]"
                                />
                            </div>
                        </div>

                        {/* Progress 2: 10000 XP Goal */}
                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center px-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{xp >= 10000 ? "10000" : xp} / 10000 XP</span>
                                <span className="text-[10px] items-center flex gap-1 font-black uppercase tracking-widest text-white/50">
                                    <Trophy size={10}/> Palier Ultime
                                </span>
                            </div>
                            <div className="h-4 bg-white/5 border border-white/10 rounded-full overflow-hidden shadow-inner p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((xp / 10000) * 100, 100)}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badge Collection SECTION 7.2 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Tes Badges ({unlockedCount}/9)</h2>
                        <button className="text-[10px] font-black text-[#FFB300] uppercase tracking-widest flex items-center gap-2">
                            Tout voir <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {badges.map((badge, idx) => (
                            <BadgeCard
                                key={badge.id}
                                name={badge.name}
                                icon={badge.icon}
                                color={badge.color}
                                unlocked={badge.unlocked}
                                delay={idx * 0.1}
                            />
                        ))}
                    </div>
                </div>

                {/* Rewards Redemption SECTION 7.1 */}
                <div 
                    onClick={handleOpenChest}
                    className={cn(
                        "rounded-[48px] p-10 relative overflow-hidden shadow-5xl group cursor-pointer transition-all duration-300",
                        canOpenChest 
                            ? "bg-gradient-to-br from-[#088395] to-blue-700 animate-pulse hover:animate-none" 
                            : "bg-white/5 border-2 border-white/10 grayscale"
                    )}
                >
                    <div className="absolute -right-16 -top-16 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                        <Gift size={200} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-8">
                            <div className={cn(
                                "w-16 h-16 rounded-3xl flex items-center justify-center border",
                                canOpenChest ? "bg-white/20 backdrop-blur-3xl border-white/20" : "bg-black/20 border-white/5"
                            )}>
                                <Medal size={32} className={canOpenChest ? "text-[#FFB300]" : "text-white/30"} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-1">Super Coffre</h3>
                                <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest">
                                    {canOpenChest ? "Prêt à être ouvert !" : "Déverrouille-le à 10000 XP"}
                                </p>
                            </div>
                        </div>
                        <button 
                            className={cn(
                                "w-full py-5 rounded-[28px] font-black uppercase tracking-[0.3em] text-[11px] shadow-3xl transition-all",
                                canOpenChest 
                                    ? "bg-white text-[#088395] hover:translate-y-[-2px] active:translate-y-[1px]" 
                                    : "bg-white/10 text-white/30 cursor-not-allowed"
                            )}
                        >
                            Ouvrir mon Cadeau
                        </button>
                    </div>
                </div>

                {/* Positive reinforcement message */}
                <div className="flex items-center justify-center gap-4 py-8">
                    <div className="w-12 h-[1px] bg-white/10" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 italic">Tu es incroyable !</span>
                    <div className="w-12 h-[1px] bg-white/10" />
                </div>

            </div>
        </DashboardLayout>
    );
}
