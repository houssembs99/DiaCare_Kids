"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
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

export default function DoctorTreatments() {
    const [searchQuery, setSearchQuery] = useState("");
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPatientId, setModalPatientId] = useState("");
    const [modalActions, setModalActions] = useState([]);
    const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSaveTreatment = async () => {
        try {
            // Retrieve current patient's info (we need to know current medical notes string if possible, or override)
            // Note: Since this is an MVP, we just overwrite or push a simple note directly.
            const actionText = `Prévu le ${modalDate} : ${modalActions.join(', ')}`;
            await api.put(`/doctor-management/update-medical-notes/${modalPatientId}`, {
                Notes: actionText
            });
            setIsModalOpen(false);
            setModalPatientId("");
            setModalActions([]);
            alert("Traitement planifié avec succès !");
            fetchTreatments(); // Refresh list immediately after valid plan
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la planification.");
        }
    };

    const fetchTreatments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctor-management/patients');
            const patients = res.data;
            const generatedTreatments = patients.map((p, idx) => ({
                id: p.id || idx,
                patientId: p.id,
                patient: p.fullName || 'Inconnu',
                start: p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('fr-FR') : 'Inconnue',
                type: p.medicalNotes?.length > 10 ? 'Traitement Personnalisé' : 'Schéma Initial',
                dose: p.medicalNotes?.length > 10 ? 'Planifié' : 'À ajuster',
                freq: 'Selon plan',
                lastMod: p.medicalNotes?.length > 10 ? 'Récent' : '—',
                notesPreview: p.medicalNotes || ''
            }));
            setTreatments(generatedTreatments);
        } catch (err) {
            console.error("Failed to fetch treatments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTreatments();
    }, []);

    const filteredTreatments = treatments.filter(t =>
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
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-3 px-8 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all">
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
                                                <Link href={`/doctor/patients/${t.patientId}`} className="p-4 bg-white/5 hover:bg-[#088395] rounded-xl text-white transition-all group/btn" title="Voir le Dossier Patient">
                                                    <ArrowUpRight size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                </Link>
                                                <Link href={`/doctor/patients/${t.patientId}`} className="p-4 bg-white/5 hover:bg-white hover:text-black rounded-xl text-white/20 transition-all" title="Éditer le Traitement">
                                                    <Edit3 size={18} />
                                                </Link>
                                                <Link href={`/doctor/patients/${t.patientId}`} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-white/20 transition-all" title="Historique">
                                                    <History size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal Planifier Traitement */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0b1b2b] border border-white/10 rounded-[32px] w-full max-w-2xl p-8 shadow-2xl relative"
                    >
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-all">
                            <Plus size={24} className="rotate-45" />
                        </button>
                        
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-8">Planifier un <span className="text-[#088395]">Traitement</span></h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Choisir le Patient</label>
                                <select 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#088395] text-white"
                                    value={modalPatientId}
                                    onChange={(e) => setModalPatientId(e.target.value)}
                                >
                                    <option value="" className="bg-[#0b1b2b]">-- Sélectionner un patient --</option>
                                    {treatments.map(t => (
                                        <option key={t.patientId} value={t.patientId} className="bg-[#0b1b2b]">
                                            {t.patient}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Actions à effectuer</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        "Adaptation doses Rapide",
                                        "Adaptation doses Lente",
                                        "Changement de schéma",
                                        "Bilan sanguin (HbA1c)",
                                        "RDV de contrôle rapproché",
                                        "Éducation diététique"
                                    ].map(action => (
                                        <label key={action} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="accent-[#088395] w-4 h-4 cursor-pointer"
                                                checked={modalActions.includes(action)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setModalActions([...modalActions, action]);
                                                    else setModalActions(modalActions.filter(a => a !== action));
                                                }}
                                            />
                                            <span className="text-xs font-bold">{action}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Date d'application</label>
                                <input 
                                    type="date" 
                                    value={modalDate}
                                    onChange={(e) => setModalDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#088395] text-white"
                                />
                            </div>

                            <button 
                                onClick={handleSaveTreatment}
                                disabled={!modalPatientId || modalActions.length === 0}
                                className="w-full py-5 bg-[#088395] hover:bg-[#066a7a] disabled:bg-[#088395]/50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all mt-4"
                            >
                                Valider la Planification
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
