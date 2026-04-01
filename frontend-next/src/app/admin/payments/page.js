"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Activity, Search, Filter, Download, FileText,
    TrendingUp, CreditCard, Wallet, Calendar,
    CheckCircle2, Clock, AlertCircle, ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockPayments = [
    { id: "TX-9281", clinic: "Clinique El Hana", amount: "$149.00", date: "22 Fév 2026", method: "Visa", status: "Payé" },
    { id: "TX-9282", clinic: "Centre Médical Les Berges", amount: "$49.00", date: "21 Fév 2026", method: "Mastercard", status: "Payé" },
    { id: "TX-9283", clinic: "Hôpital International", amount: "$299.00", date: "20 Fév 2026", method: "Virement", status: "En Attente" },
    { id: "TX-9284", clinic: "Cabinet Pédiatrique Sousse", amount: "$49.00", date: "15 Fév 2026", method: "Visa", status: "Payé" },
    { id: "TX-9285", clinic: "Clinique de l'Espoir", amount: "$149.00", date: "10 Fév 2026", method: "Paypal", status: "Échoué" },
];

export default function AdminPayments() {
    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 8.1 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                            Suivi des <span className="text-white/40">Paiements</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Historique des transactions et facturation</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-success"><TrendingUp size={20} /></div>
                            <div>
                                <div className="text-sm font-black">$15,240.00</div>
                                <div className="text-[8px] font-bold opacity-30 uppercase tracking-widest">Total ce mois</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl">
                    <div className="flex flex-1 min-w-[300px] relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par clinique ou transaction ID..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-8 text-sm font-bold text-white outline-none focus:border-[#1E88E5] transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            <Calendar size={16} /> Ce Mois
                        </button>
                        <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                            <Download size={20} className="text-white/40" />
                        </button>
                    </div>
                </div>

                {/* Table SECTION 8.1 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                                <tr>
                                    <th className="px-10 py-8">Transaction ID</th>
                                    <th className="px-10 py-8">Clinique</th>
                                    <th className="px-10 py-8">Montant</th>
                                    <th className="px-10 py-8">Date</th>
                                    <th className="px-10 py-8">Mode</th>
                                    <th className="px-10 py-8">Statut</th>
                                    <th className="px-10 py-8 text-right">Facture</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-bold">
                                {mockPayments.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-10 py-8 text-[10px] uppercase font-black tracking-widest text-[#1E88E5]">{p.id}</td>
                                        <td className="px-10 py-8 text-sm font-extrabold uppercase tracking-tighter">{p.clinic}</td>
                                        <td className="px-10 py-8 text-lg font-black">{p.amount}</td>
                                        <td className="px-10 py-8 text-xs text-white/30 uppercase tracking-widest font-black">{p.date}</td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/20"><Wallet size={16} /></div>
                                                <span className="text-xs uppercase tracking-widest font-black">{p.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    p.status === 'Payé' ? "bg-success" : p.status === 'En Attente' ? "bg-yellow-500" : "bg-accent"
                                                )} />
                                                <span className={cn(
                                                    "text-[9px] uppercase tracking-widest font-black",
                                                    p.status === 'Payé' ? "text-success" : p.status === 'En Attente' ? "text-yellow-500" : "text-accent"
                                                )}>{p.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:bg-white hover:text-[#1E88E5] hover:shadow-xl transition-all group/btn">
                                                <FileText size={18} className="group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
