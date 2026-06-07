"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, ArrowRight, Bell, Globe, Search, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import { useBranding } from '@/lib/BrandingContext';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageResults, setPageResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { lang, switchLanguage, t } = useLanguage();
    const { branding } = useBranding();
    const logoUrl = branding.logoUrl;
    const pathname = usePathname();

    const isDashboard = pathname !== '/' && (
        pathname.includes('/dashboard') ||
        pathname.includes('/kid/') ||
        pathname.includes('/parent/') ||
        pathname.includes('/doctor/') ||
        pathname.includes('/clinic/') ||
        pathname.includes('/admin/')
    );

    // Dynamic Crawler: Scans all visible text on the active page
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setPageResults([]);
            return;
        }

        const crawlPage = () => {
            const results = [];
            const query = searchQuery.toLowerCase().trim();
            const elements = document.querySelectorAll('h1, h2, h3, h4, p, span, label, button, a');

            elements.forEach((el, index) => {
                if (el.closest('nav')) return; // Skip navbar
                const text = (el.innerText || el.textContent || "").trim();
                if (text && text.toLowerCase().includes(query) && text.length < 150) {
                    if (!results.some(r => r.text === text)) {
                        // Assign a temporary ID if none exists for precise scrolling
                        if (!el.id) el.id = `search-hit-${index}`;
                        results.push({
                            text,
                            cat: 'Sur cette page',
                            href: `#${el.id}`,
                            elementId: el.id
                        });
                    }
                }
            });
            setPageResults(results.slice(0, 5));
        };

        const timer = setTimeout(crawlPage, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleResultClick = (e, result) => {
        if (result.isDynamic && result.elementId) {
            e.preventDefault();
            const el = document.getElementById(result.elementId);
            if (el) {
                // Scroll to element
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Add highlight effect (Fluo peu transparent)
                const originalTransition = el.style.transition;
                const originalBg = el.style.backgroundColor;
                const originalPadding = el.style.padding;
                const originalRadius = el.style.borderRadius;

                el.style.transition = 'all 0.4s ease';
                el.style.backgroundColor = 'rgba(11, 27, 43, 0.4)'; // Darker overlay for highlight
                el.style.borderRadius = '6px';
                el.style.padding = '2px 6px';

                // Fade out highlight after 2 seconds
                setTimeout(() => {
                    el.style.backgroundColor = originalBg;
                    el.style.padding = originalPadding;
                    setTimeout(() => {
                        el.style.transition = originalTransition;
                        el.style.borderRadius = originalRadius;
                    }, 400);
                }, 2000);
            }
            setIsSearchFocused(false);
            setSearchQuery('');
        }
    };

    const navLinks = [
        { name: t('nav.home'), href: '/' },
        { name: t('nav.about'), href: '/about' },
        { name: t('nav.services'), href: '/services' },
        { name: t('nav.contact'), href: '/contact' },
    ];

    // Expanded searchable entries with tags for better matching when copying/pasting specific terms
    const searchableEntries = [
        // Role Dashboards
        { fr: 'Tableau de Bord Docteur', en: 'Doctor Dashboard', ar: 'لوحة تحكم الطبيب', cat: 'Dashboard', href: '/doctor/dashboard', tags: ['médical', 'hospital', 'suivi', 'medical', 'clinic'] },
        { fr: 'Tableau de Bord Parent', en: 'Parent Dashboard', ar: 'لوحة تحكم الوالدين', cat: 'Dashboard', href: '/parent/dashboard', tags: ['famille', 'enfant', 'kids', 'family', 'home'] },
        { fr: 'Tableau de Bord Clinique', en: 'Clinic Dashboard', ar: 'لوحة تحكم العيادة', cat: 'Dashboard', href: '/clinic/dashboard', tags: ['gestion', 'hopital', 'management'] },
        { fr: 'Tableau de Bord Administration', en: 'Admin Dashboard', ar: 'لوحة تحكم المسؤول', cat: 'Dashboard', href: '/admin/dashboard', tags: ['système', 'settings', 'config'] },

        // Specific Tools & Features (with keywords from pages)
        { fr: 'Analyse IA DiaPote (Moteur Médical)', en: 'DiaPote AI Analysis', ar: 'تحليل ذكي ديا-بوت', cat: 'Tool', href: '/services', tags: ['aide à la décision', 'intelligent', 'moteur', 'innovation', 'smart'] },
        { fr: 'Guide Réalité Augmentée (AR)', en: 'AR Reality Guide', ar: 'دليل الواقع المعزز', cat: 'Tool', href: '/services', tags: ['3D', 'corps humain', 'interactif', 'camera', 'interactive'] },
        { fr: 'Journal de Santé (Logbook)', en: 'Health Logbook', ar: 'دفتر الصحة', cat: 'Feature', href: '/services', tags: ['historique', 'mesures', 'glycémie', 'insuline', 'records'] },
        { fr: 'Système de Trophées & Gamification', en: 'Trophies & Badges', ar: 'الأوسمة والجوائز', cat: 'Feature', href: '/services', tags: ['jeu', 'aventure', 'badges', 'récompenses', 'points'] },
        { fr: 'Statistiques & Rapports PDF', en: 'Stats & PDF Reports', ar: 'الإحصائيات والتقارير', cat: 'Report', href: '/doctor/dashboard', tags: ['analyse', 'export', 'document', 'data'] },

        // Content from About Page
        { fr: 'À Propos de DiaCareKids', en: 'About DiaCareKids', ar: 'عن ديا-كير كيدز', cat: 'Info', href: '/about', tags: ['mission', 'écosystème', 'histoire', 'valeurs', 'innovation'] },
        { fr: 'Sécurité & Innovation', en: 'Security & Innovation', ar: 'الأمان والابتكار', cat: 'Info', href: '/about', tags: ['shield', 'protection', 'données', 'data'] },

        // Content from Contact Page
        { fr: 'Contactez-nous / Support', en: 'Contact Us / Support', ar: 'اتصل بنا / الدعم', cat: 'Link', href: '/contact', tags: ['aide', 'email', 'message', 'formulaire', 'help'] },

        // Patient Records
        { fr: 'Amine Karoui (Patient)', en: 'Amine Karoui (Patient)', ar: 'أمين كروي (مريض)', cat: 'Patient', href: '/doctor/patient/1', tags: ['garçon', 'type 1'] },
        { fr: 'Sarah Mansouri (Patient)', en: 'Sarah Mansouri (Patient)', ar: 'سارة منصوري (مريض)', cat: 'Patient', href: '/doctor/dashboard', tags: ['fille', 'type 1'] },

        // Actions
        { fr: 'Ajouter un Nouveau Patient', en: 'Add New Patient', ar: 'إضافة مريض جديد', cat: 'Action', href: '/doctor/dashboard', tags: ['inscription', 'nouveau', 'hero'] },
        { fr: 'Saisir Glycémie / Insuline', en: 'Log Glucose / Insulin', ar: 'تسجيل السكر / الأنسولين', cat: 'Action', href: '/parent/dashboard', tags: ['entrée', 'données', 'repas'] },
        { fr: 'Gérer les Alertes Actives', en: 'Manage Active Alerts', ar: 'إدارة التنبيهات', cat: 'Action', href: '/doctor/dashboard', tags: ['urgence', 'monitoring'] },
    ];

    const filteredResults = searchQuery.trim().length > 0
        ? [
            ...searchableEntries.filter(item => {
                const query = searchQuery.trim().toLowerCase();
                return (
                    item.fr.toLowerCase().includes(query) ||
                    item.en.toLowerCase().includes(query) ||
                    item.ar.includes(query) ||
                    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
                );
            }),
            ...pageResults.map(p => ({
                fr: p.text, en: p.text, ar: p.text,
                cat: p.cat,
                href: p.href,
                isDynamic: true,
                elementId: p.elementId
            }))
        ]
        : [];

    const languages = [
        { code: 'fr', label: 'Français', flag: 'FR' },
        { code: 'en', label: 'English', flag: 'EN' },
        { code: 'ar', label: 'العربية', flag: 'AR' },
    ];

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-8",
            scrolled ? "py-4" : "py-6"
        )}>
            <div className={cn(
                "max-w-[95%] mx-auto px-6 py-4 rounded-full border border-white/10 transition-all duration-500 flex items-center justify-between gap-4",
                scrolled ? "bg-white/10 backdrop-blur-2xl shadow-2xl border-white/20" : "bg-transparent"
            )}>
                <div className="flex items-center gap-4">
                    {/* Sidebar Toggle for Dashboards - To the left of Logo */}
                    {isDashboard && (
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
                            className="p-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all flex items-center gap-2 group"
                        >
                            <Menu size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                    )}

                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 shrink-0 group transition-all duration-500"
                    >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500 overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt="DiaCare Kids" className="w-8 h-8 object-contain" />
                            ) : (
                                <Activity className="text-[#0b1b2b] w-6 h-6" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold tracking-tight text-premium uppercase leading-none">
                                DiaCare<span className="text-white italic">Kids</span>
                            </span>
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.3em] mt-1 hidden sm:block">Smart Pediatric Monitoring</span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-8 ml-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Active Search Tool */}
                <div className="hidden lg:flex items-center bg-white/5 rounded-full px-5 py-2 border border-white/10 w-full max-w-[200px] xl:max-w-xs relative ml-4">
                    <Search size={16} className={cn("transition-colors", isSearchFocused ? "text-premium" : "text-white/30")} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        placeholder={t('nav.search')}
                        className="bg-transparent border-none focus:ring-0 text-xs font-semibold px-3 w-full text-white placeholder:text-white/20 outline-none"
                    />

                    <AnimatePresence>
                        {isSearchFocused && searchQuery.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-14 left-0 right-0 bg-[#0b1b2b]/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-3"
                            >
                                <div className="p-3 border-b border-white/10 mb-2">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('nav.quickResults')}</span>
                                </div>
                                <div className="space-y-1 max-h-60 overflow-y-auto">
                                    {filteredResults.length > 0 ? (
                                        filteredResults.map((result, idx) => (
                                            <Link
                                                key={idx}
                                                href={result.href}
                                                onClick={(e) => handleResultClick(e, result)}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white">{result[lang] || result.fr}</span>
                                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{result.cat}</span>
                                                </div>
                                                <ArrowRight size={14} className="text-white/0 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">{t('nav.noResults')}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 mt-2 bg-white/5 rounded-xl text-center border border-white/5">
                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{t('nav.pressEnter')}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="relative">
                        <button
                            onClick={() => setLangOpen(!langOpen)}
                            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all shadow-sm flex items-center gap-2 border border-white/10 outline-none"
                        >
                            <Globe size={18} className="text-white/60" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{lang.toUpperCase()}</span>
                            <ChevronDown size={12} className={cn("text-white/40 transition-transform", langOpen && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                            {langOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-14 right-0 bg-[#0b1b2b]/95 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/10 p-2 min-w-[150px]"
                                >
                                    {languages.map(l => (
                                        <button
                                            key={l.code}
                                            onClick={() => { switchLanguage(l.code); setLangOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-between group",
                                                lang === l.code ? "bg-white text-[#0b1b2b]" : "text-white hover:bg-white/10"
                                            )}
                                        >
                                            <span>{l.label}</span>
                                            <span className="opacity-40 group-hover:opacity-100">{l.flag}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all shadow-sm relative border border-white/10">
                        <Bell size={18} className="text-white/60" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-[#0b1b2b]" />
                    </button>

                    <Link href="/auth" className="flex items-center gap-3 pl-4 border-l border-white/10 group">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/40 border border-white/10 group-hover:border-white/30 transition-colors">
                            <User size={20} />
                        </div>
                        <div className="hidden xl:block">
                            <div className="text-[10px] font-bold text-premium uppercase tracking-widest leading-none">{t('nav.login')}</div>
                            <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">{t('nav.mySpace')}</div>
                        </div>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-3 bg-white/10 rounded-full text-white/60 border border-white/10"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 bg-[#0b1b2b] z-[60] flex flex-col p-12"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <span className="text-2xl font-black text-premium uppercase tracking-tighter">DiaCare<span className="text-white">Kids</span></span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-4 bg-white/10 rounded-full text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-4xl font-extrabold text-white/90 hover:text-white transition-colors italic uppercase tracking-tighter"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-white/10 w-full my-8" />

                            <div className="flex gap-4">
                                {languages.map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => { switchLanguage(l.code); setMobileMenuOpen(false); }}
                                        className={cn(
                                            "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                            lang === l.code ? "bg-white text-[#0b1b2b] border-white" : "text-white border-white/20 bg-white/5"
                                        )}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>

                            <Link
                                href="/auth"
                                onClick={() => setMobileMenuOpen(false)}
                                className="btn-apple !py-6 text-xl text-center mt-4"
                            >
                                {t('nav.mySpace')}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
