"use client";

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Baby, Search, Filter, Eye, Activity,
    Droplet, TrendingUp, Calendar, User,
    ChevronLeft, ChevronRight, Stethoscope,
    ArrowUpRight, AlertCircle, CheckCircle2,
    Clock, Plus, MoreVertical, Loader2, Users, Trash2,
    CheckCircle, XCircle, CreditCard
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
    const [allUsers, setAllUsers] = useState([]);
    const [doctorInfo, setDoctorInfo] = useState(null);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctor-management/patients');
            setPatients(res.data);

            // Also load all users to find parent subscription status
            const usersRes = await api.get('/Users');
            setAllUsers(usersRes.data);
        } catch (err) {
            console.error("Error fetching patients:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setDoctorInfo(JSON.parse(stored));
        fetchPatients();
    }, []);

    const handleDeletePatient = async (patientId, patientName) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le patient ${patientName} ? Cette action est irréversible.`)) {
            return;
        }

        try {
            await api.delete(`/doctor-management/patients/${patientId}`);
            alert('Patient supprimé avec succès.');
            fetchPatients();
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            alert("Une erreur est survenue ou vous n'êtes pas autorisé à supprimer ce patient (peut-être est-il rattaché par une clinique).");
        }
    };

    const handleActivateSub = async (parentId, parentName, currentStatus, planType) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'activer' : 'désactiver';
        if (!window.confirm(`Voulez-vous ${action} l'abonnement de la famille ${parentName} ?\n\nNota : L'activation créera automatiquement une transaction de revenu dans votre tableau financier.`)) return;

        try {
            await api.patch(`/Users/${parentId}/subscription`, {
                isActive: newStatus,
                planType: planType || 'Standard',
                expiryDate: newStatus ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
            });
            alert(`Abonnement ${newStatus ? 'activé' : 'désactivé'} avec succès${ newStatus ? ' — transaction de revenu enregistrée !' : '.'}`);
            fetchPatients();
        } catch (err) {
            console.error('Erreur activation abonnement:', err);
            alert('Erreur lors de la mise à jour.');
        }
    };

    const groupedPatients = useMemo(() => {
        const filtered = patients.filter(p => {
            const matchesSearch = (p.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.fileNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.parentFullName || "").toLowerCase().includes(searchQuery.toLowerCase());
            
            let healthStatus = 'Inconnu';
            if (p.lastGlucose) {
                if (p.lastGlucose < 70) healthStatus = 'Critique';
                else if (p.lastGlucose > 140) healthStatus = 'Surveillance';
                else healthStatus = 'Stable';
            } else {
                healthStatus = 'Stable'; // Default if no data but active
            }
            p.healthStatus = healthStatus;

            const matchesFilter = filterStatus === "All" || p.healthStatus === filterStatus;
            return matchesSearch && matchesFilter;
        });

        // Group by parent
        const groups = filtered.reduce((acc, p) => {
            const parentKey = p.associatedParentId || 'unassigned';
            if (!acc[parentKey]) {
                acc[parentKey] = {
                    parentId: p.associatedParentId,
                    parentName: p.parentFullName || 'Parent non spécifié',
                    kids: []
                };
            }
            acc[parentKey].kids.push(p);
            return acc;
        }, {});

        return Object.values(groups);
    }, [patients, searchQuery, filterStatus]);

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
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Patientèle regroupée par famille pour un suivi optimal</p>
                    </div>

                    <button className="flex items-center gap-3 px-8 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(8,131,149,0.3)] hover:scale-105 active:scale-95 transition-all">
                        <Plus size={18} /> Inscription rapide
                    </button>
                </div>

                {/* Toolbar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#088395] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="RECHERCHER PAR NOM D'ENFANT OU DE PARENT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] focus:bg-white/10 transition-all placeholder:text-white/10"
                        />
                    </div>

                    <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl lg:col-span-2">
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

                {/* Groups List */}
                <div className="space-y-8">
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-[#088395]" size={40} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Organisation de votre patientèle...</span>
                        </div>
                    ) : groupedPatients.length === 0 ? (
                        <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                            <Baby size={40} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Aucun patient trouvé</span>
                        </div>
                    ) : groupedPatients.map((group, groupIdx) => (
                        <motion.div
                            key={group.parentId || groupIdx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: groupIdx * 0.1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-4 pl-4 border-l-4 border-[#088395]">
                                <div className="w-10 h-10 bg-[#088395]/10 rounded-xl flex items-center justify-center text-[#088395]">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Famille <span className="text-white italic">{group.parentName}</span></h3>
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{group.kids.length} patient{group.kids.length > 1 ? 's' : ''} rattaché{group.kids.length > 1 ? 's' : ''}</p>
                                </div>
                                {/* Subscription status & activation button for this parent */}
                                {group.parentId && (() => {
                                    const parentUser = allUsers.find(u => u.id === group.parentId);
                                    if (!parentUser) return null;
                                    const isActive = parentUser.subscription?.isActive;
                                    return (
                                        <div className="ml-auto flex items-center gap-3">
                                            <div className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                                                isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                            )}>
                                                {isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {isActive ? 'Abonnement Actif' : 'En Attente Paiement'}
                                            </div>
                                            <button
                                                onClick={() => handleActivateSub(group.parentId, group.parentName, isActive, parentUser.subscription?.planType)}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                                                    isActive
                                                        ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white"
                                                        : "bg-[#088395]/10 text-[#088395] border-[#088395]/20 hover:bg-[#088395] hover:text-white"
                                                )}
                                                title={isActive ? "Désactiver cet abonnement" : "Activer et enregistrer le paiement"}
                                            >
                                                <CreditCard size={12} />
                                                {isActive ? 'Désactiver' : 'Activer & Payer'}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/2">
                                            <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Patient</th>
                                            <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 text-center">Âge</th>
                                            <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Dernière Glycémie</th>
                                            <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">État</th>
                                            <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {group.kids.map((p) => {
                                            const age = p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 'N/A';
                                            return (
                                                <tr key={p.id} className="group hover:bg-white/5 transition-colors">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white font-black group-hover:bg-[#088395] transition-all uppercase text-xs">
                                                                {(p.fullName || "P").charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black uppercase tracking-tighter">{p.fullName}</span>
                                                                <span className="text-[9px] font-bold text-[#088395] uppercase tracking-[0.2em]">{p.fileNumber || "SANS FICHE"}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-center text-xs font-bold text-white/40 uppercase tracking-widest">
                                                        {age} {age !== 'N/A' ? 'Ans' : ''}
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="text-xl font-black italic tracking-tighter text-white">
                                                            {p.lastGlucose || '--'} <span className="text-[9px] font-bold text-white/20 not-italic uppercase tracking-widest ml-1">mg/dL</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className={cn(
                                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest w-fit border",
                                                            p.healthStatus === 'Stable' ? "bg-success/10 text-success border-success/20" :
                                                                p.healthStatus === 'Surveillance' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                                                    "bg-accent/10 text-accent border-accent/20"
                                                        )}>
                                                            {p.healthStatus === 'Stable' && <CheckCircle2 size={10} />}
                                                            {p.healthStatus === 'Surveillance' && <Activity size={10} />}
                                                            {p.healthStatus === 'Critique' && <AlertCircle size={10} className="animate-pulse" />}
                                                            {p.healthStatus.toUpperCase()}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleDeletePatient(p.id, p.fullName)}
                                                                className="p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all group/trash shadow-sm border border-red-500/20"
                                                                title="Supprimer le patient"
                                                            >
                                                                <Trash2 size={14} className="group-hover/trash:scale-110 transition-transform" />
                                                            </button>
                                                            <Link href={`/doctor/patients/${p.id}`} className="p-3 bg-[#088395]/10 hover:bg-[#088395] hover:text-white rounded-xl text-[#088395] transition-all inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest group/btn border border-[#088395]/20">
                                                                Explorer <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </DashboardLayout>
    );
}
