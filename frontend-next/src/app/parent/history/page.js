"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Activity, Calendar, Filter, ArrowUpRight,
    ArrowDownRight, Circle, Clock, Syringe,
    ChevronLeft, ChevronRight, FileText, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
);

const SectionHeader = ({ title, sub }) => (
    <div className="mb-6">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/30 mb-1">{title}</h3>
        <p className="text-[10px] font-bold text-[#088395] uppercase tracking-widest">{sub}</p>
    </div>
);

export default function HistoryPage() {
    const [period, setPeriod] = useState('7d');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        chart: null,
        history: [],
        average: 142
    });

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            generateData(period);
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [period]);

    const generateData = (p) => {
        let labels, values, history;
        
        if (p === '7d') {
            labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            values = [110, 145, 185, 130, 95, 120, 1.40];
            history = [
                { id: 1, time: '08:30', val: 110, status: 'stable', note: 'Petit déjeuner', insulin: '4u' },
                { id: 2, time: '12:45', val: 145, status: 'stable', note: 'Déjeuner', insulin: '6u' },
                { id: 3, time: '19:15', val: 185, status: 'hyper', note: 'Diner copieux', insulin: '8u' }
            ];
        } else if (p === '30d') {
            labels = ['S1', 'S2', 'S3', 'S4'];
            values = [135, 128, 142, 118];
            history = [
                { id: 10, time: 'Hier', val: 122, status: 'stable', note: 'Moyenne journée', insulin: '18u' },
                { id: 11, time: '3 Jours', val: 158, status: 'hyper', note: 'Moyenne journée', insulin: '22u' },
                { id: 12, time: '6 Jours', val: 105, status: 'stable', note: 'Moyenne journée', insulin: '15u' }
            ];
        } else {
            labels = ['Jan', 'Fév', 'Mar'];
            values = [145, 138, 115];
            history = [
                { id: 20, time: 'Mars', val: 115, status: 'stable', note: 'Moyenne Mensuelle', insulin: '450u' },
                { id: 21, time: 'Février', val: 138, status: 'stable', note: 'Moyenne Mensuelle', insulin: '480u' },
                { id: 22, time: 'Janvier', val: 145, status: 'stable', note: 'Moyenne Mensuelle', insulin: '510u' }
            ];
        }

        setData({
            average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
            chart: {
                labels,
                datasets: [{
                    label: 'Glycémie',
                    data: values,
                    borderColor: '#088395',
                    backgroundColor: 'rgba(8, 131, 149, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 4,
                    pointRadius: 6,
                    pointBackgroundColor: '#fff'
                }]
            },
            history
        });
    };

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-10 pb-32 text-white max-w-lg mx-auto">

                {/* Header SECTION 6.1 */}
                <div className="flex justify-between items-center pt-4">
                    <h1 className="text-3xl font-black tracking-tight leading-none italic uppercase">
                        Historique <span className="text-white/40">Soin</span>
                    </h1>
                    <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-[#088395] transition-all" onClick={() => window.print()}>
                        <FileText size={20} />
                    </button>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 p-2 bg-white/5 rounded-[24px] border border-white/10 backdrop-blur-xl">
                    {['7d', '30d', '90d'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                                period === p ? "bg-[#088395] text-white shadow-xl" : "text-white/40 hover:text-white"
                            )}
                        >
                            {p === '7d' ? '7 Jours' : p === '30d' ? '1 Mois' : '3 Mois'}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {loading || !data.chart ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="h-[40vh] flex flex-col items-center justify-center gap-4"
                        >
                            <Loader2 className="animate-spin text-[#088395]" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Chargement des données...</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="content"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="space-y-10"
                        >
                            {/* Interactive Chart SECTION 6.1 */}
                            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden relative">
                                <div className="flex justify-between items-start mb-10">
                                    <SectionHeader 
                                        title={period === '7d' ? "Évolution Hebdo" : (period === '30d' ? "Tendance Mensuelle" : "Suivi Trimestriel")} 
                                        sub="Graphique des tendances" 
                                    />
                                    <div className="flex flex-col items-end">
                                        <span className="text-3xl font-black italic">{data.average}</span>
                                        <span className="text-[10px] font-bold opacity-20 uppercase">Moyenne</span>
                                    </div>
                                </div>
                                <div className="h-[250px]">
                                    <Line
                                        data={data.chart}
                                        options={{
                                            responsive: true, maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { display: false } },
                                                x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 9, weight: 'bold' } } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Detailed List SECTION 6.2 */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pl-4">
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/30">Journal {period === '7d' ? 'des relevés' : 'étendu'}</h3>
                                    <button className="flex items-center gap-2 text-[10px] font-black text-[#088395] uppercase tracking-widest">
                                        Tout voir <ChevronRight size={14} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {data.history.map((item, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={item.id}
                                            className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between group hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center min-w-[50px]">
                                                    <span className="text-xs font-black italic">{item.time}</span>
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full mt-2",
                                                        item.status === 'hypo' ? "bg-accent" : item.status === 'hyper' ? "bg-orange-500" : "bg-green-500"
                                                    )} />
                                                </div>
                                                <div className="h-10 w-[1px] bg-white/10" />
                                                <div>
                                                    <div className="text-2xl font-black italic leading-none mb-1">{item.val} <span className="text-[10px] opacity-20 not-italic">g/L</span></div>
                                                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">{item.note}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#088395]">
                                                        <Syringe size={12} /> {item.insulin}
                                                    </div>
                                                </div>
                                                <button className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-all">
                                                    <FileText size={14} className="text-white/20" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Export Button */}
                <button className="w-full py-5 bg-[#088395]/10 border border-[#088395]/20 text-[#088395] rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-[#088395] hover:text-white transition-all shadow-xl active:scale-95" onClick={() => window.print()}>
                    Exporter en PDF pour le médecin
                </button>

            </div>
        </DashboardLayout>
    );
}
