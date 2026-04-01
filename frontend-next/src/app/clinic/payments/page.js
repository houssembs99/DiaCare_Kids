"use client";

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Wallet, Download, Search, Filter,
    FileText, CheckCircle2, Clock,
    ArrowUpRight, CreditCard, ExternalLink,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const paymentsMock = [];

export default function ClinicPayments() {
    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 8.1 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Wallet size={24} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Historique <span className="text-white/40">Paiements</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Consultez et téléchargez vos factures DiaCare</p>
                    </div>

                    <button className="flex items-center gap-3 px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] transition-all">
                        <Download size={18} />
                        Exporter (CSV/Excel)
                    </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#088395] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="RECHERCHER PAR ID OU TYPE..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all placeholder:text-white/10"
                        />
                    </div>
                </div>

                {/* Payments Table SECTION 8.1 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center">ID</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Détails de la Transaction</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Méthode</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Montant</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Statut</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Facture</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paymentsMock.map((pay, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={pay.id}
                                        className="group hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest text-center group-hover:text-white transition-colors">
                                                {pay.id}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black uppercase tracking-tighter leading-none">{pay.type}</span>
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{pay.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 text-white/40">
                                                {pay.method.includes('Carte') ? <CreditCard size={18} /> : <ExternalLink size={18} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{pay.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-xl font-black italic tracking-tighter text-[#088395]">
                                                {pay.amount}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-xl text-success text-[9px] font-black uppercase tracking-widest w-fit">
                                                <CheckCircle2 size={12} />
                                                {pay.status}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-2xl text-white/40 transition-all group/btn shadow-xl border border-white/5">
                                                <FileText size={18} className="group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="p-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                            Total Facturé: <span className="text-white">1,091.90 DT</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-xl text-white/40 transition-all border border-white/10 group">
                                <ChevronLeft size={20} className="group-active:-translate-x-1 transition-transform" />
                            </button>
                            <button className="w-12 h-12 rounded-xl text-[10px] font-black bg-[#088395] text-white border border-transparent shadow-[0_10px_30px_rgba(8,131,149,0.3)]">1</button>
                            <button className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-xl text-white/40 transition-all border border-white/10 group">
                                <ChevronRight size={20} className="group-active:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
