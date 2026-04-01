"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Stethoscope, Plus, Search, Filter,
    MoreVertical, Eye, Edit3, Lock,
    Unlock, Mail, Users, ArrowUpRight,
    ChevronLeft, ChevronRight, CheckCircle2,
    XCircle, Activity, UserCheck, UserX, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function ClinicDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [stats, setStats] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [staffRes, statsRes] = await Promise.all([
                api.get('/ClinicManagement/staff'),
                api.get('/ClinicManagement/stats')
            ]);
            setDoctors(staffRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Error fetching clinic staff:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.post(`/ClinicManagement/approve-doctor/${id}`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'approbation");
        }
    };

    const handleReject = async (id) => {
        if (!confirm("Voulez-vous vraiment rejeter cette demande ?")) return;
        try {
            await api.post(`/ClinicManagement/reject-doctor/${id}`);
            fetchData();
        } catch (error) {
            alert("Erreur lors du rejet");
        }
    };

    const handleToggleStatus = async (doc) => {
        const newStatus = doc.status === 'Actif' ? 'Bloqué' : 'Actif';
        const action = newStatus === 'Bloqué' ? 'bloquer' : 'débloquer';
        if (!confirm(`Voulez-vous vraiment ${action} ce médecin ?`)) return;

        try {
            // Re-using the general user update or specific clinic endpoint if we had one.
            // Since clinics manage their staff, we can update the user status.
            // Note: UsersController.Update is [Authorize], so the Clinic JWT must allow it.
            await api.put(`/Users/${doc.id}`, { ...doc, status: newStatus });
            fetchData();
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Erreur lors du changement de statut");
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const name = doc.fullName || "";
        const email = doc.email || "";
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === "All" ||
            (filterStatus === "Active" && doc.status === "Actif") ||
            (filterStatus === "Pending" && doc.status === "En Attente") ||
            (filterStatus === "Blocked" && doc.status === "Bloqué");
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-10 pb-10 text-white">

                {/* Header with Stats */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/5 p-8 rounded-[40px] border border-white/10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[#088395]">
                            <Stethoscope size={24} />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic text-white">
                                Équipe <span className="text-white/40">Médicale</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gestion des accès et quotas de votre établissement</p>
                    </div>

                    {stats && (
                        <div className="flex gap-4">
                            <StatCard
                                label="Médecins"
                                used={stats.usedDoctors}
                                max={stats.maxDoctors}
                                icon={<Stethoscope size={20} />}
                                color="text-[#088395]"
                            />
                            <StatCard
                                label="Patients"
                                used={stats.usedPatients}
                                max={stats.maxPatients}
                                icon={<Users size={20} />}
                                color="text-[#1E88E5]"
                            />
                        </div>
                    )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#088395] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="RECHERCHER (NOM, EMAIL...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] focus:bg-white/10 transition-all placeholder:text-white/10"
                        />
                    </div>

                    <div className="flex gap-3 p-2 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
                        {['All', 'Pending', 'Active', 'Blocked'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filterStatus === s ? "bg-white text-[#088395] shadow-xl" : "text-white/40 hover:text-white"
                                )}
                            >
                                {s === 'All' ? 'Tous' : s === 'Pending' ? 'En Attente' : s === 'Active' ? 'Actifs' : 'Bloqués'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Médecin</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Date Inscr.</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Statut</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-t-[#088395] border-white/10 rounded-full animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Chargement...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredDoctors.map((doc, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={doc.id}
                                        className={cn(
                                            "group hover:bg-white/5 transition-colors",
                                            doc.status === 'En Attente' && "bg-[#088395]/5"
                                        )}
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#088395] font-black text-xl border border-white/10 group-hover:scale-110 transition-transform">
                                                    {(doc.fullName || 'M').charAt(0)}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black uppercase tracking-tighter leading-none">{doc.fullName}</span>
                                                    <span className="text-[10px] font-bold text-white/20 lowercase tracking-normal">{doc.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest w-fit border",
                                                doc.status === 'Actif' ? "bg-success/10 text-success border-success/20" :
                                                    doc.status === 'En Attente' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                        "bg-accent/10 text-accent border-accent/20"
                                            )}>
                                                {doc.status === 'Actif' ? <CheckCircle2 size={12} /> :
                                                    doc.status === 'En Attente' ? <AlertCircle size={12} /> :
                                                        <XCircle size={12} />}
                                                {doc.status}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-end gap-3">
                                                {doc.status === 'En Attente' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(doc.id)}
                                                            className="flex items-center gap-2 px-6 py-3 bg-success hover:bg-success/80 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
                                                        >
                                                            <UserCheck size={14} /> Approuver
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(doc.id)}
                                                            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/80 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
                                                        >
                                                            <UserX size={14} /> Refuser
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleStatus(doc)}
                                                            className={cn(
                                                                "p-4 rounded-xl transition-all shadow-lg",
                                                                doc.status === 'Actif' ? "bg-accent/10 text-accent hover:bg-accent" : "bg-success/10 text-success hover:bg-success",
                                                                "hover:text-white"
                                                            )}
                                                            title={doc.status === 'Actif' ? "Bloquer" : "Débloquer"}
                                                        >
                                                            {doc.status === 'Actif' ? <Lock size={18} /> : <Unlock size={18} />}
                                                        </button>
                                                        <button className="p-4 bg-white/5 hover:bg-[#088395] rounded-xl text-white transition-all shadow-lg" title="Plus d'options">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                    </div>
                                                )}
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

const StatCard = ({ label, used, max, icon, color }) => (
    <div className="px-8 py-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6 min-w-[200px]">
        <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center", color)}>
            {icon}
        </div>
        <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{label}</div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black italic">{used}</span>
                <span className="text-sm font-bold text-white/20">/ {max === -1 ? '∞' : max}</span>
            </div>
        </div>
    </div>
);

