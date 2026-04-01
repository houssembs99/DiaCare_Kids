"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    AlertTriangle, Search, Filter, Clock,
    Baby, Activity, ShieldAlert, CheckCircle2,
    ChevronLeft, ChevronRight, MessageSquare,
    ArrowUpRight, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const alertsMock = [];

export default function DoctorAlerts() {
    const [filterLevel, setFilterLevel] = useState("All");

    const filteredAlerts = alertsMock.filter(alert => {
        return filterLevel === "All" || alert.level === filterLevel;
    });

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 6 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center text-accent shadow-[0_0_25px_rgba(255,112,67,0.3)] border border-accent/20">
                                <ShieldAlert size={28} />
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                    Alertes <span className="text-white/40">Critiques</span>
                                </h1>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gestion et historique des incidents médicaux</p>
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

                {/* Main Table SECTION 6 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Patient</th>
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
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#088395]/10 rounded-xl flex items-center justify-center text-[#088395] font-black text-xs border border-[#088395]/20">
                                                    {alert.patient.charAt(0)}
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-tighter leading-none">{alert.patient}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                    alert.level === 'Critique' ? "bg-accent/10 border-accent/20 text-accent" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
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
                                                    alert.level === 'Moyenne' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                                        "bg-success/10 text-success border-success/20"
                                            )}>
                                                {alert.level}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                                            {alert.date}
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
                                            <div className="flex items-center justify-end gap-3">
                                                <Link href={`/doctor/patients/1`} className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-2xl text-white transition-all group/btn border border-white/5">
                                                    <ArrowUpRight size={18} className="group-hover/btn:scale-125 transition-transform" />
                                                </Link>
                                                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white/20 transition-all">
                                                    <MessageSquare size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
