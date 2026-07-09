"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BarChart3, Calendar, Filter, Download,
    TrendingUp, TrendingDown, Activity,
    Stethoscope, Users, Baby, PieChart,
    ArrowRight, Target, Zap, Droplets
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, ArcElement,
    Filler, RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement, Filler,
    RadialLinearScale
);

const StatsDetailCard = ({ title, value, sub, icon, color }) => (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-4 hover:border-white/30 transition-all group relative overflow-hidden">
        <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20", color)} />
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white", color)}>
            {icon}
        </div>
        <div>
            <div className="text-4xl font-black italic tracking-tighter leading-none mb-2">{value}</div>
            <div className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{title}</div>
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-2">{sub}</div>
        </div>
    </div>
);

export default function ClinicStats() {
    const [filterPeriod, setFilterPeriod] = useState('30d');
    const [statsData, setStatsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchInternalStats = async () => {
            try {
                const res = await api.get(`/ClinicManagement/internal-stats?timeframe=${filterPeriod}`);
                setStatsData(res.data);
            } catch (err) {
                console.error("Erreur de récupération des statistiques internes", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInternalStats();
    }, [filterPeriod]);

    const performanceLineData = {
        labels: statsData?.performanceChart?.labels || ['Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
        datasets: [{
            label: 'Indice de Contrôle Global (%)',
            data: statsData?.performanceChart?.data || [76, 78, 81, 83, 84, 86],
            borderColor: '#088395',
            backgroundColor: 'rgba(8, 131, 149, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 4,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#088395'
        }]
    };

    const glycemiaRadarData = {
        labels: statsData?.radarChart?.labels || ['Stabilité', 'Réactivité', 'Suivi', 'Doses', 'Glycémie Moy.'],
        datasets: [{
            label: 'Performance Clinique',
            data: statsData?.radarChart?.data || [85, 88, 85, 90, 95],
            backgroundColor: 'rgba(8, 131, 149, 0.2)',
            borderColor: '#088395',
            borderWidth: 2,
            pointBackgroundColor: '#088395'
        }]
    };

    const doctorPatientsData = {
        labels: statsData?.doctorsChart?.labels || ['Médecin A', 'Médecin B'],
        datasets: [{
            label: 'Charge Patients',
            data: statsData?.doctorsChart?.data || [5, 3],
            backgroundColor: 'rgba(8, 131, 149, 0.8)',
            borderRadius: 12,
            hoverBackgroundColor: '#088395'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                cornerRadius: 12,
                titleFont: { size: 12, weight: 'bold' }
            }
        },
        scales: {
            y: { display: false },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10, weight: '800' } }
            }
        }
    };

    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 6.2 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={24} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Statistiques <span className="text-white/40">Internes</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Analyse approfondie de la performance et des soins</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                            {['7d', '30d', '90d'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilterPeriod(p)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filterPeriod === p ? "bg-white text-[#088395] shadow-xl" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {p === '7d' ? 'Semaine' : p === '30d' ? 'Mois' : 'Trimestre'}
                                </button>
                            ))}
                        </div>
                        <button className="p-5 bg-white backdrop-blur-3xl text-[#088395] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* Top Detail Cards SECTION 6.2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsDetailCard title="Score Performance" value={statsData?.scorePerformance || "84%"} sub={statsData?.subPerformance || "+5% vs mois dernier"} icon={<Target size={24} />} color="bg-success shadow-[0_10px_20px_rgba(52,199,89,0.3)]" />
                    <StatsDetailCard title="Taux d'Hypos" value={statsData?.tauxHypos || "12.4%"} sub={statsData?.subHypos || "-2.1% réduction"} icon={<Droplets size={24} />} color="bg-accent shadow-[0_10px_20px_rgba(255,112,67,0.3)]" />
                    <StatsDetailCard title="Taux d'Hypers" value={statsData?.tauxHypers || "28.6%"} sub={statsData?.subHypers || "+1.4% à surveiller"} icon={<Zap size={24} />} color="bg-[#1E88E5] shadow-[0_10px_20px_rgba(30,136,229,0.3)]" />
                    <StatsDetailCard title="Engagement Med." value={statsData?.engagement || "94%"} sub={statsData?.subEngagement || "Taux de réponse alertes"} icon={<Activity size={24} />} color="bg-purple-500 shadow-[0_10px_20px_rgba(168,85,247,0.3)]" />
                </div>

                {/* Main Dynamic Charts SECTION 6.2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Growth/Performance Line Chart */}
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden relative group">
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Indice de Contrôle Global</h3>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Évolution de la qualité des soins clinique</p>
                            </div>
                            <div className="px-5 py-2 bg-success/20 text-success rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp size={14} /> +3.5%
                            </div>
                        </div>
                        <div className="h-[350px] relative z-10">
                            <Line data={performanceLineData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, display: true, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
                        </div>
                        <div className="absolute top-0 right-0 p-10 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Target size={1.50} />
                        </div>
                    </div>

                    {/* Radar Analysis */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl flex flex-col items-center">
                        <div className="w-full text-left mb-10">
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Qualité de Suivi</h3>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Analyse multidimensionnelle</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <Radar data={glycemiaRadarData} options={{
                                ...chartOptions,
                                scales: {
                                    r: {
                                        grid: { color: 'rgba(255,255,255,0.05)' },
                                        angleLines: { color: 'rgba(255,255,255,0.05)' },
                                        pointLabels: { color: 'rgba(255,255,255,0.4)', font: { size: 9, weight: 'black' } },
                                        ticks: { display: false }
                                    }
                                }
                            }} />
                        </div>
                    </div>
                </div>

                {/* Bottom Charts Section SECTION 6.2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bar Chart Charge Doctors */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Patients par Médecin</h3>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Répartition de la charge de travail</p>
                            </div>
                            <Stethoscope size={24} className="text-[#088395]" />
                        </div>
                        <div className="h-[280px] relative z-10">
                            <Bar data={doctorPatientsData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Quick Insight Panel */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-[#088395] rounded-[32px] p-8 flex flex-col justify-between shadow-2xl group hover:scale-[1.02] transition-all">
                            <Users size={32} className="mb-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Groupe le plus stable</div>
                                <div className="text-3xl font-black italic tracking-tight">{statsData?.insights?.stableGroup || "Tranche 8-12 ans"}</div>
                                <div className="mt-4 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest opacity-60">
                                    Voir détails segment <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 flex flex-col justify-between group hover:border-[#088395] transition-all">
                            <Activity size={32} className="mb-8 text-[#088395]" />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-white/30">Pic d'alertes critique</div>
                                <div className="text-4xl font-black italic tracking-tighter text-white">{statsData?.insights?.peakAlerts || "18h - 20h"}</div>
                                <div className="mt-4 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-[#088395]">
                                    Analyse temporelle <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
