"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Activity, Clock, CheckCircle2, AlertTriangle,
    ArrowRight, Baby, Calendar, Bell,
    ChevronRight, Droplets, Zap, Heart, PlusCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import api from '@/lib/api';
import { Shield, Building2, Stethoscope, User, Loader2 } from 'lucide-react';

import { useRouter } from 'next/navigation';

const ParentCard = ({ title, children, icon: Icon, color = "bg-white/5" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group", color)}
    >
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{title}</h3>
            {Icon && <Icon size={18} className="text-white/20 group-hover:text-white transition-colors" />}
        </div>
        {children}
    </motion.div>
);

export default function ParentDashboard() {
    const { t } = useLanguage();
    const router = useRouter();
    const [treatmentDone, setTreatmentDone] = useState(false);
    const [parentName, setParentName] = useState('');
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/parent/dashboard-summary');
            console.log("Dashboard Summary Data:", res.data);
            setSummary(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.fullName) setParentName(user.fullName);
        fetchData();
    }, []);

    const getRemainingTime = (expiryDate) => {
        if (!expiryDate) return { months: 0, days: 0 };
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = Math.max(0, expiry - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;
        return { months, days };
    };

    const timeRemaining = summary?.subscription ? getRemainingTime(summary.subscription.expiryDate) : { months: 0, days: 0 };
    const latestStats = summary?.latestStats;
    const history = summary?.recentHistory || [];

    const formatRelativeTime = (timestamp) => {
        if (!timestamp) return "";
        const diff = new Date() - new Date(timestamp);
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `il y a ${mins} minute${mins > 1 ? 's' : ''}`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        return new Date(timestamp).toLocaleDateString();
    };
    const kidsUsed = summary?.children?.length || 0;
    const kidsMax = summary?.subscription?.maxKids || 1;

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-8 pb-20 text-white max-w-lg mx-auto">

                {/* Mobile-Style Header SECTION 3.2 */}
                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#088395] rounded-[22px] border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-xl">
                            {parentName.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight leading-none italic">
                                {parentName.split(' ')[0]} <span className="text-white/40">{parentName.split(' ').slice(1).join(' ')}</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-success">Statut: Stable</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative">
                        <Bell size={20} className="text-white/40" />
                        <div className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-[#088395]" />
                    </button>
                </div>


                {/* Main Glucose Card SECTION 4.1 */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-[#088395] to-[#066a7a] rounded-[40px] p-10 shadow-[0_30px_60px_rgba(8,131,149,0.4)] relative overflow-hidden"
                >
                    <div className="absolute -right-10 -top-10 opacity-10">
                        <Activity size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                            {latestStats?.childName ? `Dernière glycémie (${latestStats.childName})` : t('parent.lastGlucose')}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-7xl font-black italic tracking-tighter">
                                {latestStats?.value ? Math.round(latestStats.value) : '--'}
                            </span>
                            <span className="text-xl font-bold opacity-40">mg/dL</span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2 bg-black/10 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                            <Clock size={12} /> {latestStats?.timestamp ? formatRelativeTime(latestStats.timestamp) : 'Aucune donnée'}
                        </div>
                    </div>
                </motion.div>
                
                <ParentCard title="Mes Enfants" icon={Baby}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-black italic tracking-tighter">
                                {kidsUsed} / {kidsMax}
                            </div>
                            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">
                                Enfants enregistrés
                            </div>
                        </div>
                        <Link href="/parent/heroes" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                            <ChevronRight size={20} className="text-white/40" />
                        </Link>
                    </div>
                </ParentCard>


                {/* Recent History SECTION 4.3 */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pl-4">Historique récent</h3>

                    <div className="space-y-3">
                        {history.length > 0 ? history.map((record, idx) => (
                            <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-4 group hover:bg-white/10 transition-all">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                                    record.glucoseValue < 70 ? "bg-accent/20 text-accent" : 
                                    record.glucoseValue > 180 ? "bg-yellow-500/20 text-yellow-500" : 
                                    "bg-success/20 text-success"
                                )}>
                                    <Activity size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black uppercase tracking-tighter">
                                        {record.childName} • {record.glucoseValue} mg/dL
                                    </div>
                                    <p className="text-[11px] font-medium text-white/60 leading-tight mt-1">
                                        {record.insulinDose > 0 ? `${record.insulinDose} UI Insuline` : 'Pas d\'insuline'} 
                                        {record.carbsEstimated > 0 ? ` • ${record.carbsEstimated}g Glucides` : ''}
                                    </p>
                                </div>
                                <div className="text-[8px] font-black text-white/20 uppercase">
                                    {formatRelativeTime(record.timestamp)}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-white/20 text-[10px] font-black uppercase tracking-widest">
                                Aucune mesure enregistrée
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom CTA for adding measure or hero */}
                <div className="pt-4">
                    {kidsUsed > 0 ? (
                        <Link
                            href="/parent/add"
                            className="w-full py-6 bg-white text-[#088395] rounded-[28px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all group"
                        >
                            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                            {t('parent.addMeasure')}
                        </Link>
                    ) : (
                        <Link
                            href="/parent/heroes"
                            className="w-full py-6 bg-white text-[#088395] rounded-[28px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all group"
                        >
                            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                            {t('parent.addHero')}
                        </Link>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
