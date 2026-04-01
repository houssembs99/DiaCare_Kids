"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    AlertTriangle, Search, Filter, Clock,
    Baby, Stethoscope, ShieldAlert, CheckCircle2,
    ChevronLeft, ChevronRight, MessageSquare,
    ArrowUpRight, AlertCircle, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const alertsMock = [];

export default function ClinicAlerts() {
    const [filterLevel, setFilterLevel] = useState("All");

    const filteredAlerts = alertsMock.filter(alert => {
        return filterLevel === "All" || alert.level === filterLevel;
    });

    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 9.2 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center text-accent shadow-[0_0_25px_rgba(255,112,67,0.3)] border border-accent/20">
                                <ShieldAlert size={28} />
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                    Centre des <span className="text-white/40">Alertes</span>
                                </h1>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Surveillance critique et gestion des incidents</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 p-2 bg-white/5 rounded-[24px] border border-white/10 backdrop-blur-xl">
                        {['All', 'Critique', 'Moyenne', 'Résolue'].map(l => (
                            <button
                                key={l}
                                onClick={() => setFilterLevel(l)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filterLevel === l ? "bg-accent text-white shadow-2xl" : "text-white/40 hover:text-white"
                                )}
                            >
                                {l === 'All' ? 'Tous' : l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid of Active Critical Alerts (Dynamic Focus) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredAlerts.filter(a => a.level === 'Critique' && a.status === 'En attente').map((alert, idx) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-accent/10 border-2 border-accent/30 rounded-[40px] p-8 lg:p-10 relative overflow-hidden group shadow-[0_20px_50px_rgba(255,112,67,0.2)]"
                        >
                            <div className="absolute -right-10 -top-10 text-accent/5 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                                <AlertTriangle size={200} />
                            </div>
                            <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                                <div className="p-6 bg-accent rounded-3xl text-white shadow-2xl">
                                    <Activity size={32} className="animate-pulse" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-accent text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">URGENT</span>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={12} /> {alert.date}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{alert.type}</h3>
                                    <div className="flex items-center gap-3 text-sm font-bold text-white/60">
                                        <Baby size={16} className="text-white/30" /> {alert.patient} <span className="text-white/10 uppercase font-black text-[9px]">suivi par</span> <Stethoscope size={16} className="text-white/30" /> {alert.doctor}
                                    </div>
                                </div>
                                <div className="text-5xl font-black italic tracking-tighter text-accent group-hover:scale-110 transition-transform">{alert.value}</div>
                            </div>
                            <div className="mt-10 flex gap-4">
                                <button className="flex-1 py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl">
                                    Prendre en charge
                                </button>
                                <button className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
                                    <MessageSquare size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Central Audit Table SECTION 9.2 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Patient / Médecin</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Nature de l'alerte</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Niveau</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Date & Heure</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Statut</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredAlerts.map((alert, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={alert.id}
                                        className="group hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-tighter leading-none">
                                                    <div className="w-2 h-2 rounded-full bg-accent" />
                                                    {alert.patient}
                                                </div>
                                                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-5">{alert.doctor}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                    alert.level === 'Critique' ? "bg-accent/10 border-accent/20 text-accent" : "bg-[#1E88E5]/10 border-[#1E88E5]/20 text-[#1E88E5]"
                                                )}>
                                                    <AlertCircle size={18} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{alert.type}</span>
                                                    {alert.value && <span className="text-sm font-black italic text-white/40">{alert.value}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={cn(
                                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest w-fit border",
                                                alert.level === 'Critique' ? "bg-accent/10 text-accent border-accent/20" :
                                                    alert.level === 'Moyenne' ? "bg-info/10 text-info border-info/20" :
                                                        "bg-success/10 text-success border-success/20"
                                            )}>
                                                {alert.level}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{alert.date}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={cn(
                                                "flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em]",
                                                alert.status === 'Traitée' ? "text-success" : "text-white/40"
                                            )}>
                                                {alert.status === 'Traitée' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                {alert.status}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-2xl text-white transition-all group/btn shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/5">
                                                <ArrowUpRight size={18} className="group-hover/btn:scale-125 transition-transform" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                            Surveillance ACTIVE: <span className="text-white">Dernières 48H affichées</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white hover:text-[#088395] rounded-xl text-white/40 transition-all border border-white/10 group">
                                <ChevronLeft size={20} className="group-active:-translate-x-1 transition-transform" />
                            </button>
                            <button className="w-12 h-12 rounded-xl text-[10px] font-black bg-accent text-white border border-transparent shadow-[0_10px_30px_rgba(255,112,67,0.3)]">1</button>
                            <button className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white hover:text-[#088395] rounded-xl text-white/40 transition-all border border-white/10 group">
                                <ChevronRight size={20} className="group-active:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
