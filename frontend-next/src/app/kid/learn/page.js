"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Camera, Sparkles, BookOpen,
    PlayCircle, Info, Lightbulb, ChevronRight,
    Zap, Heart, ShieldCheck, HelpCircle, Apple, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const LessonCard = ({ title, desc, icon: Icon, color, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full p-8 bg-white/5 border border-white/10 rounded-[40px] text-left flex items-center gap-6 group hover:border-[#FFB300]/30 transition-all shadow-xl relative overflow-hidden"
    >
        <div className={cn("w-16 h-16 rounded-[28px] flex items-center justify-center text-white shadow-lg", color)}>
            <Icon size={28} />
        </div>
        <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-tighter mb-1 italic group-hover:text-[#FFB300] transition-colors">{title}</h3>
            <p className="text-[9px] font-bold text-white/30 leading-relaxed uppercase tracking-widest">{desc}</p>
        </div>
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
            <ChevronRight size={20} />
        </div>
    </motion.button>
);

export default function KidLearn() {
    const { t } = useLanguage();
    const [showAR, setShowAR] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const lessons = [
        { id: 1, title: "C'est quoi le Diabète ?", desc: "Deviens un expert de ton corps.", icon: BookOpen, color: "bg-blue-500", content: "Ton corps est comme une voiture qui a besoin d'énergie. Le sucre est le carburant, et l'insuline est la clé magique !" },
        { id: 2, title: "L'Insuline Magique", desc: "Pourquoi elle est ta meilleure amie.", icon: Zap, color: "bg-[#FFB300]", content: "Sans la clé insuline, le sucre reste bloqué dans la rue (le sang) et ne peut pas entrer dans la maison (tes muscles)." },
        { id: 3, title: "Force de Super-Héros", desc: "Bien manger pour gagner.", icon: Apple, color: "bg-success", content: "Les légumes te donnent des super-pouvoirs de durée, alors que les bonbons sont des petits boosts rapides !" }
    ];

    return (
        <DashboardLayout role="Enfant">
            <div className="min-h-screen space-y-10 pb-32 max-w-lg mx-auto px-6 pt-10 text-white">

                {/* Header SECTION 6.1 */}
                <div className="flex items-center justify-between">
                    <div className="w-16 h-16 bg-[#088395] rounded-[28px] flex items-center justify-center shadow-3xl text-white outline outline-4 outline-white/10">
                        <Brain size={32} />
                    </div>
                    <div className="flex-1 px-6">
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                            Académie <span className="text-[#FFB300]">Héros</span>
                        </h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">Savoir, c'est pouvoir</p>
                    </div>
                </div>

                {/* AR Magic Trigger SECTION 6.2 */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative group cursor-pointer"
                    onClick={() => setShowAR(true)}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#088395] to-blue-600 rounded-[48px] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-[#0b1b2b] to-[#088395]/40 border border-white/10 rounded-[48px] p-10 overflow-hidden shadow-3xl">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <Camera size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 bg-white text-[#088395] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-pulse">
                                <Sparkles size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{t('kid.arTitle')}</h2>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('kid.arDesc')}</p>
                            </div>
                            <button className="px-10 py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center gap-3">
                                <PlayCircle size={20} /> Lancer la Magie
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Lesson List SECTION 6.1 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-4">
                        <Lightbulb size={18} className="text-[#FFB300]" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Tes Mini-Cours</h2>
                    </div>
                    {lessons.map(lesson => (
                        <LessonCard
                            key={lesson.id}
                            title={lesson.title}
                            desc={lesson.desc}
                            icon={lesson.icon}
                            color={lesson.color}
                            onClick={() => setSelectedLesson(lesson)}
                        />
                    ))}
                </div>

                {/* AR Experience Simulation */}
                <AnimatePresence>
                    {showAR && (
                        <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                                <div className="w-full h-full bg-[radial-gradient(circle,rgba(8,131,149,0.5)_1px,transparent_1px)] bg-[size:30px_30px] animate-[pulse_4s_infinite]" />
                            </div>
                            <button onClick={() => setShowAR(false)} className="absolute top-10 right-10 w-14 h-14 bg-white/20 backdrop-blur-3xl rounded-3xl flex items-center justify-center border border-white/20 text-white z-50">
                                <X size={28} />
                            </button>
                            <div className="relative w-full aspect-[9/16] max-w-[400px] border-8 border-white/10 rounded-[60px] overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-[#0b1b2b] flex flex-col items-center justify-center p-12 text-center shadow-5xl">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                    className="absolute inset-0 border-[20px] border-dashed border-white/5 rounded-full scale-125"
                                />
                                <div className="space-y-8 relative z-10">
                                    <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center relative">
                                        <div className="absolute inset-0 border-4 border-dashed border-[#FFB300] rounded-full animate-spin" />
                                        <Camera size={60} className="text-[#FFB300]" />
                                    </div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Initialisation AR...</h3>
                                    <p className="text-sm font-medium leading-relaxed opacity-60">Pointe ton téléphone vers une surface plate pour voir ton corps s'illuminer !</p>
                                    <div className="pt-10 flex flex-col items-center gap-4">
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 bg-[#FFB300] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300]">Scanner Actif</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Lesson Pop-up */}
                <AnimatePresence>
                    {selectedLesson && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[#0b1b2b] border border-white/10 rounded-[60px] w-full max-w-lg p-10 overflow-hidden relative shadow-5xl"
                            >
                                <button onClick={() => setSelectedLesson(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl">
                                    <X size={24} />
                                </button>
                                <div className={cn("w-20 h-20 rounded-[32px] flex items-center justify-center text-white mb-8 border-4 border-white/10 shadow-3xl", selectedLesson.color)}>
                                    <selectedLesson.icon size={32} />
                                </div>
                                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{selectedLesson.title}</h1>
                                <p className="text-lg font-bold leading-relaxed text-white/80">{selectedLesson.content}</p>
                                <div className="mt-12 p-8 bg-white/5 border border-white/5 rounded-[40px] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center text-success">
                                            <ShieldCheck size={28} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest">Leçon Terminée</span>
                                    </div>
                                    <div className="text-[12px] font-black text-[#FFB300]">+ 100 XP</div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
}
