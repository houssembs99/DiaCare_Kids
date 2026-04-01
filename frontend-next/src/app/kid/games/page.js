"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gamepad2, Zap, Rocket, Apple,
    Play, Trophy, Star, ChevronRight,
    Target, Search, X, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const GameCard = ({ title, desc, icon: Icon, color, xp, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full p-6 bg-white/5 border border-white/10 rounded-[40px] text-left flex items-center gap-6 group hover:border-[#FFB300]/30 transition-all shadow-xl relative overflow-hidden"
    >
        <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-white border-2 border-white/10 shadow-lg", color)}>
            <Icon size={30} />
        </div>
        <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-tighter mb-1 italic group-hover:text-[#FFB300] transition-colors">{title}</h3>
            <p className="text-[9px] font-bold text-white/30 leading-relaxed uppercase tracking-widest">{desc}</p>
            <div className="flex items-center gap-2 mt-2">
                <div className="px-2 py-0.5 bg-white/10 rounded-full text-[8px] font-black text-[#FFB300] uppercase tracking-widest">
                    +{xp} XP
                </div>
            </div>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#FFB300] group-hover:text-black transition-all">
            <Play size={20} fill="currentColor" />
        </div>
    </motion.button>
);

export default function KidGames() {
    const { t } = useLanguage();
    const router = useRouter();
    const [playingGame, setPlayingGame] = useState(null);

    const games = [
        { id: 'runner', title: 'Dia Runner', desc: "Esquive les ennemies, collecte les coeurs !", icon: Activity, color: "bg-red-500", xp: 500, link: '/kid/games/runner' },
        { id: 1, title: t('kid.gameInsulin'), desc: "Utilise ton bouclier d'insuline !", icon: Zap, color: "bg-blue-500", xp: 250 },
        { id: 2, title: t('kid.gameHypo'), desc: "Trouve le trésor sucré pour gagner !", icon: Apple, color: "bg-accent", xp: 150 },
        { id: 3, title: t('kid.gameFood'), desc: "Aide ton héros à choisir son repas.", icon: Search, color: "bg-success", xp: 200 }
    ];

    return (
        <DashboardLayout role="Enfant">
            <div className="min-h-screen space-y-10 pb-32 max-w-lg mx-auto px-6 pt-10 text-white">

                {/* Header SECTION 5.1 */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                            Centre <span className="text-[#FFB300]">Explo</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">S'amuser pour apprendre</p>
                    </div>
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[28px] flex items-center justify-center relative shadow-3xl">
                        <Trophy size={28} className="text-[#FFB300]" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full border-4 border-[#0b1b2b] flex items-center justify-center text-[10px] font-black">3</div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {['Tous', 'Action', 'Puzzle', 'Quêtes'].map((cat, i) => (
                        <button key={i} className={cn(
                            "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                            i === 0 ? "bg-[#FFB300] text-black border-transparent shadow-xl" : "bg-white/5 border-white/10 text-white/40"
                        )}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Game List SECTION 5.2 */}
                <div className="space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 pl-4">Aujourd'hui sur DiaCare</h2>
                    {games.map(game => (
                        <GameCard
                            key={game.id}
                            title={game.title}
                            desc={game.desc}
                            icon={game.icon}
                            color={game.color}
                            xp={game.xp}
                            onClick={() => {
                                if (game.link) {
                                    router.push(game.link);
                                } else {
                                    setPlayingGame(game);
                                }
                            }}
                        />
                    ))}
                </div>

                {/* Featured Quest */}
                <div className="bg-gradient-to-br from-[#FFB300] to-[#FFA000] rounded-[40px] p-8 text-black relative overflow-hidden shadow-2xl group cursor-pointer">
                    <div className="absolute -right-10 -bottom-10 opacity-20">
                        <Rocket size={200} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center mb-6">
                            <Target size={24} />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">Grande Mission AR</h3>
                        <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Utilise ta caméra pour voir tes pouvoirs !</p>
                        <button className="mt-8 px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            Démarrer
                        </button>
                    </div>
                </div>

                {/* Simple Game Modal Simulation */}
                <AnimatePresence>
                    {playingGame && (
                        <div className="fixed inset-0 z-[100] bg-[#0b1b2b] flex flex-col p-6 overflow-hidden">
                            <div className="flex items-center justify-between pb-6">
                                <button onClick={() => setPlayingGame(null)} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                    <X size={24} />
                                </button>
                                <div className="text-center flex-1">
                                    <h4 className="text-sm font-black uppercase tracking-tighter italic">{playingGame.title}</h4>
                                    <div className="text-[8px] font-bold text-[#FFB300] uppercase tracking-widest">Niveau 2 • Difficile</div>
                                </div>
                                <div className="w-12 h-14 bg-[#FFB300] rounded-xl flex flex-col items-center justify-center text-black">
                                    <Star size={18} fill="currentColor" />
                                    <span className="text-[10px] font-black">20</span>
                                </div>
                            </div>

                            {/* Fake Game Container */}
                            <div className="flex-1 bg-white/5 border-4 border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center space-y-10 relative overflow-hidden">
                                <motion.div
                                    animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className={cn("w-40 h-40 rounded-full flex items-center justify-center text-6xl shadow-3xl", playingGame.color)}
                                >
                                    {playingGame.id === 1 ? "🍬" : (playingGame.id === 2 ? "🥤" : "🕵️")}
                                </motion.div>
                                <div className="text-center px-10">
                                    <p className="text-lg font-black italic uppercase tracking-tighter mb-4">Prêt pour l'aventure ?</p>
                                    <button className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl animate-pulse">
                                        Commencer
                                    </button>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-[#FFB300]" />
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
}
