"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Baby, Search, Filter, Eye, Activity,
    Droplet, TrendingUp, Calendar, User,
    ChevronLeft, ChevronRight, Stethoscope,
    ArrowUpRight, AlertCircle, CheckCircle2,
    Clock, Plus, MoreVertical, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/api';

export default function DoctorPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctor-management/patients');
            setPatients(res.data);
        } catch (err) {
            console.error("Error fetching patients:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p => {
        const matchesSearch = (p.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.fileNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === "All" || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-10 pb-10 text-white">

                {/* Header SECTION 4.2 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Baby size={28} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Mes <span className="text-white/40">Champions</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Suivi détaillé et gestion de votre patientèle</p>
                    </div>

                    <button className="flex items-center gap-3 px-8 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(8,131,149,0.3)] hover:scale-105 active:scale-95 transition-all">
                        <Plus size={18} /> Inscire un nouveau patient
                    </button>
                </div>

                {/* Toolbar SECTION 4.2 */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#088395] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="RECHERCHER UN PATIENT PAR NOM..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] focus:bg-white/10 transition-all placeholder:text-white/10"
                        />
                    </div>

                    <div className="relative group">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-10 text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer">
                            <option value="">Tranche d'âge</option>
                            <option value="1">0 - 5 ans</option>
                            <option value="2">6 - 12 ans</option>
                            <option value="3">Plus de 12 ans</option>
                        </select>
                    </div>

                    <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                        {['All', 'Stable', 'Surveillance', 'Critique'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={cn(
                                    "flex-1 py-3 px-2 rounded-xl text-[8px] font-black uppercase tracking-[0.1em] transition-all",
                                    filterStatus === s ? "bg-[#088395] text-white shadow-lg" : "text-white/20 hover:bg-white/5"
                                )}
                            >
                                {s === 'All' ? 'Tous' : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Patients Table SECTION 4.2 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center">Profil</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Nom Enfant</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center">Âge</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Glycémie</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">État</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Dernière Consultation</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-[#088395]" size={40} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Récupération de vos champions...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Baby size={40} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Aucun patient trouvé</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPatients.map((p, idx) => {
                                    const age = p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 'N/A';
                                    return (
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={p.id}
                                            className="group hover:bg-white/5 transition-colors"
                                        >
                                            <td className="px-10 py-8 text-center">
                                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white font-black group-hover:scale-110 group-hover:bg-[#088395] group-hover:shadow-[0_0_20px_rgba(8,131,149,0.4)] transition-all mx-auto uppercase">
                                                    {(p.fullName || "P").charAt(0)}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black uppercase tracking-tighter">{p.fullName}</span>
                                                    <span className="text-[9px] font-bold text-[#088395] uppercase tracking-[0.2em]">{p.fileNumber || "SANS FICHE"}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center text-xs font-bold text-white/40 uppercase tracking-widest">
                                                {age} {age !== 'N/A' ? 'Ans' : ''}
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-xl font-black italic tracking-tighter text-white">
                                                        {p.lastGlucose || '--'} <span className="text-[10px] font-bold text-white/20 not-italic uppercase tracking-widest">mg/dL</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className={cn(
                                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest w-fit border",
                                                    p.status === 'Stable' || p.status === 'Actif' ? "bg-success/10 text-success border-success/20 shadow-[0_0_15px_rgba(52,199,89,0.1)]" :
                                                        p.status === 'Surveillance' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                                            "bg-accent/10 text-accent border-accent/20 shadow-[0_0_15px_rgba(255,112,67,0.1)]"
                                                )}>
                                                    {(p.status === 'Stable' || p.status === 'Actif') && <CheckCircle2 size={12} />}
                                                    {p.status === 'Surveillance' && <Activity size={12} />}
                                                    {p.status === 'Critique' && <AlertCircle size={12} className="animate-pulse" />}
                                                    {p.status === 'Actif' ? 'STABLE' : (p.status || 'STABLE').toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                    <Calendar size={14} /> --/--/----
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link href={`/doctor/patients/${p.id}`} className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-2xl text-white transition-all group/btn shadow-xl border border-white/5">
                                                        <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                    </Link>
                                                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white/20 transition-all">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                            Total Champions: <span className="text-white">{patients.length} Patients Suivis</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white hover:text-[#088395] rounded-xl text-white/40 transition-all border border-white/10 group">
                                <ChevronLeft size={20} className="group-active:-translate-x-1 transition-transform" />
                            </button>
                            {[1, 2, 3].map(page => (
                                <button key={page} className={cn("w-12 h-12 rounded-xl text-[10px] font-black transition-all border", page === 1 ? "bg-[#088395] text-white border-transparent shadow-[0_10px_30px_rgba(8,131,149,0.3)]" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10")}>
                                    {page}
                                </button>
                            ))}
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
