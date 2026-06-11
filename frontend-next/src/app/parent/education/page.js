"use client";

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BookOpen, Heart, Zap, Apple, Activity,
    ChevronRight, Search, Star, Info, ShieldCheck,
    X, Clock, Tag, ChevronDown, ChevronUp,
    Droplets, AlertTriangle, Salad, Dumbbell, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ─────────── DATA ─────────── */
const categories = [
    { id: 'all', label: 'Tout', icon: Star },
    { id: 'fondamentaux', label: 'Fondamentaux', icon: BookOpen },
    { id: 'urgences', label: 'Urgences', icon: AlertTriangle },
    { id: 'nutrition', label: 'Nutrition', icon: Salad },
    { id: 'sport', label: 'Sport & Activité', icon: Dumbbell },
    { id: 'nuit', label: 'Nuit & Sommeil', icon: Moon },
];

const articles = [
    {
        id: 1,
        title: "Comprendre le Diabète de Type 1",
        desc: "Les bases indispensables pour chaque parent.",
        icon: BookOpen,
        color: "bg-[#088395]",
        category: "fondamentaux",
        readTime: "5 min",
        tag: "Essentiel",
        tagColor: "bg-[#088395]/20 text-[#088395]",
        content: "Le diabète de type 1 (DT1) est une maladie auto-immune chronique. Le système immunitaire attaque les cellules bêta du pancréas, responsables de la production d'insuline. Sans insuline, le glucose ne peut pas pénétrer dans les cellules et s'accumule dans le sang.",
        points: [
            "Le DT1 représente 10% de tous les cas de diabète.",
            "Il nécessite des injections d'insuline quotidiennes (ou pompe).",
            "La glycémie cible à jeun se situe entre 0,80 et 1,30 g/L.",
            "Un suivi trimestriel avec HbA1c est conseillé.",
            "L'éducation thérapeutique de l'enfant est primordiale dès le plus jeune âge."
        ]
    },
    {
        id: 2,
        title: "Gérer une Hypoglycémie",
        desc: "Réagir vite et efficacement — règle des 15/15.",
        icon: Activity,
        color: "bg-red-500",
        category: "urgences",
        readTime: "3 min",
        tag: "Urgence",
        tagColor: "bg-red-500/20 text-red-400",
        content: "L'hypoglycémie survient quand la glycémie descend sous 0,70 g/L. Elle peut se manifester par des tremblements, sueurs, pâleur, confusion ou fatigue intense. Une action rapide est indispensable.",
        points: [
            "Resucrage immédiat : 15g de glucides rapides (jus de fruit, sucre, gel de glucose).",
            "Contrôler la glycémie après 15 minutes.",
            "Si toujours < 0,70 g/L : répéter le resucrage.",
            "Ne jamais laisser l'enfant seul pendant un épisode.",
            "Prévenir le médecin si les épisodes sont fréquents (> 2/semaine)."
        ]
    },
    {
        id: 3,
        title: "Gérer une Hyperglycémie",
        desc: "Quand s'inquiéter et quoi faire ?",
        icon: Zap,
        color: "bg-orange-500",
        category: "urgences",
        readTime: "4 min",
        tag: "Urgence",
        tagColor: "bg-orange-500/20 text-orange-400",
        content: "L'hyperglycémie survient quand la glycémie dépasse 1,80 g/L. Elle peut être liée à un repas riche, une dose d'insuline insuffisante, un stress ou une maladie. Elle se traduit par soif intense, fatigue, maux de tête ou envies fréquentes d'uriner.",
        points: [
            "Vérifier les cétones si glycémie > 2,50 g/L.",
            "Assurer une bonne hydratation (eau uniquement).",
            "Administrer un bolus de correction selon le protocole médical.",
            "Identifier la cause (repas, stress, oubli d'insuline).",
            "Contacter le médecin si la glycémie reste élevée > 4h ou si cétones positives."
        ]
    },
    {
        id: 4,
        title: "Conseils Nutritionnels",
        desc: "Équilibrer les plaisirs et la santé.",
        icon: Apple,
        color: "bg-green-500",
        category: "nutrition",
        readTime: "6 min",
        tag: "Nutrition",
        tagColor: "bg-green-500/20 text-green-400",
        content: "Il n'y a pas d'aliments interdits avec le DT1 ! L'objectif est d'apprendre à gérer les glucides pour adapter les doses d'insuline en conséquence. Le comptage des glucides est une compétence clé.",
        points: [
            "Privilégier les glucides complexes (pain complet, légumineuses, riz basmati).",
            "Éviter les boissons sucrées hors épisodes hypoglycémiques.",
            "Apprendre les équivalences glucidiques (ex. 1 tranche de pain ≈ 15g de glucides).",
            "Intégrer des fibres pour ralentir l'absorption du glucose.",
            "Les fêtes et sorties sont possibles avec une adaptation du bolus."
        ]
    },
    {
        id: 5,
        title: "Sport & Activité Physique",
        desc: "Pratiquer en toute sécurité.",
        icon: Dumbbell,
        color: "bg-purple-500",
        category: "sport",
        readTime: "5 min",
        tag: "Sport",
        tagColor: "bg-purple-500/20 text-purple-400",
        content: "L'activité physique est fortement recommandée pour les enfants diabétiques : elle améliore la sensibilité à l'insuline et le bien-être général. Cependant, elle nécessite une vigilance accrue.",
        points: [
            "Mesurer la glycémie avant, pendant ET après l'effort.",
            "Glycémie cible avant le sport : 0,90 – 1,80 g/L.",
            "Avoir toujours une collation sucrée disponible.",
            "Réduction possible du bolus avant une activité prolongée (selon protocole).",
            "Surveiller l'hypoglycémie nocturne après une journée sportive intense."
        ]
    },
    {
        id: 6,
        title: "Surveillance Nocturne",
        desc: "Dormir sereinement malgré le diabète.",
        icon: Moon,
        color: "bg-indigo-500",
        category: "nuit",
        readTime: "4 min",
        tag: "Nuit",
        tagColor: "bg-indigo-500/20 text-indigo-400",
        content: "La nuit est une période délicate. L'enfant ne peut pas sentir les symptômes d'hypoglycémie en dormant. Une surveillance adaptée et des routines au coucher sont donc essentielles.",
        points: [
            "Idéalement : glycémie entre 0,90 et 1,50 g/L avant le coucher.",
            "Considérer une collation glucidique si < 1,20 g/L au coucher.",
            "Envisager un capteur de glycémie en continu (CGM) pour alertes nocturnes.",
            "Éviter toute activité physique intense dans les 2h avant le coucher.",
            "En cas de sport en soirée : réduire la dose d'insuline basale selon conseil médical."
        ]
    },
];

