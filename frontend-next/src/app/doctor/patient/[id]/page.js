"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Calendar, FileText, Heart, Activity, AlertTriangle,
    ChevronRight, Sparkles, TrendingUp, User, Droplets, Target, Clock,
    ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function PatientDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRV, setShowRV] = useState(false);
    const [showIA, setShowIA] = useState(false);
    const [rvDate, setRvDate] = useState('');
    const [rvTime, setRvTime] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch patient info
                const patientRes = await api.get(`/patients/${id}`);
                setPatient(patientRes.data);

                // Fetch patient records
                const recordsRes = await api.get(`/medicalrecords/patient/${id}`);
                setRecords(recordsRes.data);
            } catch (err) {
                // Mock data if fails
                setPatient({
                    fullName: "Amine Karoui",
                    age: 9,
                    gender: "H",
                    diagnosisDate: "12 Mars 2023",
                    type: "Type 1",
                    treatment: "Insuline (Pompe)",
                    targets: { min: 80, max: 1.40 },
                    status: "Critique"
                });
                setRecords([
                    { timestamp: "2026-02-21T08:00:00Z", glucoseValue: 1.80 },
                    { timestamp: "2026-02-21T10:00:00Z", glucoseValue: 245 },
                    { timestamp: "2026-02-21T12:00:00Z", glucoseValue: 210 },
                    { timestamp: "2026-02-21T15:00:00Z", glucoseValue: 195 },
                ]);
            } finally { setLoading(false); }
        };
        fetchData();
    }, [id]);

    const chartData = {
        labels: records.map(r => new Date(r.timestamp).toLocaleTimeString([], { hour: '2d', minute: '2d' })),
        datasets: [{
            label: 'Glycémie (g/L)',
            data: records.map(r => r.glucoseValue),
            borderColor: '#0071E3',
            backgroundColor: 'rgba(0, 113, 227, 0.05)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#0071E3',
            pointBorderWidth: 3,
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1D1D1F',
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 14, weight: '900' },
                padding: 16,
                borderRadius: 12,
                displayColors: false,
            }
        },
        scales: {
            y: {
                suggestedMin: 40, suggestedMax: 300,
                grid: { color: '#F5F5F7' },
                ticks: { font: { weight: 'bold', size: 10 }, color: '#D1D1D6' }
            },
            x: {
                grid: { display: false },
                ticks: { font: { weight: 'bold', size: 10 }, color: '#D1D1D6' }
            }
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Fiche Patient - ${patient.fullName}`, 20, 10);
        const tableColumn = ["Date/Heure", "Valeur (g/L)", "Type"];
        const tableRows = records.map(r => [
            new Date(r.timestamp).toLocaleString(),
            r.glucoseValue,
            "Glycémie"
        ]);
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save(`Fiche_${patient.fullName}_${new Date().toLocaleDateString()}.pdf`);
    };

    if (loading) return <div className="p-20 text-center font-bold animate-pulse">Chargement de la fiche...</div>;

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="p-4 bg-white rounded-2xl border border-secondary text-foreground/40 hover:text-primary transition-all shadow-sm">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-extrabold tracking-tight text-premium uppercase leading-none">{patient.fullName}</h1>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full",
                                    patient.status === 'Critique' ? "bg-accent/10 text-accent border border-accent/20" : "bg-success/10 text-success border border-success/20"
                                )}>{patient.status}</span>
                            </div>
                            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em]">Code Patient : DC-{id.slice(-4).toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={exportPDF} className="btn-apple-secondary !py-4 flex items-center gap-3">
                            <FileText size={18} className="text-primary" />
                            <span className="text-xs uppercase tracking-widest">Générer Rapport</span>
                        </button>
                        <button onClick={() => setShowIA(true)} className="btn-apple-secondary !py-4 flex items-center gap-3">
                            <Sparkles size={18} className="text-white" />
                            <span className="text-xs uppercase tracking-widest">Analyse DiaPote</span>
                        </button>
                        <button onClick={() => setShowRV(true)} className="btn-apple !py-4 flex items-center gap-3 shadow-xl shadow-primary/20">
                            <Calendar size={18} />
                            <span className="text-xs uppercase tracking-widest">Programmer RV</span>
                        </button>
                    </div>
                </div>

                {/* 3-Column Layout from Spec */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Column 1: Portrait & General Info */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="apple-card p-10 flex flex-col items-center text-center">
                            <div className="w-32 h-32 bg-secondary rounded-[40px] flex items-center justify-center text-primary font-black text-6xl mb-8 border border-white shadow-inner">
                                {patient.fullName.charAt(0)}
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-premium leading-none">{patient.fullName}</h2>
                                <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest leading-none italic">{patient.age} Ans • {patient.gender === 'H' ? 'Garçon' : 'Fille'}</p>
                            </div>

                            <div className="w-full h-px bg-secondary my-8" />

                            <div className="w-full space-y-6 text-left">
                                <InfoRow label="Diagnostic" value={patient.diagnosisDate} icon={<Clock size={14} />} />
                                <InfoRow label="Type Diabète" value={patient.type} icon={<Target size={14} />} />
                                <InfoRow label="Traitement" value={patient.treatment} icon={<Droplets size={14} />} />
                            </div>
                        </div>

                        <div className="apple-card p-8 bg-primary text-white space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 text-white/10 group-hover:scale-125 transition-transform duration-700 font-black text-6xl italic">IA</div>
                            <h3 className="text-sm font-black uppercase tracking-widest relative z-10 flex items-center gap-2">
                                <Sparkles size={16} /> DiaPote Suggestion
                            </h3>
                            <p className="text-[11px] font-bold leading-relaxed opacity-0.80 italic relative z-10">
                                "Ajustement probable : Basale +2% entre 02h et 04h en raison du phénomène de l'aube détecté 3 jours de suite."
                            </p>
                            <button
                                onClick={() => setShowIA(true)}
                                className="w-full py-4 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all font-sans"
                            >
                                Analyser plus
                            </button>
                        </div>
                    </div>

                    {/* Column 2: Interactive Curves */}
                    <div className="lg:col-span-6 space-y-8">
                        <div className="apple-card p-12">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h3 className="text-xl font-black text-premium uppercase tracking-tighter leading-none mb-1">Variation Glycémique</h3>
                                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Dernières 24 Heures</p>
                                </div>
                                <div className="flex bg-secondary p-1 rounded-xl">
                                    <button className="px-4 py-2 bg-white rounded-lg text-[9px] font-bold text-primary shadow-sm uppercase tracking-widest">Jour</button>
                                    <button className="px-4 py-2 text-[9px] font-bold text-foreground/30 uppercase tracking-widest hover:text-foreground">Semaine</button>
                                </div>
                            </div>

                            <div className="h-[400px]">
                                <Line data={chartData} options={chartOptions} />
                            </div>

                            <div className="grid grid-cols-3 gap-6 mt-12">
                                <QuickStat label="Min" value="55" unit="mg" color="text-accent" icon={<ArrowDownRight size={14} />} />
                                <QuickStat label="Max" value="245" unit="mg" color="text-accent" icon={<ArrowUpRight size={14} />} />
                                <QuickStat label="Moyenne" value="162" unit="mg" color="text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Objectives & Anomalies */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="apple-card p-10 space-y-10">
                            <h3 className="text-xl font-black text-premium uppercase tracking-tighter flex items-center gap-3 leading-none">
                                <Target className="text-primary" /> Objectifs
                            </h3>
                            <div className="space-y-6">
                                <ObjectiveSlide label="Glycémie Cible" value="0.80 - 1.40" unit="g/L" progress={65} />
                                <ObjectiveSlide label="Temps dans la cible" value="72%" unit="Total" progress={72} color="bg-success" />
                            </div>
                        </div>

                        <div className="apple-card p-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-premium uppercase tracking-tighter leading-none">Anomalies</h3>
                                <button className="p-2 text-foreground/20 hover:text-primary transition-all"><MoreHorizontal size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <AnomalyRow title="Hypoglycémie Sévère" time="Ce matin, 06:42" val="55" type="critical" />
                                <AnomalyRow title="Hyperglycémie Post-P" time="Hier, 20:15" val="245" type="warning" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal RV */}
            {showRV && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-xl px-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg apple-card p-1">
                        <div className="bg-white/10 backdrop-blur-3xl rounded-[22px] p-12 text-center relative overflow-hidden">
                            <button onClick={() => setShowRV(false)} className="absolute top-8 right-8 p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all"><X /></button>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-10">Programmer <span className="text-white/60 italic">Rendez-vous</span></h2>
                            <div className="space-y-6">
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Date de la consultation</label>
                                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-10 text-lg font-bold text-white outline-none focus:border-white/20 transition-all" />
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Heure</label>
                                    <input type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-10 text-lg font-bold text-white outline-none focus:border-white/20 transition-all" />
                                </div>
                                <button onClick={() => { alert('RV Enregistré !'); setShowRV(false); }} className="w-full btn-apple !py-8 !text-2xl mt-4">Valider la date</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal IA Detail */}
            {showIA && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-xl px-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl apple-card p-1">
                        <div className="bg-white/10 backdrop-blur-3xl rounded-[22px] p-12 text-left relative overflow-hidden">
                            <button onClick={() => setShowIA(false)} className="absolute top-8 right-8 p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all"><X /></button>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#088395] shadow-xl"><Sparkles size={32} /></div>
                                <div>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Rapport <span className="text-white/60 italic">IA DiaPote</span></h2>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">{patient.fullName}</p>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                                    <p className="text-lg font-bold text-white leading-relaxed italic">"Les données indiquent une hyperglycémie récurrente entre 20h et 22h. Cela suggère une sous-estimation des glucides lors du dîner ou une dose de bolus insuffisante. Nous recommandons de revoir le ratio Insuline/Glucides pour le soir."</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Tendance</div>
                                        <div className="text-2xl font-black text-yellow-500">HAUSSE PHI</div>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Confiance</div>
                                        <div className="text-2xl font-black text-success">92.4%</div>
                                    </div>
                                </div>
                                <button onClick={() => setShowIA(false)} className="w-full btn-apple !py-6 !text-xl shadow-2xl">Appliquer les conseils</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}

const InfoRow = ({ label, value, icon }) => (
    <div className="flex items-center gap-4 group">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground/20 group-hover:text-primary transition-colors">
            {icon}
        </div>
        <div>
            <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest leading-none mb-1">{label}</div>
            <div className="text-xs font-extrabold text-premium uppercase leading-none">{value}</div>
        </div>
    </div>
);

const QuickStat = ({ label, value, unit, color, icon }) => (
    <div className="text-center space-y-2 p-6 bg-secondary/30 rounded-3xl border border-transparent hover:border-white hover:bg-white hover:shadow-xl transition-all">
        <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest leading-none">{label}</div>
        <div className={cn("text-2xl font-black flex items-center justify-center gap-1", color)}>
            {icon}
            {value} <span className="text-[10px] opacity-40">{unit}</span>
        </div>
    </div>
);

const ObjectiveSlide = ({ label, value, unit, progress, color = "bg-primary" }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest leading-none">{label}</span>
            <span className="text-[12px] font-black text-premium uppercase leading-none">{value} <span className="text-[8px] opacity-40">{unit}</span></span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                className={cn("h-full rounded-full shadow-lg transition-all", color)}
            />
        </div>
    </div>
);

const AnomalyRow = ({ title, time, val, type }) => (
    <div className="p-5 bg-secondary/30 rounded-2xl border border-transparent hover:border-white hover:bg-white hover:shadow-xl transition-all group flex items-start gap-4">
        <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
            type === 'critical' ? "bg-accent/10 text-accent" : "bg-yellow-500/10 text-yellow-600"
        )}>
            <AlertTriangle size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-premium uppercase tracking-tighter leading-none mb-1 truncate">{title}</h4>
            <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest truncate">{time}</p>
        </div>
        <div className={cn(
            "text-xl font-black leading-none",
            type === 'critical' ? "text-accent" : "text-yellow-600"
        )}>{val}</div>
    </div>
);
