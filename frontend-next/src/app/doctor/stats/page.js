"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BarChart3, Activity, PieChart, TrendingUp,
    Calendar, Users, Baby, Target,
    Zap, Droplets, Filter, Download,
    ShieldAlert, CheckCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
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

const MedicalStatCard = ({ title, value, sub, icon, color }) => (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-4 hover:border-white/30 transition-all group relative overflow-hidden">
        <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity", color)} />
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white", color)}>
            {icon}
        </div>
        <div>
            <div className="text-3xl font-black italic tracking-tighter leading-none mb-2 text-white">{value}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{title}</div>
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-2">{sub}</div>
        </div>
    </div>
);

export default function DoctorStats() {
    const [period, setPeriod] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPatients: 28,
        stablePercent: 65,
        avgGlucose: 1.24,
        hyposRate: 8.2,
        hypersRate: 22.5,
        score: 92
    });

    const [chartData, setChartData] = useState({
        avgGlucose: null,
        distribution: null,
        incidents: null,
        therapeutic: null
    });

    useEffect(() => {
        setLoading(true);
        // Simulate real data fetching with variations based on period
        const timer = setTimeout(() => {
            generateData(period);
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [period]);

    const generateData = (p) => {
        let labels, lineData, barHypers, barHypos;

        if (p === '7d') {
            labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            lineData = [1.18, 1.25, 1.10, 1.30, 1.15, 1.22, 1.14];
            barHypers = [10, 8, 12, 15, 9, 7, 11];
            barHypos = [3, 2, 4, 6, 2, 3, 4];
        } else if (p === '30d') {
            labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
            lineData = [1.35, 1.42, 1.28, 1.22];
            barHypers = [45, 52, 40, 38];
            barHypos = [15, 18, 12, 10];
        } else {
            labels = ['Jan', 'Féb', 'Mar'];
            lineData = [1.40, 1.32, 1.24];
            barHypers = [150, 140, 120];
            barHypos = [50, 45, 38];
        }

        setChartData({
            avgGlucose: {
                labels,
                datasets: [{
                    label: 'Moyenne Glycémique (g/L)',
                    data: lineData,
                    borderColor: '#088395',
                    backgroundColor: 'rgba(8, 131, 149, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 4,
                    pointRadius: 4,
                }]
            },
            distribution: {
                labels: ['Stables', 'Surveillance', 'Critiques'],
                datasets: [{
                    data: p === '7d' ? [75, 20, 5] : (p === '30d' ? [65, 25, 10] : [60, 30, 10]),
                    backgroundColor: ['#34C759', '#FF7043', '#1E88E5'],
                    borderWidth: 0,
                }]
            },
            incidents: {
                labels,
                datasets: [
                    { label: 'Hyperglycémies', data: barHypers, backgroundColor: '#EAB308', borderRadius: 8 },
                    { label: 'Hypoglycémies', data: barHypos, backgroundColor: '#F97316', borderRadius: 8 }
                ]
            },
            therapeutic: {
                labels: ['Contrôle', 'Régularité', 'Alertes', 'Doses', 'Glycémie'],
                datasets: [
                    { label: '0-5 ans', data: [80, 70, 90, 85, 75], borderColor: '#088395', backgroundColor: 'rgba(8,131,149,0.1)', borderWidth: 3 },
                    { label: '6-12 ans', data: [90, 85, 80, 90, 95], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', borderWidth: 3 }
                ]
            }
        });
    };

    const chartsDefaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0b1b2b',
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 11 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9, weight: 'bold' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9, weight: 'bold' } }
            }
        }
    };

    const glucoseChartOptions = {
        ...chartsDefaultOptions,
        scales: {
            ...chartsDefaultOptions.scales,
            y: {
                ...chartsDefaultOptions.scales.y,
                min: 0.5,
                max: 2.0,
                ticks: {
                    ...chartsDefaultOptions.scales.y.ticks,
                    callback: (value) => value.toFixed(2) + ' g/L',
                    stepSize: 0.25
                }
            }
        },
        plugins: {
            ...chartsDefaultOptions.plugins,
            tooltip: {
                ...chartsDefaultOptions.plugins.tooltip,
                callbacks: {
                    label: (ctx) => `Moyenne: ${ctx.parsed.y.toFixed(2)} g/L`
                }
            }
        }
    };

    const incidentsChartOptions = {
        ...chartsDefaultOptions,
        plugins: {
            ...chartsDefaultOptions.plugins,
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    color: 'rgba(255,255,255,0.5)',
                    font: { size: 9, weight: 'bold' },
                    boxWidth: 12,
                    boxHeight: 12,
                    borderRadius: 4,
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'rectRounded'
                }
            },
            tooltip: {
                ...chartsDefaultOptions.plugins.tooltip,
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} cas`
                }
            }
        },
        scales: {
            ...chartsDefaultOptions.scales,
            y: {
                ...chartsDefaultOptions.scales.y,
                beginAtZero: true,
                ticks: {
                    ...chartsDefaultOptions.scales.y.ticks,
                    callback: (value) => Number.isInteger(value) ? value + ' cas' : ''
                }
            }
        }
    };

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-20 text-white">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(8,131,149,0.3)]">
                                <BarChart3 size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                    Analyse <span className="text-white/40">Médicale</span>
                                </h1>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-2">Suivi épidémiologique et performance clinique</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-1 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                            {['7d', '30d', '3m'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        period === p ? "bg-[#088395] text-white shadow-lg" : "text-white/30 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {p === '7d' ? '7 Jours' : p === '30d' ? '30 Jours' : '3 Mois'}
                                </button>
                            ))}
                        </div>
                        <button className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all group" onClick={() => window.print()}>
                            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading || !chartData.avgGlucose ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="h-[60vh] flex flex-col items-center justify-center gap-4"
                        >
                            <div className="w-12 h-12 border-4 border-[#088395] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Analyse des données pour {period === '7d' ? 'la semaine' : period === '30d' ? 'le mois' : 'le trimestre'}...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            {/* Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <MedicalStatCard title="Indice de Contrôle" value={period === '7d' ? "94/100" : "92/100"} sub="" icon={<Target size={24} />} color="bg-green-500 shadow-[0_10px_25px_rgba(34,197,94,0.3)]" />
                                <MedicalStatCard title="Taux d'Hypos" value={period === '7d' ? "6.8%" : "8.2%"} sub="" icon={<Droplets size={24} />} color="bg-orange-500 shadow-[0_10px_25px_rgba(249,115,22,0.3)]" />
                                <MedicalStatCard title="Taux d'Hypers" value={period === '7d' ? "18.5%" : "22.5%"} sub="" icon={<Zap size={24} />} color="bg-yellow-500 shadow-[0_10px_25px_rgba(234,179,8,0.3)]" />
                                <MedicalStatCard title="Score Engagement" value="88%" sub="" icon={<Activity size={24} />} color="bg-indigo-500 shadow-[0_10px_25_rgba(99,102,241,0.3)]" />
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Main Trend Chart */}
                                <div className="lg:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                                        <TrendingUp size={120} />
                                    </div>
                                    <div className="flex justify-between items-start mb-10 relative z-10">
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none mb-2">Moyenne Glycémique Globale</h3>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Variation moyenne de la cohorte patientèle</p>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            <TrendingUp size={14} /> +3.2% {period === '7d' ? 'Hebdomadaire' : 'Stabilité'}
                                        </div>
                                    </div>
                                    <div className="h-[350px] relative z-10">
                                        <Line data={chartData.avgGlucose} options={glucoseChartOptions} />
                                    </div>
                                </div>

                                {/* Distribution Chart */}
                                <div className="lg:col-span-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 lg:p-10 shadow-2xl flex flex-col">
                                    <div className="mb-10 text-center lg:text-left">
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">État Global</h3>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Répartition par seuil de vigilance</p>
                                    </div>
                                    <div className="flex-1 relative flex items-center justify-center">
                                        <div className="w-[220px] h-[220px]">
                                            <Doughnut data={chartData.distribution} options={{ cutout: '80%', plugins: { legend: { display: false } } }} />
                                        </div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black italic">28</span>
                                            <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em]">Héros</span>
                                        </div>
                                    </div>
                                    <div className="mt-10 space-y-3">
                                        {[
                                            { label: "Patients Stables", val: period === '7d' ? "75%" : "65%", col: "bg-green-500", icon: <CheckCircle size={12} /> },
                                            { label: "Sous Surveillance", val: period === '7d' ? "20%" : "25%", col: "bg-orange-500", icon: <Clock size={12} /> },
                                            { label: "Cas Critiques", val: "10%", col: "bg-indigo-500", icon: <ShieldAlert size={12} /> }
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between p-4 bg-white/3 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
                                                    <div className={cn("w-2 h-2 rounded-full", item.col)} />
                                                    <span className="text-white/60">{item.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black italic">{item.val}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 lg:p-10 shadow-2xl">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">Taux d'Incidents</h3>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{period === '7d' ? 'Comparaison par jour' : 'Comparaison hebdomadaire'}</p>
                                        </div>
                                    </div>
                                    <div className="h-[300px]">
                                        <Bar
                                            data={chartData.incidents}
                                            options={incidentsChartOptions}
                                        />
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 lg:p-10 shadow-2xl">
                                    <div className="text-center lg:text-left mb-10">
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">Efficacité Thérapeutique</h3>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Analyse multi-factorielle de la santé</p>
                                    </div>
                                    <div className="h-[300px]">
                                        <Radar
                                            data={chartData.therapeutic}
                                            options={{
                                                ...chartsDefaultOptions,
                                                scales: {
                                                    r: {
                                                        grid: { color: 'rgba(255,255,255,0.05)' },
                                                        angleLines: { color: 'rgba(255,255,255,0.05)' },
                                                        pointLabels: { color: 'rgba(255,255,255,0.4)', font: { size: 9, weight: 'black' } },
                                                        ticks: { display: false }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
