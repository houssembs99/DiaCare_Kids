"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    ShieldCheck, Lock, Activity, Search, Filter,
    Eye, AlertTriangle, ShieldAlert, Key, Globe,
    Smartphone, Server, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockLogs = [
    { id: 1, action: "Tentative de connexion échouée", user: "Inconnu (192.168.1.45)", type: "Danger", date: "22 Fév, 23:12", device: "Chrome / Windows" },
    { id: 2, action: "Suppression Clinique", user: "Admin (Houssem)", type: "Sensible", date: "22 Fév, 22:45", device: "Safari / macOS" },
    { id: 3, action: "Export Base de Données", user: "Admin (Houssem)", type: "Sensible", date: "22 Fév, 18:00", device: "Chrome / Windows" },
    { id: 4, action: "Mise à jour SSL", user: "System", type: "Info", date: "22 Fév, 02:00", device: "Cloudflare" },
    { id: 5, action: "Blocage compte suspect", user: "System", type: "Urgent", date: "21 Fév, 21:30", device: "Antivirus API" },
];

export default function AdminSecurity() {
    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 12.1 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                            Sécurité & <span className="text-white/40">Logs</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Audit complet des actions sensibles du système</p>
                    </div>
                </div>

                {/* Security Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <SecurityStat label="Uptime SSL" value="Actif" status="Safe" icon={<Key size={24} />} />
                    <SecurityStat label="Alertes 24h" value="12" status="Monitoring" icon={<ShieldAlert size={24} />} isWarning />
                    <SecurityStat label="Origine Trafic" value="Global" status="Tunisia (84%)" icon={<Globe size={24} />} />
                    <SecurityStat label="Auth 2FA" value="95%" status="Activé" icon={<Lock size={24} />} />
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl">
                    <div className="flex flex-1 min-w-[300px] relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher action, IP, utilisateur..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-8 text-sm font-bold text-white outline-none focus:border-[#1E88E5] transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            <Calendar size={16} /> Aujourd'hui
                        </button>
                    </div>
                </div>

                {/* Table SECTION 12.1 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold">
                            <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                                <tr>
                                    <th className="px-10 py-8">Timestamp</th>
                                    <th className="px-10 py-8">Action</th>
                                    <th className="px-10 py-8">Utilisateur</th>
                                    <th className="px-10 py-8">Source Appareil</th>
                                    <th className="px-10 py-8 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {mockLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-10 py-8 text-xs text-white/30 uppercase tracking-widest font-black">{log.date}</td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                    log.type === 'Danger' ? "bg-accent/10 text-accent border-accent/20 shadow-[0_0_20px_rgba(255,112,67,0.15)]" :
                                                        log.type === 'Sensible' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                            "bg-primary/10 text-primary border-primary/20"
                                                )}>
                                                    {log.type === 'Danger' ? <AlertTriangle size={18} /> : log.type === 'Sensible' ? <Key size={18} /> : <Activity size={18} />}
                                                </div>
                                                <div className="text-sm font-black uppercase tracking-tighter">{log.action}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-xs font-black uppercase tracking-widest text-[#1E88E5]">{log.user}</td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 text-white/30 font-black text-[10px] uppercase tracking-widest">
                                                <Smartphone size={14} /> {log.device}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/20 hover:text-white transition-all">
                                                <Eye size={18} />
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

const SecurityStat = ({ label, value, status, icon, isWarning }) => (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[28px] p-6 group hover:border-white/30 transition-all">
        <div className="flex items-center gap-6">
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isWarning ? "bg-accent/10 text-accent" : "bg-primary/10 text-[#1E88E5]"
            )}>
                {icon}
            </div>
            <div>
                <div className="text-xl font-black">{value}</div>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none">{label}</span>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest", isWarning ? 'text-accent' : 'text-success')}>• {status}</span>
                </div>
            </div>
        </div>
    </div>
);
