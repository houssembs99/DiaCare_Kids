"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Users, Baby, AlertTriangle, Activity,
    TrendingUp, ArrowRight, ShieldAlert,
    Clock, CheckCircle2, Droplets, Zap,
    Stethoscope, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import api from '@/lib/api';
import Link from 'next/link';

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

// Helper: get date threshold based on filter
function getDateThreshold(filter) {
    const now = new Date();
    if (filter === '7d') {
        now.setDate(now.getDate() - 7);
    } else if (filter === '30d') {
        now.setDate(now.getDate() - 30);
    } else if (filter === '3m') {
        now.setMonth(now.getMonth() - 3);
    }
    return now;
}

// Helper: format timestamp to readable relative time
function formatRelativeTime(dateStr) {
    if (!dateStr) return 'Récemment';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Récemment';
    const now = new Date();
    const diffMs = now - date;
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffD = Math.floor(diffH / 24);
    if (diffH < 1) return 'Il y a < 1h';
    if (diffH < 24) return `Il y a ${diffH}h`;
    if (diffD === 1) return 'Hier';
    return `Il y a ${diffD}j`;
}

// Helper: get date from a record (field is 'timestamp' in MedicalRecord model)
function getRecordDate(r) {
    // C# model uses 'Timestamp' → serialized as 'timestamp' in camelCase JSON
    return r.timestamp || r.recordedAt || r.createdAt || null;
}

// Helper: build chart labels & data from filter
function buildChartData(allRecords, filter) {
    const now = new Date();
    let labels = [];
    let buckets = [];

    if (filter === '7d') {
        const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            labels.push(days[d.getDay() === 0 ? 6 : d.getDay() - 1]);
            buckets.push(d.toDateString());
        }
        const grouped = {};
        buckets.forEach(b => (grouped[b] = []));
        allRecords.forEach(r => {
            const dateStr = getRecordDate(r);
            if (!dateStr) return;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return;
            const key = d.toDateString();
            if (grouped[key] !== undefined && r.glucoseValue != null) {
                grouped[key].push(r.glucoseValue);
            }
        });
        const data = buckets.map(b => {
            const vals = grouped[b];
            if (!vals || vals.length === 0) return null;
            const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
            return Math.round(avg * 100) / 100;
        });
        return { labels, data };
    }

    if (filter === '30d') {
        for (let i = 3; i >= 0; i--) {
            labels.push(`S-${i === 0 ? 'Act' : i}`);
        }
        const data = labels.map((_, idx) => {
            const weeksBack = labels.length - 1 - idx;
            const start = new Date(now);
            start.setDate(start.getDate() - weeksBack * 7 - 7);
            const end = new Date(now);
            end.setDate(end.getDate() - weeksBack * 7);
            const vals = allRecords
                .filter(r => {
                    const dateStr = getRecordDate(r);
                    if (!dateStr) return false;
                    const d = new Date(dateStr);
                    return !isNaN(d.getTime()) && d >= start && d <= end && r.glucoseValue != null;
                })
                .map(r => r.glucoseValue);
            if (!vals.length) return null;
            const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
            return Math.round(avg * 100) / 100;
        });
        return { labels, data };
    }

    // 3m: group by month
    for (let i = 2; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        labels.push(d.toLocaleString('fr-FR', { month: 'short' }));
    }
    const data = labels.map((_, idx) => {
        const weeksBack = labels.length - 1 - idx;
        const targetDate = new Date(now);
        targetDate.setMonth(targetDate.getMonth() - weeksBack);
        const targetMonth = targetDate.getMonth();
        const targetYear = targetDate.getFullYear();
        const vals = allRecords.filter(r => {
            const dateStr = getRecordDate(r);
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return !isNaN(d.getTime()) && d.getMonth() === targetMonth && d.getFullYear() === targetYear && r.glucoseValue != null;
        }).map(r => r.glucoseValue);
        if (!vals.length) return null;
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
        return Math.round(avg * 100) / 100;
    });
    return { labels, data };
}

