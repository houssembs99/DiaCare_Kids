"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    ShieldCheck, Lock, Activity, Search, Filter,
    Eye, AlertTriangle, ShieldAlert, Key, Globe,
    Smartphone, Server, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

import api from '@/lib/api';

export default function AdminSecurity() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        uptimeSsl: 'Actif',
        uptimeStatus: 'Safe',
        alertes24h: 0,
        trafficOrigin: 'Global',
        trafficStatus: 'Calcul...',
        authPercentage: '100%',
        authStatus: 'Calcul...'
    });

    React.useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/logs');
                const logsData = res.data;
                setLogs(logsData);
                
                // Calculate dynamic stats from real data
                const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const alerts = logsData.filter(l => (l.type === 'Danger' || l.type === 'Urgent') && new Date(l.date) > last24h).length;
                
                const failedLogins = logsData.filter(l => l.action.toLowerCase().includes('connexion') && l.type === 'Danger').length;
                const authRate = Math.max(0, 100 - (failedLogins * 2));
                
                const uniqueDevices = new Set(logsData.map(l => l.device)).size;
                const trafficDesc = uniqueDevices > 2 ? `Tunisia (Divers)` : 'Tunisia (100%)';

                setStats({
                    uptimeSsl: 'Actif',
                    uptimeStatus: 'Safe',
                    alertes24h: alerts,
                    trafficOrigin: 'Global',
                    trafficStatus: trafficDesc,
                    authPercentage: `${authRate}%`,
                    authStatus: authRate >= 90 ? 'Sécurisé' : 'Alerte'
                });

            } catch (err) {
                console.error("Error fetching logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

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
                    <SecurityStat label="Uptime SSL" value={stats.uptimeSsl} status={stats.uptimeStatus} icon={<Key size={24} />} />
                    <SecurityStat label="Alertes 24h" value={stats.alertes24h} status={stats.alertes24h > 0 ? "Monitoring" : "Safe"} icon={<ShieldAlert size={24} />} isWarning={stats.alertes24h > 0} />
                    <SecurityStat label="Origine Trafic" value={stats.trafficOrigin} status={stats.trafficStatus} icon={<Globe size={24} />} />
                    <SecurityStat label="Auth" value={stats.authPercentage} status={stats.authStatus} icon={<Lock size={24} />} isWarning={stats.authPercentage !== '100%'} />
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
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-8 text-center text-white/50">Chargement des logs...</td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-8 text-center text-white/50">Aucun log trouvé</td>
                                    </tr>
                                ) : logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-10 py-8 text-xs text-white/30 uppercase tracking-widest font-black">
                                            {new Date(log.date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                    log.type === 'Danger' ? "bg-accent/10 text-accent border-accent/20 shadow-[0_0_20px_rgba(255,112,67,0.15)]" :
                                                        log.type === 'Sensible' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                            log.type === 'Urgent' ? "bg-accent/10 text-accent border-accent/20 shadow-[0_0_20px_rgba(255,112,67,0.15)]" :
                                                                "bg-primary/10 text-primary border-primary/20"
                                                )}>
                                                    {log.type === 'Danger' || log.type === 'Urgent' ? <AlertTriangle size={18} /> : log.type === 'Sensible' ? <Key size={18} /> : <Activity size={18} />}
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
