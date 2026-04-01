"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Users, Search, Filter,
    MoreVertical, Eye, Edit3, Mail,
    CheckCircle2, AlertCircle, Baby,
    UserPlus, Shield, X, Save,
    ArrowRight, Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function ClinicPatients() {
    const [patientGroups, setPatientGroups] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [patientsRes, staffRes] = await Promise.all([
                api.get('/ClinicManagement/patients'),
                api.get('/ClinicManagement/staff')
            ]);
            setPatientGroups(patientsRes.data);
            setDoctors(staffRes.data.filter(d => d.status === "Actif"));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openAssignModal = (patient) => {
        setSelectedPatient(patient);
        setSelectedDoctorId(patient.associatedDoctorId || "");
        setIsAssignModalOpen(true);
    };

    const handleAssignDoctor = async () => {
        if (!selectedDoctorId) return;
        setIsAssigning(true);
        try {
            await api.post('/ClinicManagement/assign-doctor', {
                patientId: selectedPatient.id,
                doctorId: selectedDoctorId
            });
            await fetchData();
            setIsAssignModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'assignation");
        } finally {
            setIsAssigning(false);
        }
    };

    const filteredGroups = patientGroups.filter(group => {
        if (!group || !group.parent) return false;
        const parentName = (group.parent.fullName || "").toLowerCase();
        const childrenNames = (group.children || []).map(c => (c?.fullName || "").toLowerCase()).join(" ");
        const query = searchQuery.toLowerCase();
        return parentName.includes(query) || childrenNames.includes(query);
    });

    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-10 pb-10 text-white">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/5 p-8 rounded-[40px] border border-white/10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[#1E88E5]">
                            <Users size={24} />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic text-white">
                                Patients <span className="text-white/40">& Familles</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Suivi des patients et affectation des médecins</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#1E88E5] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="RECHERCHER PARENT OU ENFANT..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#1E88E5] focus:bg-white/10 transition-all placeholder:text-white/10"
                    />
                </div>

                {/* Patient List */}
                <div className="grid grid-cols-1 gap-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4 py-20">
                            <div className="w-10 h-10 border-4 border-t-[#1E88E5] border-white/10 rounded-full animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Chargement des dossiers...</span>
                        </div>
                    ) : filteredGroups.map((group, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={group.parent.id}
                            className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden group hover:border-white/20 transition-all"
                        >
                            <div className="p-8 flex flex-col md:flex-row gap-8">
                                {/* Parent Info */}
                                <div className="md:w-1/3 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-[#1E88E5]/10 rounded-2xl flex items-center justify-center text-[#1E88E5] border border-[#1E88E5]/20 font-black text-2xl">
                                            {group.parent.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-widest text-[#1E88E5]">Parent / Tuteur</div>
                                            <div className="text-xl font-black uppercase tracking-tighter italic">{group.parent.fullName}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/40 text-[10px] uppercase font-bold tracking-widest pl-2">
                                        <Mail size={12} /> {group.parent.email}
                                    </div>
                                </div>

                                {/* Children Info */}
                                <div className="flex-1 space-y-4 border-t md:border-t-0 md:border-l border-white/5 md:pl-8 pt-6 md:pt-0">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 flex items-center gap-2">
                                        <Baby size={14} /> Enfants Suivis ({group.children.length})
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {group.children.map(child => {
                                            const assignedDoc = doctors.find(d => d.id === child.associatedDoctorId);
                                            return (
                                                <div key={child.id} className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-colors">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{child.fullName}</div>
                                                            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Age: {child.age || 'N/A'} ans</div>
                                                        </div>
                                                        <button
                                                            onClick={() => openAssignModal(child)}
                                                            className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-[#088395] hover:bg-white/10 transition-all"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center border",
                                                            assignedDoc ? "bg-[#088395]/10 text-[#088395] border-[#088395]/20" : "bg-white/5 text-white/10 border-white/5"
                                                        )}>
                                                            <Stethoscope size={14} />
                                                        </div>
                                                        <div>
                                                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Médecin Assigné</div>
                                                            <div className={cn(
                                                                "text-[11px] font-black uppercase tracking-tight",
                                                                assignedDoc ? "text-white" : "text-white/10 italic"
                                                            )}>
                                                                {assignedDoc ? `Dr. ${assignedDoc.fullName}` : "Aucun assigné"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {group.children.length === 0 && (
                                            <div className="col-span-2 py-4 text-[10px] font-bold text-white/10 uppercase italic">
                                                Aucun enfant enregistré pour ce parent.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Assignment Modal */}
            <AnimatePresence>
                {isAssignModalOpen && selectedPatient && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => !isAssigning && setIsAssignModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[40px] p-10 max-w-lg w-full relative z-10 shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-[#088395]/10 rounded-2xl flex items-center justify-center text-[#088395]">
                                    <UserPlus size={28} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#088395]">Assignation Médicale</div>
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                        Associer un médecin
                                    </h2>
                                </div>
                            </div>

                            <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2">Patient</div>
                                <div className="text-xl font-black uppercase italic">{selectedPatient.fullName}</div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pl-4 block">Sélectionner le médecin</label>
                                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {doctors.map(doc => (
                                        <button
                                            key={doc.id}
                                            onClick={() => setSelectedDoctorId(doc.id)}
                                            className={cn(
                                                "flex items-center justify-between p-5 rounded-2xl border transition-all text-left",
                                                selectedDoctorId === doc.id
                                                    ? "bg-white border-white text-[#0b1b2b]"
                                                    : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                                                    selectedDoctorId === doc.id ? "bg-[#0b1b2b]/10 text-[#0b1b2b]" : "bg-white/10 text-[#088395]"
                                                )}>
                                                    {doc.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black uppercase tracking-tighter">Dr. {doc.fullName}</div>
                                                    <div className={cn("text-[9px] font-bold uppercase tracking-widest opacity-40", selectedDoctorId === doc.id ? "text-[#0b1b2b]" : "text-white")}>
                                                        Médecin Actif
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedDoctorId === doc.id && <CheckCircle2 size={20} />}
                                        </button>
                                    ))}
                                    {doctors.length === 0 && (
                                        <div className="text-center py-6 text-[10px] font-black uppercase tracking-widest text-[#FF7043] italic">
                                            Aucun médecin actif disponible. <br />Veuillez d'abord approuver des médecins.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button
                                    disabled={isAssigning}
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="flex-1 py-5 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
                                >
                                    Annuler
                                </button>
                                <button
                                    disabled={isAssigning || !selectedDoctorId}
                                    onClick={handleAssignDoctor}
                                    className="flex-1 py-5 bg-[#088395] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                                >
                                    {isAssigning ? (
                                        <div className="w-5 h-5 border-2 border-t-white border-white/20 rounded-full animate-spin" />
                                    ) : (
                                        <><Save size={16} /> Confirmer</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
