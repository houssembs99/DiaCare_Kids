"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import {
    ShieldCheck, Building2, CreditCard, Activity, Server, Lock,
    Zap, Clock, ArrowRight, Globe, Settings, Database, Sparkles, TrendingUp, Users,
    ChevronRight, BarChart3, Bell, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        doctorsCount: 128,
        parentsCount: 1540,
        patientsCount: 524,
        clinicsCount: 12,
        revenue: "15.2k",
        activeSubs: 84
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/stats/summary');
                if (res.data) setStats(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error("Error fetching stats", err);
            }
        };
        fetchStats();
    }, []);

    // Line Chart Data
    const lineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Abonnements',
            data: [30, 45, 57, 75, 84, 95],
            fill: false,
            borderColor: '#1E88E5',
            tension: 0.4,
            pointBackgroundColor: '#1E88E5',
        }]
    };

    // Bar Chart Data
    const barData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Revenus ($)',
            data: [12000, 19000, 15000, 22000, 24000, 28000],
            backgroundColor: '#FF7043',
            borderRadius: 8,
        }]
    };

    // Pie Chart Data
    const pieData = {
        labels: ['Admins', 'Cliniques', 'Médecins', 'Parents'],
        datasets: [{
            data: [5, 12, 128, 1540],
            backgroundColor: ['#1E88E5', '#26A69A', '#FFCA28', '#FF7043'],
            borderWidth: 0,
        }]
    };

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                                Global Control
                            </div>
                            <div className="flex items-center gap-2 text-success group">
                                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Système Optimal</span>
                            </div>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none">
                            Tableau de <span className="text-white/40 italic">Bord</span>
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 flex items-center gap-6 group hover:border-white/30 transition-all">
                            <div className="w-12 h-12 bg-[#1E88E5] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Server size={24} />
                            </div>
                            <div>
                                <div className="text-xl font-black">99.9%</div>
                                <div className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em]">Uptime Moyen</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards Grid - 3 Columns as per spec SECTION 3.1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AdminStatCard title="Cliniques" value={stats.clinicsCount} icon={<Building2 />} tendency="+2" />
                    <AdminStatCard title="Médecins" value={stats.doctorsCount} icon={<Users />} tendency="+12" />
                    <AdminStatCard title="Patients" value={stats.patientsCount} icon={<Globe />} tendency="+45" />
                    <AdminStatCard title="Revenus Mensuels" value={`$${stats.revenue}`} icon={<CreditCard />} tendency="+3.4%" isCurrency />
                    <AdminStatCard title="Abonnements Actifs" value={stats.activeSubs} icon={<Zap />} tendency="+8" />
                    <AdminStatCard title="Alertes Critiques" value="0" icon={<Activity />} tendency="Safe" isAlert />
                </div>

                {/* Charts Area - SECTION 3.2 */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black uppercase tracking-tighter">Évolution Abonnements</h3>
                                <div className="flex gap-2">
                                    <ChartFilter label="7j" />
                                    <ChartFilter label="30j" active />
                                    <ChartFilter label="1an" />
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } }, x: { grid: { display: false } } } }} />
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10">
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-10">Revenus Mensuels</h3>
                            <div className="h-[300px]">
                                <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } }, x: { grid: { display: false } } } }} />
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-4 space-y-10">
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10 flex flex-col items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-10 w-full">Répartition</h3>
                            <div className="w-full max-w-[250px]">
                                <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { color: 'white', font: { size: 10, weight: 'bold' }, padding: 20 } } } }} />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0] rounded-[32px] p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:scale-110 transition-transform duration-1000"><Database size={100} /></div>
                            <div className="relative z-10 space-y-6">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30"><ShieldCheck size={28} /></div>
                                <h4 className="text-xl font-black uppercase tracking-tighter italic leading-none">Sécurité Système</h4>
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-relaxed">Dernière sauvegarde effectuée il y a 2 heures.</p>
                                <button className="w-full py-4 bg-white text-[#1E88E5] font-extrabold rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform">Audit Complet</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity - SECTION 3.3 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden">
                    <div className="p-10 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic">Activité <span className="text-white/40">Récente</span></h3>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1E88E5] hover:gap-4 transition-all">Voir Tout <ArrowRight size={14} /></button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                                <tr>
                                    <th className="px-10 py-6">Date</th>
                                    <th className="px-10 py-6">Action</th>
                                    <th className="px-10 py-6">Utilisateur</th>
                                    <th className="px-10 py-6">Type</th>
                                    <th className="px-10 py-6">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-bold">
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

const AdminStatCard = ({ title, value, icon, tendency, isCurrency, isAlert }) => (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10 group hover:border-white/30 transition-all relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:scale-110 transition-transform duration-700">{icon}</div>
        <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-white/10 transition-all group-hover:rotate-12 group-hover:bg-white/10",
            isAlert ? "text-accent" : "text-[#1E88E5]"
        )}>
            {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
        </div>
        <div className="space-y-1">
            <div className="text-5xl font-black tracking-tighter leading-none">{isCurrency ? value : value}</div>
            <div className="flex justify-between items-center pt-2">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{title}</div>
                <span className={cn(
                    "text-[10px] font-black",
                    isAlert ? "text-success" : tendency.includes('+') ? "text-success" : "text-white/40"
                )}>{tendency}</span>
            </div>
        </div>
    </div>
);

const ChartFilter = ({ label, active }) => (
    <button className={cn(
        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
        active ? "bg-[#1E88E5] border-transparent shadow-lg shadow-blue-500/20" : "bg-white/5 border-white/10 hover:bg-white/10"
    )}>
        {label}
    </button>
);

const ActivityRow = ({ date, action, user, type, status, color }) => (
    <tr className="hover:bg-white/5 transition-colors group">
        <td className="px-10 py-6 text-xs text-white/40">{date}</td>
        <td className="px-10 py-6 uppercase tracking-tighter text-sm">{action}</td>
        <td className="px-10 py-6 text-xs">{user}</td>
        <td className="px-10 py-6">
            <span className="text-[9px] px-3 py-1 bg-white/5 rounded-full uppercase tracking-widest">{type}</span>
        </td>
        <td className="px-10 py-6">
            <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('text-', 'bg-'))} />
                <span className={cn("text-[10px] uppercase tracking-widest", color)}>{status}</span>
            </div>
        </td>
    </tr>
);