export default function DoctorDashboard() {
    const [filter, setFilter] = useState('7d');
    const [stats, setStats] = useState({ totalPatients: 0, stables: 0, alerts: 0, hypo: 0, hyper: 0, list: [] });
    const [chartInfo, setChartInfo] = useState({ labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], data: [null, null, null, null, null, null, null] });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctor-management/patients');
            const patients = res.data;
            const threshold = getDateThreshold(filter);

            let total = patients.length;
            let hypo = 0;
            let hyper = 0;
            let stables = 0;
            let alertsList = [];
            let allRecordsForChart = [];

            for (const p of patients) {
                // Fetch records for this patient to filter by date
                let records = [];
                try {
                    const recRes = await api.get(`/medicalrecords/patient/${p.id}`);
                    records = recRes.data || [];
                } catch (_) {
                    // No records
                }

                // Collect for chart (all records, buildChartData will filter by date)
                allRecordsForChart.push(...records);

                // Filter records in the selected time window using correct 'timestamp' field
                const periodRecords = records.filter(r => {
                    const dateStr = getRecordDate(r);
                    if (!dateStr) return false;
                    const d = new Date(dateStr);
                    return !isNaN(d.getTime()) && d >= threshold;
                });

                // Determine patient status from latest record within period (or overall lastGlucose)
                const lastRecord = periodRecords.length > 0 ? periodRecords[0] : null;
                const glucose = lastRecord?.glucoseValue ?? p.lastGlucose ?? null;

                if (glucose != null) {
                    // Values in g/L (< 10 means g/L scale, > 10 means mg/dL → convert)
                    const glucoseGL = glucose < 10 ? glucose : glucose / 100;

                    if (glucoseGL < 0.70) {
                        hypo++;
                        alertsList.push({
                            id: p.id,
                            name: p.fullName || 'Inconnu',
                            time: formatRelativeTime(getRecordDate(lastRecord)),
                            value: glucoseGL.toFixed(2) + ' g/L',
                            type: 'hypo'
                        });
                    } else if (glucoseGL > 1.40) {
                        hyper++;
                        alertsList.push({
                            id: p.id,
                            name: p.fullName || 'Inconnu',
                            time: formatRelativeTime(getRecordDate(lastRecord)),
                            value: glucoseGL.toFixed(2) + ' g/L',
                            type: 'hyper'
                        });
                    } else {
                        stables++;
                    }
                } else {
                    stables++;
                }
            }

            // Build chart with actual records
            const { labels, data } = buildChartData(allRecordsForChart, filter);
            setChartInfo({ labels, data });

            setStats({
                totalPatients: total,
                stables,
                alerts: alertsList.length,
                hypo,
                hyper,
                list: alertsList.slice(0, 4)
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const chartData = {
        labels: chartInfo.labels,
        datasets: [{
            label: 'Moyenne Glycémique (g/L)',
            data: chartInfo.data,
            borderColor: '#088395',
            backgroundColor: 'rgba(8, 131, 149, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 4,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#088395',
            pointBorderWidth: 2,
            spanGaps: true
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
                titleFont: { size: 12, weight: 'bold' },
                callbacks: {
                    label: (ctx) => ctx.raw != null ? `${ctx.raw.toFixed(2)} g/L` : 'Aucune donnée'
                }
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                    color: 'rgba(255,255,255,0.3)',
                    font: { size: 10, weight: 'bold' },
                    callback: (v) => `${v.toFixed(2)} g/L`
                },
                min: 0,
                suggestedMax: 2.5
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

                {/* Header */}
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

                    {/* Filter buttons – now trigger data reload */}
                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-3xl border border-white/10 backdrop-blur-xl">
                        {[
                            { key: '7d', label: '7 Jours' },
                            { key: '30d', label: '30 Jours' },
                            { key: '3m', label: '3 Mois' }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                disabled={loading}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === key
                                        ? "bg-white text-[#088395] shadow-xl"
                                        : "text-white/40 hover:text-white disabled:opacity-50"
                                )}
                            >
                                {loading && filter === key ? '...' : label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <DoctorStatCard title="Total Patients" value={loading ? "..." : stats.totalPatients.toString().padStart(2, '0')} icon={<Baby size={24} />} color="bg-[#1E88E5]" tendency={stats.totalPatients > 0 ? `+${stats.totalPatients}` : "0"} />
                    <DoctorStatCard title="Héros Stables" value={loading ? "..." : stats.stables.toString().padStart(2, '0')} icon={<CheckCircle2 size={24} />} color="bg-success" tendency={stats.stables > 0 ? "Optimal" : "-"} />
                    <DoctorStatCard title="Alertes Critiques" value={loading ? "..." : stats.alerts.toString().padStart(2, '0')} icon={<ShieldAlert size={24} />} color="bg-accent shadow-[0_10px_30px_rgba(255,112,67,0.3)]" />
                    <DoctorStatCard title="En Hypoglycémie" value={loading ? "..." : stats.hypo.toString().padStart(2, '0')} icon={<Droplets size={24} />} color="bg-orange-500" />
                    <DoctorStatCard title="En Hyperglycémie" value={loading ? "..." : stats.hyper.toString().padStart(2, '0')} icon={<Zap size={24} />} color="bg-yellow-500" />
                </div>

                {/* Priority List & Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Priority List */}
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
                                {loading ? (
                                    <div className="flex flex-col gap-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-16 bg-white/5 rounded-3xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : stats.list.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-10 gap-4 text-center">
                                        <div className="w-16 h-16 bg-success/10 border border-success/20 rounded-2xl flex items-center justify-center">
                                            <CheckCircle2 size={28} className="text-success" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white/60 uppercase tracking-tight">Aucune alerte</p>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Tous les patients sont stables</p>
                                        </div>
                                    </div>
                                ) : (
                                    stats.list.map((alert, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-white",
                                                    alert.type === 'hypo' ? 'bg-orange-500' : 'bg-accent'
                                                )}>
                                                    {alert.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase tracking-tighter">{alert.name}</span>
                                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{alert.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "text-sm font-black italic",
                                                    alert.type === 'hypo' ? 'text-orange-400' : 'text-accent'
                                                )}>
                                                    {alert.value}
                                                </div>
                                                <Link href={`/doctor/patients/${alert.id}`} className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Moyenne glycémique combinée (g/L)</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[#088395]">
                                <Activity size={24} />
                            </div>
                        </div>
                        <div className="h-[350px]">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-[#088395]/30 border-t-[#088395] rounded-full animate-spin" />
                                </div>
                            ) : (
                                <Line data={chartData} options={chartOptions} />
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
