"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Activity, Calendar, Filter, ArrowUpRight,
    ArrowDownRight, Circle, Clock, Syringe,
    ChevronLeft, ChevronRight, FileText, Loader2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
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
    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [data, setData] = useState({
        chart: null,
        history: [],
        average: 0
    });

    useEffect(() => {
        const initData = async () => {
            try {
                const childRes = await api.get('/parent/children');
                setChildren(childRes.data || []);
                if (childRes.data && childRes.data.length > 0) {
                    setSelectedChildId(childRes.data[0].id);
                } else {
                    fetchHistory(period, '');
                }
            } catch (error) {
                console.error("Error fetching children", error);
            }
        };
        initData();
    }, []);

    useEffect(() => {
        if (selectedChildId !== '') {
            fetchHistory(period, selectedChildId);
        }
    }, [period, selectedChildId]);

    const fetchHistory = async (p, childId) => {
        setLoading(true);
        try {
            let days = 7;
            if (p === '30d') days = 30;
            if (p === '90d') days = 90;

            const url = childId ? `/parent/history?days=${days}&childId=${childId}` : `/parent/history?days=${days}`;
            const res = await api.get(url);
            const rawRecords = res.data || [];

            generateData(p, rawRecords);
        } catch (err) {
            console.error("Error fetching history:", err);
            generateData(p, []);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Voulez-vous vraiment supprimer cette mesure ?")) return;
        try {
            await api.delete(`/medicalrecords/${id}`);
            // Refresh data
            fetchHistory(period, selectedChildId);
        } catch (error) {
            console.error("Erreur de suppression", error);
        }
    };

    const generateData = (p, records) => {
        let labels = [];
        let values = [];

        // Sort ascending for the chart
        const sortedForChart = [...records].reverse();

        if (sortedForChart.length > 0) {
            sortedForChart.forEach(r => {
                if(r.glucoseValue) {
                    const dt = new Date(r.timestamp);
                    labels.push(dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
                    values.push(r.glucoseValue);
                }
            });
        } else {
            labels = ['Aucune donnée'];
            values = [0];
        }

        const mappedHistory = records.map((r, i) => {
            const dt = new Date(r.timestamp);
            let status = 'stable';
            if (r.glucoseValue < 0.70) status = 'hypo';
            else if (r.glucoseValue > 1.80) status = 'hyper';

            return {
                id: r.id || i,
                time: dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                val: r.glucoseValue || 0,
                status: status,
                note: r.childName + (r.timing ? ` • ${r.timing}` : ''),
                insulin: (r.insulinDose || 0) + 'u'
            };
        });

        setData({
            average: values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0,
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
            history: mappedHistory
        });
    };

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-10 pb-32 text-white max-w-lg mx-auto">

                {/* Header SECTION 6.1 */}
                <div className="flex justify-between items-center pt-4 print:hidden">
                    <h1 className="text-3xl font-black tracking-tight leading-none italic uppercase">
                        Historique <span className="text-white/40">Soin</span>
                    </h1>
                    <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-[#088395] transition-all" onClick={() => window.print()}>
                        <FileText size={20} />
                    </button>
                </div>

                {/* Child Switcher */}
                {children.length > 1 && (
                    <div className="flex gap-2 p-2 bg-white/5 rounded-[24px] border border-white/10 backdrop-blur-xl print:hidden">
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildId(child.id)}
                                className={cn(
                                    "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all line-clamp-1 truncate px-2",
                                    selectedChildId === child.id ? "bg-[#088395] text-white shadow-xl" : "text-white/40 hover:text-white"
                                )}
                            >
                                {child.fullName.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Print Title (Only visible during print) */}
                <div className="hidden print:block text-black text-center mb-8">
                    <h1 className="text-4xl font-black uppercase">Relevés Glycémiques</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase">Généré le {new Date().toLocaleDateString()}</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 p-2 bg-white/5 rounded-[24px] border border-white/10 backdrop-blur-xl print:hidden">
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
                            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden relative print:border-none print:shadow-none print:p-0 print:mb-10">
                                <div className="flex justify-between items-start mb-10 text-black">
                                    <div className="mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/30 print:text-black mb-1">
                                            {period === '7d' ? "Évolution Hebdo" : (period === '30d' ? "Tendance Mensuelle" : "Suivi Trimestriel")}
                                        </h3>
                                        <p className="text-[10px] font-bold text-[#088395] uppercase tracking-widest">Graphique des tendances</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black italic print:text-black text-white">{Number(data.average).toFixed(2)}</span>
                                            <span className="text-sm font-bold opacity-40 print:text-gray-600 print:opacity-100 text-white">g/L</span>
                                        </div>
                                        <span className="text-[10px] font-bold opacity-20 print:opacity-100 print:text-gray-500 uppercase text-white">Moyenne</span>
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
                                <div className="flex justify-between items-center pl-4 print:hidden">
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/30">Journal {period === '7d' ? 'des relevés' : 'étendu'}</h3>
                                </div>
                                <h3 className="hidden print:block text-2xl font-black uppercase tracking-[0.2em] text-black border-b-2 border-black pb-4 mt-10">Détails des mesures</h3>

                                <div className="space-y-4 print:space-y-0">
                                    {data.history.map((item, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={item.id}
                                            className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between group hover:bg-white/10 transition-all print:border-b print:border-black/20 print:rounded-none print:py-4 print:bg-transparent print:text-black"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center min-w-[100px] print:min-w-[150px]">
                                                    <span className="text-xs font-black italic print:text-black text-white">{item.time}</span>
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full mt-2 print:border print:border-black",
                                                        item.status === 'hypo' ? "bg-accent" : item.status === 'hyper' ? "bg-orange-500" : "bg-green-500"
                                                    )} />
                                                </div>
                                                <div className="h-10 w-[1px] bg-white/10 print:bg-black/20" />
                                                <div>
                                                    <div className="text-2xl font-black italic leading-none mb-1 print:text-black text-white">
                                                        {Number(item.val).toFixed(2)} <span className="text-[10px] opacity-20 not-italic print:opacity-100 print:text-gray-500">g/L</span>
                                                    </div>
                                                    <div className="text-[8px] font-bold text-white/20 print:text-gray-700 uppercase tracking-[0.2em]">{item.note}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#088395]">
                                                        <Syringe size={12} /> {item.insulin}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all print:hidden"
                                                    title="Supprimer la mesure"
                                                >
                                                    <Trash2 size={14} />
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
                <button className="w-full py-5 bg-[#088395]/10 border border-[#088395]/20 text-[#088395] rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-[#088395] hover:text-white transition-all shadow-xl active:scale-95 print:hidden" onClick={() => window.print()}>
                    Exporter en PDF pour le médecin
                </button>

            </div>
        </DashboardLayout>
    );
}
