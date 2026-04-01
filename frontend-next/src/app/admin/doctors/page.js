"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Users, Search, Filter, Download, Plus,
    MoreVertical, Eye, Edit, Lock, Trash2,
    Stethoscope, Building2, Mail, Activity,
    X, Save, AlertTriangle, CheckCircle2,
    FileText, FileDown, UserX, UserCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const initialDoctors = [];

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tous");
    const [isLoading, setIsLoading] = useState(true);

    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/Doctors');
            const mappedDoctors = response.data.map(d => ({
                id: d.id,
                name: d.name,
                clinic: d.clinic,
                email: d.email,
                patients: d.patients,
                subscription: d.subscription,
                status: d.status
            }));
            setDoctors(mappedDoctors);
        } catch (error) {
            console.error("Erreur de chargement des médecins API:", error);
            setDoctors(initialDoctors);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    // Form state pour Add/Edit
    const [formData, setFormData] = useState({ name: '', clinic: '', email: '', subscription: 'Pro' });

    const filteredDoctors = doctors.filter(d =>
        (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.clinic.toLowerCase().includes(searchQuery.toLowerCase()) || d.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === "Tous" || d.status === statusFilter)
    );

    const handleAddClick = () => {
        setFormData({ name: '', clinic: '', email: '', subscription: 'Pro' });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (doctor) => {
        setSelectedDoctor(doctor);
        setFormData({ name: doctor.name, clinic: doctor.clinic, email: doctor.email, subscription: doctor.subscription });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (doctor) => {
        setSelectedDoctor(doctor);
        setIsDeleteModalOpen(true);
    };

    const handleViewClick = (doctor) => {
        setSelectedDoctor(doctor);
        setIsViewModalOpen(true);
    };

    const handleToggleStatusClick = (doctor) => {
        setSelectedDoctor(doctor);
        setIsToggleStatusModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        const newStatus = selectedDoctor.status === 'Actif' ? 'Inactif' : 'Actif';
        try {
            const payload = { ...selectedDoctor, status: newStatus };
            await api.put(`/Doctors/${selectedDoctor.id}`, payload);
            setDoctors(doctors.map(d =>
                d.id === selectedDoctor.id ? { ...d, status: newStatus } : d
            ));
        } catch (error) {
            console.error("Erreur de statut", error);
        }
        setIsToggleStatusModalOpen(false);
    };

    const saveAdd = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                clinic: formData.clinic,
                email: formData.email,
                subscription: formData.subscription,
                patients: 0,
                status: "Actif"
            };
            await api.post('/Doctors', payload);
            fetchDoctors();
        } catch (error) {
            console.error("Erreur d'ajout", error);
        }
        setIsAddModalOpen(false);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...selectedDoctor,
                name: formData.name,
                clinic: formData.clinic,
                email: formData.email,
                subscription: formData.subscription
            };
            await api.put(`/Doctors/${selectedDoctor.id}`, payload);
            setDoctors(doctors.map(d =>
                d.id === selectedDoctor.id ? { ...d, ...formData } : d
            ));
        } catch (error) {
            console.error("Erreur d'édition", error);
        }
        setIsEditModalOpen(false);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/Doctors/${selectedDoctor.id}`);
            setDoctors(doctors.filter(d => d.id !== selectedDoctor.id));
        } catch (error) {
            console.error("Erreur de suppression", error);
        }
        setIsDeleteModalOpen(false);
    };

    const exportToCSV = () => {
        const BOM = '\uFEFF';
        const headers = ["Nom,Clinique,Email,Patients,Abonnement,Statut"];
        const rows = filteredDoctors.map(d =>
            `"${d.name}","${d.clinic}","${d.email}",${d.patients},"${d.subscription}","${d.status}"`
        );
        const csvContent = BOM + headers.concat(rows).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "medecins_diacare.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportMenuOpen(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(8, 131, 149);
        doc.text("Liste des Médecins Partenaires", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} - DiaCare Kids`, 14, 30);

        const tableColumn = ["Nom", "Clinique", "Email", "Patients", "Abonnement", "Statut"];
        const tableRows = filteredDoctors.map(d => [
            d.name, d.clinic, d.email, d.patients, d.subscription, d.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [8, 131, 149], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save("medecins_diacare.pdf");
        setIsExportMenuOpen(false);
    };

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 5.1 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                            Gestion des <span className="text-white/40">Médecins</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Module de contrôle du personnel médical agréé</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-4 py-5 px-10 bg-[#1E88E5] text-white font-black rounded-[24px] text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-blue-500/20 group"
                    >
                        <Plus size={24} className="group-hover:rotate-90 transition-transform" /> Nouveau Spécialiste
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl">
                    <div className="flex flex-1 min-w-[300px] relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#1E88E5] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher nom, clinique, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-8 text-sm font-bold text-white outline-none focus:border-[#1E88E5] transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#0b1b2b] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#1E88E5] transition-colors cursor-pointer text-white"
                        >
                            <option value="Tous">Tous les status</option>
                            <option value="Actif">Actif</option>
                            <option value="En Congé">En Congé</option>
                            <option value="Inactif">Inactif</option>
                        </select>
                        <div className="relative">
                            <button
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                className={cn("p-4 border rounded-2xl transition-all outline-none",
                                    isExportMenuOpen ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 hover:bg-white/10"
                                )}
                            >
                                <Download size={20} className={cn("transition-colors", isExportMenuOpen ? "text-[#1E88E5]" : "text-white/40")} />
                            </button>

                            <AnimatePresence>
                                {isExportMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-[110%] w-48 bg-[#0b1b2b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                                    >
                                        <button onClick={exportToCSV} className="w-full flex items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-widest text-white/80 hover:bg-white/5 hover:text-white transition-colors text-left">
                                            <FileText size={16} className="text-success" /> Format CSV
                                        </button>
                                        <button onClick={exportToPDF} className="w-full flex items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-widest text-white/80 hover:bg-white/5 hover:text-white transition-colors text-left border-t border-white/5">
                                            <FileDown size={16} className="text-error" /> Format PDF
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Table SECTION 5.2 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                                <tr>
                                    <th className="px-10 py-8">Spécialiste</th>
                                    <th className="px-10 py-8">Structure</th>
                                    <th className="px-10 py-8">Patients Suivis</th>
                                    <th className="px-10 py-8">Abonnement</th>
                                    <th className="px-10 py-8">Statut</th>
                                    <th className="px-10 py-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-bold">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-10 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-[#1E88E5]">
                                                <div className="w-10 h-10 border-4 border-t-[#1E88E5] border-white/10 rounded-full animate-spin mb-4" />
                                                <span className="text-white/40 text-xs font-black uppercase tracking-widest">Récupération des données API...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredDoctors.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-[#1E88E5] font-black text-xl group-hover:scale-110 transition-transform">
                                                    {doc.name.charAt(4) !== ' ' ? doc.name.charAt(4) : doc.name.charAt(5)}
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{doc.name}</div>
                                                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                        <Mail size={10} /> {doc.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/20"><Building2 size={16} /></div>
                                                <span className="text-sm font-bold uppercase tracking-tighter">{doc.clinic}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-2xl font-black">{doc.patients}</span>
                                                <span className="text-[8px] opacity-30 uppercase tracking-widest">Héros</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={cn(
                                                "text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest border",
                                                doc.subscription === 'Premium' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                    doc.subscription === 'Pro' ? "bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20" :
                                                        "bg-white/5 text-white/40 border-white/10"
                                            )}>
                                                {doc.subscription}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    doc.status === 'Actif' ? "bg-success" : doc.status === 'En Congé' ? "bg-yellow-500" : "bg-white/10"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] uppercase tracking-widest",
                                                    doc.status === 'Actif' ? "text-success" : doc.status === 'En Congé' ? "text-yellow-500" : "text-white/40"
                                                )}>{doc.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <ActionButton icon={<Eye size={16} />} color="hover:text-primary" onClick={() => handleViewClick(doc)} title="Voir" />
                                                <ActionButton icon={<Edit size={16} />} color="hover:text-yellow-500" onClick={() => handleEditClick(doc)} title="Modifier" />
                                                <ActionButton icon={<Lock size={16} />} color="hover:text-accent" onClick={() => handleToggleStatusClick(doc)} title="Changer Statut" />
                                                <ActionButton icon={<Trash2 size={16} />} color="hover:text-error" onClick={() => handleDeleteClick(doc)} title="Supprimer" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDoctors.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-10 py-12 text-center text-white/40">
                                            Aucun médecin trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL AJOUT/EDITION */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                        />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-lg w-full relative z-10 shadow-2xl"
                        >
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-white">
                                {isEditModalOpen ? "Modifier Médecin" : "Nouveau Spécialiste"}
                            </h2>
                            <form onSubmit={isEditModalOpen ? saveEdit : saveAdd} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Nom du médecin</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none" placeholder="Ex: Dr. Selim Ben Ahmed" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Structure / Clinique</label>
                                    <input type="text" required value={formData.clinic} onChange={e => setFormData({ ...formData, clinic: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Email</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Abonnement</label>
                                    <select value={formData.subscription} onChange={e => setFormData({ ...formData, subscription: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer">
                                        <option value="Basic">Basic</option>
                                        <option value="Pro">Pro</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-5 bg-[#1E88E5] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#1E88E5]/80 transition-colors mt-8">
                                    <Save size={20} /> {isEditModalOpen ? "Mettre à jour" : "Enregistrer"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL SUPPRESSION */}
            <AnimatePresence>
                {isDeleteModalOpen && selectedDoctor && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-error/20 rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-[0_0_50px_rgba(255,59,48,0.2)] text-center"
                        >
                            <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-white">Supprimer ?</h2>
                            <p className="text-white/60 text-sm mb-8">Êtes-vous sûr de vouloir supprimer le médecin <span className="text-white font-bold">{selectedDoctor.name}</span> ? Cette action est irréversible.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Annuler</button>
                                <button onClick={confirmDelete} className="flex-1 py-4 bg-error text-white rounded-2xl font-black uppercase tracking-widest hover:bg-error/80 transition-colors">Supprimer</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL BLOQUER/DEBLOQUER */}
            <AnimatePresence>
                {isToggleStatusModalOpen && selectedDoctor && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsToggleStatusModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl text-center"
                        >
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                                selectedDoctor.status === 'Actif' ? "bg-accent/10 text-accent" : "bg-success/10 text-success"
                            )}>
                                {selectedDoctor.status === 'Actif' ? <UserX size={40} /> : <UserCheck size={40} />}
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-white">
                                {selectedDoctor.status === 'Actif' ? 'Désactiver' : 'Réactiver'} ?
                            </h2>
                            <p className="text-white/60 text-sm mb-8">
                                Confirmez-vous le changement de statut pour <span className="text-white font-bold">{selectedDoctor.name}</span> ?
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setIsToggleStatusModalOpen(false)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Annuler</button>
                                <button
                                    onClick={confirmToggleStatus}
                                    className={cn(
                                        "flex-1 py-4 text-white rounded-2xl font-black uppercase tracking-widest transition-colors border",
                                        selectedDoctor.status === 'Actif' ? "bg-accent border-accent/20 hover:bg-accent/80" : "bg-success border-success/20 hover:bg-success/80"
                                    )}
                                >
                                    Confirmer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VIEW MODAL */}
            <AnimatePresence>
                {isViewModalOpen && selectedDoctor && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl"
                        >
                            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#1E88E5] font-black text-2xl">
                                    {selectedDoctor.name.charAt(4) !== ' ' ? selectedDoctor.name.charAt(4) : selectedDoctor.name.charAt(5)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">{selectedDoctor.name}</h2>
                                    <span className={cn(
                                        "text-[9px] uppercase tracking-widest",
                                        selectedDoctor.status === 'Actif' ? "text-success" : selectedDoctor.status === 'En Congé' ? "text-yellow-500" : "text-white/40"
                                    )}>{selectedDoctor.status}</span>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm text-white/80">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-white/40">Structure</span>
                                    <span className="font-bold">{selectedDoctor.clinic}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-white/40">Email</span>
                                    <span className="font-bold">{selectedDoctor.email}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-white/40">Patients Suivis</span>
                                    <span className="font-bold">{selectedDoctor.patients}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-white/40">Abonnement</span>
                                    <span className="font-bold text-[#1E88E5]">{selectedDoctor.subscription}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </DashboardLayout>
    );
}

const ActionButton = ({ icon, color, onClick, title }) => (
    <button
        onClick={onClick}
        title={title}
        type="button"
        className={cn(
            "p-3 bg-white/5 border border-white/5 rounded-xl text-white/40 transition-all hover:bg-white hover:border-white hover:shadow-xl",
            color
        )}
    >
        {icon}
    </button>
);
