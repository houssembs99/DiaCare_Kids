"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Users, Baby, AlertTriangle, Activity,
    TrendingUp, ArrowRight, ShieldAlert,
    Clock, CheckCircle2, Droplets, Zap,
    Stethoscope
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import api from '@/lib/api';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
);

const DoctorStatCard = ({ title, value, icon, color, tendency }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 group hover:border-white/30 transition-all shadow-2xl relative overflow-hidden"
    >
        <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-all", color)} />
        <div className="flex justify-between items-start mb-6">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white", color)}>
                {icon}
            </div>
            {tendency && (
                <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white/40 uppercase tracking-widest">
                    <TrendingUp size={12} className="text-success" /> {tendency}
                </div>
            )}
        </div>
        <div className="space-y-1">
            <div className="text-4xl font-black italic tracking-tighter text-white uppercase">{value}</div>
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{title}</div>
        </div>
    </motion.div>
);

export default function DoctorDashboard() {
    const [filter, setFilter] = useState('7d');
    const [stats, setStats] = useState({ totalPatients: 0, stables: 0, alerts: 0, hypo: 0, hyper: 0, list: [] });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctor-management/patients');
            const patients = res.data;
            
            let total = patients.length;
            let hypo = 0;
            let hyper = 0;
            let stables = 0;
            let alertsList = [];
            
            patients.forEach(p => {
                if (p.lastGlucose) {
                    if (p.lastGlucose < 70) {
                        hypo++;
                        alertsList.push({ name: p.fullName || 'Inconnu', time: 'Récemment', value: p.lastGlucose + ' mg/dL' });
                    } else if (p.lastGlucose > 140) {
                        hyper++;
                        if (p.lastGlucose > 200) {
                             alertsList.push({ name: p.fullName || 'Inconnu', time: 'Récemment', value: p.lastGlucose + ' mg/dL' });
                        }
                    } else {
                        stables++;
                    }
                } else {
                    stables++; // default si pas de mesure
                }
            });

            setStats({
                totalPatients: total,
                stables: stables,
                alerts: alertsList.length,
                hypo: hypo,
                hyper: hyper,
                list: alertsList.slice(0, 4) // top 4 max
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStats();
    }, []);

    const chartData = {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
            label: 'Moyenne Glycémique (mg/dL)',
            data: [145, 138, 152, 148, 142, 135, 140],
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
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10, weight: 'bold' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10, weight: 'bold' } }
            }
        }
    };

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 3.2 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Stethoscope size={28} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Medical <span className="text-white/40">Center</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Surveillance et optimisation des soins pédiatriques</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-3xl border border-white/10 backdrop-blur-xl">
                        {['7d', '30d', '3m'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === f ? "bg-white text-[#088395] shadow-xl" : "text-white/40 hover:text-white"
                                )}
                            >
                                {f === '7d' ? '7 Jours' : f === '30d' ? '30 Jours' : '3 Mois'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stat Cards SECTION 3.2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <DoctorStatCard title="Total Patients" value={loading ? "..." : stats.totalPatients.toString().padStart(2, '0')} icon={<Baby size={24} />} color="bg-[#1E88E5]" tendency={stats.totalPatients > 0 ? `+${stats.totalPatients}` : "0"} />
                    <DoctorStatCard title="Héros Stables" value={loading ? "..." : stats.stables.toString().padStart(2, '0')} icon={<CheckCircle2 size={24} />} color="bg-success" tendency={stats.stables > 0 ? "Optimal" : "-"} />
                    <DoctorStatCard title="Alertes Critiques" value={loading ? "..." : stats.alerts.toString().padStart(2, '0')} icon={<ShieldAlert size={24} />} color="bg-accent shadow-[0_10px_30px_rgba(255,112,67,0.3)]" />
                    <DoctorStatCard title="En Hypoglycémie" value={loading ? "..." : stats.hypo.toString().padStart(2, '0')} icon={<Droplets size={24} />} color="bg-orange-500" />
                    <DoctorStatCard title="En Hyperglycémie" value={loading ? "..." : stats.hyper.toString().padStart(2, '0')} icon={<Zap size={24} />} color="bg-yellow-500" />
                </div>

                {/* Priority List & Chart SECTION 3.2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Urgencies List */}
                    <div className="bg-accent/10 border-2 border-accent/20 rounded-[40px] p-10 flex flex-col shadow-[0_20px_50px_rgba(255,112,67,0.1)] relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 opacity-5 rotate-12">
                            <AlertTriangle size={300} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic">Liste Prioritaire</h3>
                                <div className="px-3 py-1 bg-accent text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Action Requise</div>
                            </div>

                            <div className="flex-1 space-y-4">
                                {stats.list.map((alert, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center font-black">
                                                {alert.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase tracking-tighter">{alert.name}</span>
                                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{alert.time}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm font-black italic text-accent">{alert.value}</div>
                                            <Link href="/doctor/alerts" className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/doctor/alerts" className="w-full mt-8 py-5 border border-accent/30 rounded-2xl text-accent text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all text-center inline-block">
                                Voir toutes les alertes
                            </Link>
                        </div>
                    </div>

                    {/* Evolution Chart */}
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden relative group">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none mb-1">Évolution Patientèle</h3>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Moyenne glycémique combinée (mg/dL)</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[#088395]">
                                <Activity size={24} />
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
