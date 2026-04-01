"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Syringe, Search, Filter, Baby,
    Calendar, History, Plus, Edit3,
    ArrowUpRight, Clock, ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const treatmentsMock = [];

export default function DoctorTreatments() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTreatments = treatmentsMock.filter(t =>
        t.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 7 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#088395]/20 rounded-2xl flex items-center justify-center text-[#088395] border border-[#088395]/20 shadow-[0_0_20px_rgba(8,131,149,0.2)]">
                                <Syringe size={28} />
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                    Gestion <span className="text-white/40">Traitements</span>
                                </h1>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Protocoles d'insuline et dosages personnalisés</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar SECTION 7 */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 relative group">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#088395] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="RECHERCHER PAR PATIENT OU TYPE D'INSULINE..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-6 pl-16 pr-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] focus:bg-white/10 transition-all placeholder:text-white/5"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-3 px-8 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all">
                        <Plus size={18} /> Planifier Traitement
                    </button>
                </div>

                {/* Main Table SECTION 7 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Héro / Patient</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Protocole Actuel</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Dosage</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Fréquence</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Modifié le</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredTreatments.map((t, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={t.id}
                                        className="group hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black group-hover:bg-[#088395] transition-colors">
                                                    {t.patient.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black uppercase tracking-tighter leading-none">{t.patient}</span>
                                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Démarré le {t.start}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[#088395]">
                                                    <Syringe size={14} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-xl font-black italic text-[#088395]">{t.dose.split(' ')[0]}</span>
                                            <span className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-widest">{t.dose.split(' ')[1]}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                                                <Clock size={12} /> {t.freq}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                            {t.lastMod}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link href={`/doctor/patients/1`} className="p-4 bg-white/5 hover:bg-[#088395] rounded-xl text-white transition-all group/btn">
                                                    <ArrowUpRight size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                </Link>
                                                <button className="p-4 bg-white/5 hover:bg-white hover:text-black rounded-xl text-white/20 transition-all">
                                                    <Edit3 size={18} />
                                                </button>
                                                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-white/20 transition-all">
                                                    <History size={18} />
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
