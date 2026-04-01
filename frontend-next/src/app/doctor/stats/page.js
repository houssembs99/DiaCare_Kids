"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BarChart3, Activity, PieChart, TrendingUp,
    Calendar, Users, Baby, Target,
    Zap, Droplets, Filter, Download
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

    const avgGlucoseData = {
        labels: [],
        datasets: [{
            label: 'Moyenne Glycémique',
            data: [],
            borderColor: '#088395',
            backgroundColor: 'rgba(8, 131, 149, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 4,
            pointRadius: 0
        }]
    };

    const statusDistributionData = {
        labels: ['Stables', 'Surveillance', 'Critiques'],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#34C759', '#FF7043', '#1E88E5'],
            borderWidth: 0,
            hoverOffset: 10
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
                cornerRadius: 12
            }
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10, weight: 'bold' } } },
            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10, weight: 'bold' } } }
        }
    };

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 8 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={28} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Analyse <span className="text-white/40">Médicale</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Indicateurs de performance clinique et statistiques patientèle</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                            {['7d', '30d', '90d'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        period === p ? "bg-white text-[#088395] shadow-xl" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {p === '7d' ? '7 Jours' : p === '30d' ? '30 Jours' : '3 Mois'}
                                </button>
                            ))}
                        </div>
                        <button className="p-5 bg-white backdrop-blur-3xl text-[#088395] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* Top Detail Cards SECTION 8 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MedicalStatCard title="Indice de Contrôle" value="92/100" sub="+4pts vs mois dernier" icon={<Target size={24} />} color="bg-success shadow-[0_10px_20px_rgba(52,199,89,0.3)]" />
                    <MedicalStatCard title="Taux d'Hypos" value="8.2%" sub="-1.4% baisse stable" icon={<Droplets size={24} />} color="bg-accent shadow-[0_10px_20px_rgba(255,112,67,0.3)]" />
                    <MedicalStatCard title="Taux d'Hypers" value="22.5%" sub="+0.8% légère hausse" icon={<Zap size={24} />} color="bg-yellow-500 shadow-[0_10px_20px_rgba(234,179,8,0.3)]" />
                    <MedicalStatCard title="Score Engagement" value="88%" sub="Observance protocoles" icon={<Activity size={24} />} color="bg-purple-500 shadow-[0_10px_20px_rgba(168,85,247,0.3)]" />
                </div>

                {/* Main Dynamic Charts SECTION 8 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Line Chart */}
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none mb-1">Moyenne Glycémique Globale</h3>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Évolution moyenne sur l'ensemble des patients</p>
                            </div>
                            <div className="px-5 py-2 bg-success/20 text-success rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp size={14} /> + 5.2% Contrôle
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <Line data={avgGlucoseData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Doughnut Distribution */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl flex flex-col">
                        <div className="mb-10">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-1">État de la Patientèle</h3>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Répartition par statut de contrôle</p>
                        </div>
                        <div className="flex-1 relative flex items-center justify-center">
                            <div className="w-[200px] h-[200px]">
                                <Doughnut data={statusDistributionData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black italic">28</span>
                                <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Héros</span>
                            </div>
                        </div>
                        <div className="mt-10 space-y-4">
                            {[
                                { label: "Stables", val: "65%", col: "bg-success" },
                                { label: "Surveillance", val: "25%", col: "bg-accent" },
                                { label: "Critiques", val: "10%", col: "bg-[#1E88E5]" }
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                        <div className={cn("w-2 h-2 rounded-full", item.col)} /> {item.label}
                                    </div>
                                    <span className="text-xs font-black italic">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Charts SECTION 8 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl">
                        <div className="flex flex-col mb-10">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-1">Taux d'Innocuité</h3>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Réduction des épisodes d'hypoglycémie/hyperglycémie</p>
                        </div>
                        <div className="h-[300px]">
                            <Bar
                                data={{
                                    labels: [],
                                    datasets: [
                                        { label: 'Hypos', data: [], backgroundColor: '#FF7043', borderRadius: 10 },
                                        { label: 'Hypers', data: [], backgroundColor: '#EAB308', borderRadius: 10 }
                                    ]
                                }}
                                options={chartOptions}
                            />
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl">
                        <div className="flex flex-col mb-10">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-1">Performance par Âge</h3>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Efficacité du traitement selon les segments</p>
                        </div>
                        <div className="h-[300px]">
                            <Radar
                                data={{
                                    labels: ['Contrôle', 'Régularité', 'Alertes', 'Doses', 'Glycémie'],
                                    datasets: [
                                        { label: '0-5 ans', data: [0, 0, 0, 0, 0], borderColor: '#088395', backgroundColor: 'rgba(8,131,149,0.1)' },
                                        { label: '6-12 ans', data: [0, 0, 0, 0, 0], borderColor: '#1E88E5', backgroundColor: 'rgba(30,136,229,0.1)' }
                                    ]
                                }}
                                options={{ ...chartOptions, scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, angleLines: { color: 'rgba(255,255,255,0.05)' }, pointLabels: { color: 'rgba(255,255,255,0.4)', font: { size: 9, weight: 'black' } }, ticks: { display: false } } } }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
