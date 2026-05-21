"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Wallet, Download, Search, FileText, CheckCircle2,
    ChevronLeft, ChevronRight, User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function ParentPayments() {
    const [payments, setPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            api.get(`/Transactions/user/${parsed.id}`)
                .then(res => {
                    setPayments(res.data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Erreur de récupération des transactions", err);
                    setIsLoading(false);
                });
        }
    }, []);

    const filteredPayments = payments.filter(p => 
        p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.planName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-12 pb-10 text-white">

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Wallet size={24} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Mes <span className="text-white/40">Paiements</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Consultez et téléchargez vos reçus de protection DiaCare</p>
                    </div>

                    <button className="flex items-center gap-3 px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] transition-all">
                        <Download size={18} />
                        Exporter (CSV)
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#088395] transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="RECHERCHER PAR FORFAIT OU ID..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Forfait</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Date</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Montant</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Statut</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Facture</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="px-10 py-16 text-center text-white/40 font-bold uppercase tracking-widest text-xs">Chargement...</td></tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr><td colSpan="5" className="px-10 py-16 text-center text-white/40 font-bold uppercase tracking-widest text-xs">Aucun paiement trouvé.</td></tr>
                                ) : (
                                    filteredPayments.map((pay, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={pay.id}
                                            className="group hover:bg-white/5 transition-colors"
                                        >
                                            <td className="px-10 py-8">
                                                <span className="text-sm font-black uppercase tracking-tight text-white">{pay.planName}</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-xs font-bold text-white/40">{new Date(pay.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-lg font-black italic tracking-tighter text-[#088395]">
                                                    {(pay.amount / 100).toFixed(2)} €
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-xl text-success text-[9px] font-black uppercase tracking-widest w-fit">
                                                    <CheckCircle2 size={12} />
                                                    {pay.status}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button 
                                                    onClick={() => alert(`Reçu ID: ${pay.id}\nMontant: ${(pay.amount/100).toFixed(2)}€`)}
                                                    className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-2xl text-white/40 transition-all shadow-xl border border-white/5"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                            Total Payé: <span className="text-white">{(totalAmount / 100).toFixed(2)} €</span>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
