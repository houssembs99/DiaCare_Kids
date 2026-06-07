"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Users, BarChart3, Bell, FileText, Settings, LogOut, Activity, Menu, X,
    ShieldCheck, ChevronRight, Building2, CreditCard, Stethoscope, Baby, Wallet, AlertTriangle,
    Syringe, MessageSquare, History as HistoryIcon, PlusCircle, BookOpen, MessageCircle,
    Gamepad2, Brain, Trophy, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

const DashboardLayout = ({ children, role = "Utilisateur" }) => {
    const { t, lang } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const pathname = usePathname();
    const router = useRouter();

    const isAdmin = role === 'Admin';
    const isClinic = role === 'Clinique';
    const primaryColor = 'bg-[#0b1b2b]';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);

            // Fetch full user profile
            api.get(`/Users/${parsed.id}`).then(res => {
                setUser(res.data);
                // Also update localStorage so role/name are fresh
                localStorage.setItem('user', JSON.stringify({
                    id: res.data.id,
                    role: res.data.role,
                    fullName: res.data.fullName,
                    token: localStorage.getItem('token') // keep token
                }));
            }).catch(err => console.error("Error fetching user:", err));

            // Fetch unread messages
            api.get(`/Messages/user/${parsed.id}`).then(res => {
                const unread = res.data.filter(m => !m.isRead && m.receiverId === parsed.id);
                setUnreadMessages(unread.length);
            }).catch(err => console.error("Error fetching unread:", err));
        }
        else router.push('/auth');

        const handleToggleSidebar = () => setSidebarOpen(true);
        window.addEventListener('toggle-sidebar', handleToggleSidebar);
        return () => window.removeEventListener('toggle-sidebar', handleToggleSidebar);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth');
    };

    const getRolePath = (roleName) => {
        const mapping = {
            'Medecin': 'doctor',
            'Clinique': 'clinic',
            'Admin': 'admin',
            'Parent': 'parent'
        };
        return mapping[roleName] || roleName.toLowerCase();
    };

    const rolePath = getRolePath(role);

    const adminLinks = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: <Home size={20} /> },
        { name: 'Cliniques', href: '/admin/clinics', icon: <Building2 size={20} /> },
        { name: 'Médecins', href: '/admin/doctors', icon: <Users size={20} /> },
        { name: 'Utilisateurs', href: '/admin/users', icon: <Users size={20} /> },
        { name: 'Abonnements', href: '/admin/subscriptions', icon: <CreditCard size={20} /> },
        { name: 'Paiements', href: '/admin/payments', icon: <Activity size={20} /> },
        { name: 'Statistiques', href: '/admin/stats', icon: <BarChart3 size={20} /> },
        { name: 'Notifications', href: '/admin/notifications', icon: <Bell size={20} /> },
        { name: 'Paramètres', href: '/admin/settings', icon: <Settings size={20} /> },
        { name: 'Sécurité & Logs', href: '/admin/security', icon: <ShieldCheck size={20} /> },
    ];

    const clinicLinks = [
        { name: t('sidebar.dashboard'), href: '/clinic/dashboard', icon: <Home size={20} /> },
        { name: t('sidebar.doctors'), href: '/clinic/doctors', icon: <Stethoscope size={20} /> },
        { name: t('sidebar.patients'), href: '/clinic/patients', icon: <Baby size={20} /> },
        { name: 'Packs & Forfaits', href: '/clinic/packages', icon: <FileText size={20} /> },
        { name: t('sidebar.stats'), href: '/clinic/stats', icon: <BarChart3 size={20} /> },
        { name: t('sidebar.subscription'), href: '/pricing', icon: <CreditCard size={20} /> },
        { name: t('sidebar.payments'), href: '/clinic/payments', icon: <Wallet size={20} /> },
        { name: t('sidebar.alerts'), href: '/clinic/alerts', icon: <AlertTriangle size={20} /> },
        { name: t('sidebar.settings'), href: '/clinic/settings', icon: <Settings size={20} /> },
    ];

    const doctorLinks = [
        { name: t('sidebar.dashboard'), href: '/doctor/dashboard', icon: <Home size={20} /> },
        { name: t('sidebar.myPatients'), href: '/doctor/patients', icon: <Baby size={20} /> },
        { name: t('sidebar.alerts'), href: '/doctor/alerts', icon: <AlertTriangle size={20} /> },
        { name: t('sidebar.treatments'), href: '/doctor/treatments', icon: <Syringe size={20} /> },
        { name: 'Analyse Médicale', href: '/doctor/stats', icon: <BarChart3 size={20} /> },
        { name: t('sidebar.messaging'), href: '/doctor/messaging', icon: <MessageSquare size={20} /> },
        // Pour les médecins de cabinet (indépendants), on ajoute les packs et paiements
        ...(!user?.associatedClinicId ? [
            { name: t('sidebar.subscription'), href: '/pricing', icon: <CreditCard size={20} /> },
            { name: "Packs & Forfaits", href: '/doctor/packages', icon: <Package size={20} /> },
            { name: t('sidebar.payments'), href: '/doctor/payments', icon: <Wallet size={20} /> }
        ] : []),
        { name: t('sidebar.settings'), href: '/doctor/settings', icon: <Settings size={20} /> },
    ];

    const parentLinks = [
        { name: t('sidebar.dashboard'), href: '/parent/dashboard', icon: <Home size={20} /> },
        { name: 'Mes Héros', href: '/parent/heroes', icon: <Baby size={20} /> },
        { name: t('sidebar.subscription'), href: '/pricing', icon: <CreditCard size={20} /> },
        { name: t('sidebar.payments'), href: '/parent/payments', icon: <Wallet size={20} /> },
        { name: t('parent.addMeasure'), href: '/parent/add', icon: <PlusCircle size={20} /> },
        { name: t('sidebar.stats'), href: '/parent/history', icon: <HistoryIcon size={20} /> },
        { name: t('sidebar.messaging'), href: '/parent/messaging', icon: <MessageCircle size={20} /> },
        { name: t('sidebar.education'), href: '/parent/education', icon: <BookOpen size={20} /> },
    ];

    const standardLinks = [
        { name: t('sidebar.dashboard'), href: `/${rolePath}/dashboard`, icon: <Home size={20} /> },
        { name: t('sidebar.patients'), href: '/doctor/dashboard', icon: <Users size={20} />, active: role === 'Medecin' || role === 'Clinique' },
        { name: t('sidebar.stats'), href: '#', icon: <BarChart3 size={20} /> },
        { name: t('sidebar.alerts'), href: '#', icon: <Bell size={20} /> },
        { name: t('sidebar.reports'), href: '#', icon: <FileText size={20} /> },
        { name: t('sidebar.settings'), href: '#', icon: <Settings size={20} /> },
    ];

    const kidLinks = [
        { name: t('kid.monMonde'), href: '/kid/dashboard', icon: <Home size={24} /> },
        { name: t('kid.mesJeux'), href: '/kid/games', icon: <Gamepad2 size={24} /> },
        { name: t('kid.jApprends'), href: '/kid/learn', icon: <Brain size={24} /> },
        { name: t('kid.recompenses'), href: '/kid/rewards', icon: <Trophy size={24} /> },
    ];

    const sidebarLinks = isAdmin ? adminLinks : isClinic ? clinicLinks : (role === 'Medecin' ? doctorLinks : (role === 'Parent' ? parentLinks : (role === 'Enfant' ? kidLinks : standardLinks)));

    if (!user) return null;

    return (
        <div className={cn("min-h-screen relative overflow-x-hidden", primaryColor)}>

            {/* Dashboard Toggle Button removed from here (now in Navbar) */}

            {/* Main Content Area */}
            <main className="pt-24 min-h-screen flex flex-col">
                <div className="flex-1 p-6 lg:p-12 w-full">
                    {/* Alert: Clinique or personal-plan Parent with inactive sub → Stripe payment */}
                    {((role === 'Clinique' && user.subscription?.isActive === false) ||
                      (role === 'Parent' && user.subscription?.isActive === false && !user.associatedClinicId)) && (
                        <div className="bg-accent/10 border border-accent/20 p-5 rounded-[24px] mb-8 flex items-center gap-5 shadow-[0_0_20px_rgba(255,112,67,0.1)]">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-white text-sm uppercase tracking-widest mb-1">Abonnement Inactif</h4>
                                <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">
                                    Veuillez payer en ligne ou contacter l'administration pour débloquer votre accès.
                                </p>
                            </div>
                            <Link href="/pricing" className="bg-accent text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/80 transition-colors shadow-lg shadow-accent/20">
                                Payer en Ligne
                            </Link>
                        </div>
                    )}

                    {/* Alert: Clinic-managed Parent with inactive sub → contact clinic */}
                    {role === 'Parent' && user.subscription?.isActive === false && user.associatedClinicId && (
                        <div className="bg-[#088395]/10 border border-[#088395]/30 p-5 rounded-[24px] mb-8 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-[#088395]/20 flex items-center justify-center text-[#088395]">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-white text-sm uppercase tracking-widest mb-1">En Attente d'Activation</h4>
                                <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">
                                    Votre compte est lié à une clinique. Contactez votre clinique pour finaliser votre paiement.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Breadcrumb SECTION 12.3 */}
                    <div className="flex items-center gap-3 mb-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push('/')}>DiaCare</span>
                        {pathname.split('/').filter(p => p && p !== 'admin').map((segment, idx) => (
                            <React.Fragment key={idx}>
                                <ChevronRight size={10} className="opacity-20" />
                                <span className="text-white">{segment.charAt(0).toUpperCase() + segment.slice(1)}</span>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Mobile Header Label */}
                    <div className="lg:hidden flex items-center justify-between mb-8">
                        <div className="font-bold uppercase tracking-widest text-[10px] text-white/40">{role} Space</div>
                    </div>

                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation for Parent Role (Mobile/Tablet) */}
            {role === 'Parent' && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-2xl border-t border-white/10 px-4 py-3 flex justify-around items-center z-[50]">
                    {parentLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-2 transition-all",
                                    isActive ? "text-white" : "text-white/40"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl transition-all relative",
                                    isActive && "bg-[#088395] shadow-[0_5px_15px_rgba(8,131,149,0.3)]"
                                )}>
                                    {React.cloneElement(link.icon, { size: 20 })}
                                    {link.href.includes('messaging') && unreadMessages > 0 && (
                                        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border border-[#0b1b2b] animate-bounce" />
                                    )}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest">{link.name.split(' ')[0]}</span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Bottom Navigation for Kid Role (Gamified) */}
            {role === 'Enfant' && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#0b1b2b]/80 backdrop-blur-2xl border-t border-white/10 px-4 py-4 flex justify-around items-center z-[60] rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    {kidLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const isEducation = link.name === t('kid.jApprends');

                        const Content = (
                            <>
                                <div className={cn(
                                    "p-4 rounded-3xl transition-all shadow-lg",
                                    isActive ? "bg-[#FFB300] text-black rotate-[5deg]" : "text-white"
                                )}>
                                    {React.cloneElement(link.icon, { size: 28 })}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight mt-1">{link.name}</span>
                            </>
                        );

                        if (isEducation) {
                            return (
                                <button
                                    key={link.name}
                                    onClick={() => window.dispatchEvent(new CustomEvent('open-education'))}
                                    className={cn(
                                        "flex flex-col items-center gap-1 transition-all duration-300",
                                        isActive ? "scale-110" : "opacity-40"
                                    )}
                                >
                                    {Content}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-all duration-300",
                                    isActive ? "scale-110" : "opacity-40"
                                )}
                            >
                                {Content}
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Left-Side Universal Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <div className="fixed inset-0 z-[100]">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        {/* Sidebar Panel - Slides from Left */}
                        <motion.aside
                            initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 bottom-0 left-0 bg-[#1E88E5]/95 lg:bg-white/5 backdrop-blur-3xl border-r border-white/10 w-[320px] shadow-[20px_0_50px_rgba(0,0,0,0.3)] flex flex-col z-[101] overflow-hidden"
                        >
                            {/* Panel Header */}
                            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1E88E5] shadow-lg">
                                        <Activity size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Menu Navigation</span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* User Profile */}
                            <div className="p-8">
                                <Link 
                                    href={role === 'Parent' ? '/parent/profile' : `/${rolePath}/settings`}
                                    onClick={() => setSidebarOpen(false)}
                                    className="px-6 py-8 bg-white/5 rounded-[32px] border border-white/10 relative overflow-hidden group/profile hover:bg-white/10 transition-all block"
                                >
                                    <div className="absolute top-[-20px] left-[-20px] p-8 text-white/5 group-hover/profile:rotate-12 transition-transform duration-1000">
                                        <ShieldCheck size={80} />
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#1E88E5] font-black text-xl shadow-2xl group-hover/profile:scale-110 transition-transform overflow-hidden">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                user.fullName?.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-black text-white uppercase leading-none truncate">{user.fullName}</span>
                                            <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest mt-2">{role} Expert</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-2 pb-10">
                                {sidebarLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    const isEducation = link.name === t('kid.jApprends');

                                    const LinkContent = (
                                        <>
                                            <span className={cn("transition-transform group-hover:scale-110 relative", isActive ? "text-[#1E88E5]" : "text-white/20 group-hover:text-white")}>
                                                {React.cloneElement(link.icon, { size: 20 })}
                                                {link.href.includes('messaging') && unreadMessages > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full animate-bounce shadow-md" />
                                                )}
                                            </span>
                                            {link.name}
                                            {isActive && (
                                                <div className="ml-auto w-1.5 h-1.5 bg-[#1E88E5] rounded-full" />
                                            )}
                                            {!isActive && link.href.includes('messaging') && unreadMessages > 0 && (
                                                <div className="ml-auto w-4 h-4 rounded-full bg-accent text-[8px] font-black text-white flex items-center justify-center">
                                                    {unreadMessages > 9 ? '9+' : unreadMessages}
                                                </div>
                                            )}
                                        </>
                                    );

                                    if (isEducation) {
                                        return (
                                            <button
                                                key={link.name}
                                                onClick={() => {
                                                    setSidebarOpen(false);
                                                    window.dispatchEvent(new CustomEvent('open-education'));
                                                }}
                                                className={cn(
                                                    "flex items-center gap-4 px-6 py-5 rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] transition-all group relative overflow-hidden w-full text-left",
                                                    isActive ? "bg-white text-[#1E88E5] shadow-xl" : "text-white/40 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                {LinkContent}
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 px-6 py-5 rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] transition-all group relative overflow-hidden",
                                                isActive ? "bg-white text-[#1E88E5] shadow-xl" : "text-white/40 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            {LinkContent}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Logout Footer */}
                            <div className="p-8 bg-black/10 border-t border-white/10">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-4 py-5 bg-accent/20 hover:bg-accent text-accent hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    <LogOut size={20} />
                                    {t('sidebar.logout')}
                                </button>
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;
