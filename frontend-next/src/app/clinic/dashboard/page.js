"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Users, Stethoscope, Baby, AlertTriangle,
    TrendingUp, TrendingDown, Activity,
    Calendar, Filter, Search, ArrowRight,
    Droplets, Zap, ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement
);

const ClinicStatCard = ({ title, value, icon, tendency, tendencyType, isAlert }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 group hover:border-white/30 transition-all relative overflow-hidden shadow-2xl"
    >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-[#088395]/10 transition-colors" />

        <div className="flex justify-between items-start mb-6">
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center border",
                isAlert ? "bg-accent/10 border-accent/20 text-accent shadow-[0_0_20px_rgba(255,112,67,0.2)]" : "bg-[#088395]/10 border-[#088395]/20 text-[#088395]"
            )}>
                {icon}
            </div>
            <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                tendencyType === 'up' ? "bg-success/10 text-success" : tendencyType === 'down' ? "bg-accent/10 text-accent" : "bg-white/5 text-white/40"
            )}>
                {tendencyType === 'up' ? <TrendingUp size={12} /> : tendencyType === 'down' ? <TrendingDown size={12} /> : null}
                {tendency}
            </div>
        </div>

        <div className="space-y-1">
            <div className="text-4xl font-black italic tracking-tighter">{value}</div>
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{title}</div>
        </div>
    </motion.div>
);

export default function ClinicDashboard() {
    const { t } = useLanguage();
    const [timeFilter, setTimeFilter] = useState('7d');
    const [stats, setStats] = useState({ usedDoctors: 0, usedPatients: 0, type: '', clinicName: '' });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get(`/ClinicManagement/stats?timeframe=${timeFilter}`);
                setStats(res.data);
            } catch (err) {
                console.error("Erreur lors de la récupération des statistiques de la clinique", err);
            }
        };
        fetchStats();
    }, [timeFilter]);

    const chartLabels = stats.charts?.labels || [];

    const lineData = {
        labels: chartLabels,
        datasets: [{
            label: 'Patients Actifs',
            data: stats.charts?.evolution || [],
            borderColor: '#088395',
            backgroundColor: 'rgba(8, 131, 149, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 4,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#088395',
            pointBorderWidth: 2
        }]
    };

    const barData = {
        labels: chartLabels,
        datasets: [{
            label: 'Alertes Critiques',
            data: stats.charts?.alerts || [],
            backgroundColor: 'rgba(255, 112, 67, 0.8)',
            borderRadius: 12,
            hoverBackgroundColor: '#FF7043'
        }]
    };

    const doughnutData = {
        labels: stats.charts?.distribution?.labels || ['Aucun'],
        datasets: [{
            data: stats.charts?.distribution?.data?.length ? stats.charts.distribution.data : [1],
            backgroundColor: ['#088395', '#1E88E5', '#34C759', '#FFB300', '#9C27B0', '#FF5722'],
            borderWidth: 0,
            hoverOffset: 20
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 10 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false
            }
        },
        scales: {
            y: { display: false },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10, weight: '800' } }
            }
        }
    };

    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 3.2 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                            {t('clinic.overviewTitle')} <span className="text-white/40">{t('clinic.overviewItalic')}</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gestion et supervision de l'activité médicale</p>
                    </div>
                    <div className="flex items-center gap-4 p-2 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
                        {['7d', '30d', '3m'].map(f => (
                            <button
                                key={f}
                                onClick={() => setTimeFilter(f)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    timeFilter === f ? "bg-white text-[#088395] shadow-xl" : "text-white/40 hover:text-white"
                                )}
                            >
                                {f === '7d' ? '7 Jours' : f === '30d' ? '30 Jours' : '3 Mois'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards Grid SECTION 3.2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <ClinicStatCard title="Médecins Actifs" value={stats.usedDoctors < 10 ? `0${stats.usedDoctors}` : stats.usedDoctors.toString()} icon={<Stethoscope size={24} />} tendency="En ligne" tendencyType="none" />
                    <ClinicStatCard title="Familles Inscrites" value={stats.usedPatients < 10 ? `0${stats.usedPatients}` : stats.usedPatients.toString()} icon={<Users size={24} />} tendency="Total" tendencyType="none" />
                    <ClinicStatCard title="Alertes Critiques" value={stats.todayStats?.criticalAlerts < 10 ? `0${stats.todayStats?.criticalAlerts || 0}` : stats.todayStats?.criticalAlerts?.toString() || "00"} icon={<ShieldAlert size={24} />} tendency="Aujourd'hui" tendencyType="none" isAlert />
                    <ClinicStatCard title="Hypos du Jour" value={stats.todayStats?.hypos < 10 ? `0${stats.todayStats?.hypos || 0}` : stats.todayStats?.hypos?.toString() || "00"} icon={<Droplets size={24} />} tendency="Stable" tendencyType="none" />
                    <ClinicStatCard title="Hypers du Jour" value={stats.todayStats?.hypers < 10 ? `0${stats.todayStats?.hypers || 0}` : stats.todayStats?.hypers?.toString() || "00"} icon={<Zap size={24} />} tendency="Stable" tendencyType="none" />
                </div>

                {/* Charts Section SECTION 3.2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Patients Evolution */}
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Évolution Patients</h3>
                                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Suivi de la base patients active</p>
                            </div>
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#088395] border border-white/10">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <Line data={lineData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Distribution by Doctor */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl">
                        <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Répartition</h3>
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-10">Patients par médecin principal</p>
                        <div className="h-[250px] relative">
                            <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: '0.70%' }} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black italic">{stats.usedPatients}</span>
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Second Chart and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Alerts Bar Chart */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Alertes par Jour</h3>
                                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Fréquence des incidents critiques</p>
                            </div>
                            <Activity size={20} className="text-accent" />
                        </div>
                        <div className="h-[250px]">
                            <Bar data={barData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Recent Activity TABLE SECTION 3.2 */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden">
                        <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-1 text-white">Activité Récente</h3>
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-8">Dernières actions système et médicales</p>

                        <div className="space-y-4">
                            {(stats.recentActivity || []).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-colors group">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        item.type === 'danger' ? "bg-accent shadow-[0_0_10px_rgba(255,112,67,0.5)]" : item.type === 'success' ? "bg-success shadow-[0_0_10px_rgba(52,199,89,0.5)]" : "bg-[#1E88E5]"
                                    )} />
                                    <div className="flex-1">
                                        <div className="text-xs font-black uppercase tracking-tighter leading-none mb-1">{item.action}</div>
                                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{item.user}</div>
                                    </div>
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                                        {item.time}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/clinic/alerts" className="w-full mt-6 py-5 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-[#088395] transition-all flex items-center justify-center gap-3">
                            Voir historique complet <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
