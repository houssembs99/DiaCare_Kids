"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Star, Medal, Crown,
    Gift, Sparkles, ChevronRight,
    ShieldCheck, Heart, Zap, Rocket,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

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

    React.useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.xp !== undefined) {
            setXp(user.xp);
            setLevel(Math.floor(user.xp / 100) + 1);
        }
    }, []);

    const badges = [
        { id: 1, name: "Champion de Saisie", icon: Trophy, color: "bg-[#FFB300]", unlocked: true },
        { id: 2, name: "Explorateur AR", icon: Sparkles, color: "bg-blue-500", unlocked: true },
        { id: 3, name: "Maître du Repas", icon: Heart, color: "bg-accent", unlocked: true },
        { id: 4, name: "Vif Éclair", icon: Zap, color: "bg-orange-500", unlocked: false },
        { id: 5, name: "Garde du Corps", icon: ShieldCheck, color: "bg-success", unlocked: false },
        { id: 6, name: "Pilote Rocket", icon: Rocket, color: "bg-indigo-500", unlocked: false }
    ];

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

                    <div className="text-center space-y-4 w-full px-10">
                        <div className="flex justify-between items-center px-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{xp} / 3000 XP</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300]">Points restants : {3000 - xp}</span>
                        </div>
                        <div className="h-6 bg-white/5 border border-white/10 rounded-full overflow-hidden p-1.5 shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(xp / 3000) * 100}%` }}
                                className="h-full bg-gradient-to-r from-[#FFB300] to-[#FFA000] rounded-full shadow-[0_0_20px_rgba(255,179,0,0.5)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Badge Collection SECTION 7.2 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Tes Badges (3/6)</h2>
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
                <div className="bg-gradient-to-br from-[#088395] to-blue-700 rounded-[48px] p-10 relative overflow-hidden shadow-5xl group cursor-pointer">
                    <div className="absolute -right-16 -top-16 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                        <Gift size={200} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-3xl rounded-3xl flex items-center justify-center border border-white/20">
                                <Medal size={32} className="text-[#FFB300]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">Super Coffre</h3>
                                <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1">Niveau requis prochainement</p>
                            </div>
                        </div>
                        <button className="w-full py-5 bg-white text-[#088395] rounded-[28px] font-black uppercase tracking-[0.3em] text-[11px] shadow-3xl hover:translate-y-[-2px] active:translate-y-[1px] transition-all">
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
