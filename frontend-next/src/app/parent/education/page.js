"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BookOpen, Heart, Zap, Apple,
    Activity, ChevronRight, Search,
    Star, Info, ShieldCheck, PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const EduCard = ({ title, desc, icon: Icon, color, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full p-8 bg-white/5 border border-white/10 rounded-[32px] text-left flex items-center gap-6 group hover:border-white/30 transition-all shadow-xl relative overflow-hidden"
    >
        <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-5 transition-opacity group-hover:opacity-10", color)} />
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
            <Icon size={24} />
        </div>
        <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-tighter mb-1 italic group-hover:text-white transition-colors">{title}</h3>
            <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase tracking-widest">{desc}</p>
        </div>
        <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
    </motion.button>
);

const SectionHeader = ({ title, sub }) => (
    <div className="flex flex-col mb-8 pl-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h2>
        <p className="text-[10px] font-bold text-[#088395] uppercase tracking-[0.2em]">{sub}</p>
    </div>
);

export default function EducationPage() {
    const [selectedArticle, setSelectedArticle] = useState(null);

    const articles = [
        { id: 1, title: "Comprendre le Diabète de Type 1", desc: "Les bases essentielles pour les parents.", icon: BookOpen, color: "bg-[#088395]", content: "Le diabète de type 1 est une maladie auto-immune où le pancréas ne produit plus d'insuline. Chez les enfants, cela nécessite un suivi rigoureux..." },
        { id: 2, title: "Gérer une Hypoglycémie", desc: "Réagir vite et efficacement.", icon: Activity, color: "bg-accent", content: "L'hypoglycémie (< 0.70 g/L) nécessite le resucrage immédiat. Donnez 15g de glucides rapides (jus, sucre) et attendez 15 minutes..." },
        { id: 3, title: "Gérer une Hyperglycémie", desc: "Quand s'inquiéter et que faire ?", icon: Zap, color: "bg-orange-500", content: "L'hyperglycémie peut être due à un manque d'insuline, au stress ou à l'alimentation. Vérifiez l'acétone si le taux dépasse 2.50 g/L..." },
        { id: 4, title: "Conseils Nutritionnels", desc: "Équilibrer les plaisirs et la santé.", icon: Apple, color: "bg-success", content: "Il n'y a pas d'aliments interdits, mais privilégiez les glucides complexes et contrôlez les portions pour stabiliser la glycémie..." }
    ];

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-12 pb-32 text-white max-w-lg mx-auto">

                {/* Header SECTION 8.1 */}
                <div className="flex items-center justify-between pt-4">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40">
                        <Star size={24} />
                    </div>
                    <div className="relative flex-1 mx-6 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#088395] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="RECHERCHER UN CONSEIL..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all"
                        />
                    </div>
                </div>

                {/* Educational Hub Header */}
                <SectionHeader title="Espace Éducatif" sub="Apprendre pour mieux accompagner" />

                {/* Article List SECTION 8.2 */}
                <div className="space-y-4">
                    {articles.map((art) => (
                        <EduCard
                            key={art.id}
                            title={art.title}
                            desc={art.desc}
                            icon={art.icon}
                            color={art.color}
                            onClick={() => setSelectedArticle(art)}
                        />
                    ))}
                </div>



                {/* Quick Tips List */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/30 pl-4">Conseils du jour</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {[
                            { text: "L'activité physique fait baisser la glycémie.", icon: Zap, col: "bg-accent" },
                            { text: "Toujours avoir 15g de sucre sur soi.", icon: Apple, col: "bg-success" },
                            { text: "Notez les repas inhabituels.", icon: Info, col: "bg-blue-500" }
                        ].map((tip, i) => (
                            <div key={i} className="min-w-[200px] p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col gap-4">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", tip.col)}>
                                    <tip.icon size={18} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-tighter leading-tight text-white/60">{tip.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Article Modal */}
                <AnimatePresence>
                    {selectedArticle && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/0.80 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[#0b1b2b] border border-white/10 rounded-[40px] w-full max-w-lg p-10 overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                            >
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl hover:bg-white/10"
                                >
                                    Fermer
                                </button>
                                <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-8", selectedArticle.color)}>
                                    <selectedArticle.icon size={32} />
                                </div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{selectedArticle.title}</h2>
                                <p className="text-sm font-medium leading-relaxed text-white/60 mb-10">{selectedArticle.content}</p>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                                    <ShieldCheck size={24} className="text-success" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#088395]">Validé par l'équipe médicale DiaCare</span>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
}