const tips = [
    { text: "L'activité physique améliore la sensibilité à l'insuline.", icon: Dumbbell, col: "bg-purple-500" },
    { text: "Toujours avoir 15g de sucre rapide à portée de main.", icon: Apple, col: "bg-green-500" },
    { text: "Restez hydraté — l'eau aide à réguler la glycémie.", icon: Droplets, col: "bg-[#088395]" },
    { text: "Notez les repas inhabituels dans le journal.", icon: Info, col: "bg-blue-500" },
    { text: "Les émotions fortes peuvent faire monter la glycémie.", icon: Heart, col: "bg-red-500" },
    { text: "Un bon suivi HbA1c réduit les complications à long terme.", icon: ShieldCheck, col: "bg-orange-500" },
];

/* ─────────── COMPONENTS ─────────── */
const CategoryPill = ({ cat, active, onClick }) => {
    const Icon = cat.icon;
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                active ? "bg-[#088395] text-white shadow-lg shadow-[#088395]/30" : "bg-white/5 text-white/40 border border-white/10 hover:text-white"
            )}
        >
            <Icon size={12} /> {cat.label}
        </button>
    );
};

const ArticleCard = ({ art, onClick }) => {
    const Icon = art.icon;
    return (
        <motion.button
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className="w-full p-6 bg-white/5 border border-white/10 rounded-[28px] text-left flex items-center gap-5 group hover:border-white/20 transition-all shadow-lg relative overflow-hidden"
        >
            <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-5 group-hover:opacity-15 transition-opacity", art.color)} />
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0", art.color)}>
                <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full", art.tagColor)}>
                        {art.tag}
                    </span>
                    <span className="flex items-center gap-1 text-[8px] font-bold text-white/30 uppercase">
                        <Clock size={9} /> {art.readTime}
                    </span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight italic leading-tight mb-1 text-white">{art.title}</h3>
                <p className="text-[9px] font-medium text-white/40 leading-relaxed uppercase tracking-widest truncate">{art.desc}</p>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-[#088395] transition-colors flex-shrink-0" />
        </motion.button>
    );
};

const ArticleModal = ({ article, onClose }) => {
    const Icon = article.icon;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#0b1b2b] border border-white/10 rounded-[40px] w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Gradient header */}
                <div className={cn("rounded-t-[40px] p-8 pb-6 relative overflow-hidden", article.color)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Icon size={28} className="text-white" />
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-black/20 rounded-2xl flex items-center justify-center hover:bg-black/40 transition-all"
                        >
                            <X size={18} className="text-white" />
                        </button>
                    </div>
                    <div className="relative z-10 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                {article.tag}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-bold text-white/70">
                                <Clock size={10} /> {article.readTime}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white leading-tight">{article.title}</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <p className="text-sm font-medium leading-relaxed text-white/60">{article.content}</p>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Points clés</h4>
                        {article.points.map((point, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5"
                            >
                                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5", article.color)}>
                                    {i + 1}
                                </div>
                                <p className="text-[11px] font-medium text-white/70 leading-relaxed">{point}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-5 bg-[#088395]/10 rounded-3xl border border-[#088395]/20 flex items-center gap-4">
                        <ShieldCheck size={22} className="text-[#088395] flex-shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#088395]">Validé par l&apos;équipe médicale DiaCare Kids</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─────────── PAGE ─────────── */
export default function EducationPage() {
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredArticles = useMemo(() => {
        return articles.filter(a => {
            const matchCat = activeCategory === 'all' || a.category === activeCategory;
            const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.desc.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [activeCategory, searchQuery]);

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-8 pb-32 text-white max-w-lg mx-auto">

                {/* Header */}
                <div className="pt-4 space-y-2">
                    <h1 className="text-3xl font-black tracking-tight leading-none italic uppercase">
                        Espace <span className="text-[#088395]">Éducatif</span>
                    </h1>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Apprendre pour mieux accompagner</p>
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#088395] transition-colors" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un article..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all text-white placeholder:text-white/20"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <CategoryPill
                            key={cat.id}
                            cat={cat}
                            active={activeCategory === cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                        />
                    ))}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Articles", value: articles.length, color: "text-[#088395]" },
                        { label: "Catégories", value: categories.length - 1, color: "text-purple-400" },
                        { label: "Conseils", value: tips.length, color: "text-green-400" },
                    ].map((s, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                            <div className={cn("text-2xl font-black italic", s.color)}>{s.value}</div>
                            <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Article List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between pl-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                            Articles ({filteredArticles.length})
                        </h3>
                    </div>
                    <AnimatePresence mode="popLayout">
                        {filteredArticles.length > 0 ? filteredArticles.map((art, idx) => (
                            <motion.div
                                key={art.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <ArticleCard art={art} onClick={() => setSelectedArticle(art)} />
                            </motion.div>
                        )) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16 text-white/20 text-[10px] font-black uppercase tracking-widest"
                            >
                                Aucun article trouvé
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Conseils du Jour */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 pl-2">Conseils rapides du jour</h3>
                    <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
                        {tips.map((tip, i) => {
                            const TipIcon = tip.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    className="min-w-[170px] p-5 bg-white/5 border border-white/10 rounded-[24px] flex flex-col gap-3 flex-shrink-0 hover:border-white/20 transition-all"
                                >
                                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0", tip.col)}>
                                        <TipIcon size={16} />
                                    </div>
                                    <p className="text-[9px] font-bold uppercase tracking-tight leading-snug text-white/60">{tip.text}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Article Modal */}
                <AnimatePresence>
                    {selectedArticle && (
                        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
