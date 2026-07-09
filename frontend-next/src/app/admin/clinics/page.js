"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Building2, Search, Filter, Download, Plus,
    MoreVertical, Eye, Edit, Lock, Trash2, ChevronRight,
    MapPin, Mail, Users, X, Save, AlertTriangle, CheckCircle2,
    FileText, FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import api from '@/lib/api';

const initialClinics = [];

export default function AdminClinics() {
    const { t } = useLanguage();
    const [clinics, setClinics] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tous");
    const [isLoading, setIsLoading] = useState(true);

    const fetchClinics = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/Clinics');
            const mappedClinics = response.data.map(c => ({
                id: c.id,
                name: c.fullName || 'Clinique sans nom',
                manager: c.email || 'N/A', // Using email as manager/contact for now
                email: c.email,
                doctors: c.subscription?.maxDoctors || 0,
                patients: c.subscription?.maxPatients || 0,
                subscription: c.subscription?.planType || 'Standard',
                status: c.status || 'Active'
            }));
            setClinics(mappedClinics);
        } catch (error) {
            console.error("Erreur de chargement des cliniques API:", error);
            setClinics(initialClinics);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClinics();
    }, []);

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);

    // Form state pour Add/Edit
    const [formData, setFormData] = useState({ name: '', manager: '', email: '', subscription: 'Pro' });

    const filteredClinics = clinics.filter(c => {
        const name = (c.name || "").toLowerCase();
        const manager = (c.manager || "").toLowerCase();
        const query = searchQuery.toLowerCase();

        return (name.includes(query) || manager.includes(query)) &&
            (statusFilter === "Tous" || c.status === statusFilter);
    });

    const handleAddClick = () => {
        setFormData({ name: '', manager: '', email: '', subscription: 'Pro' });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (clinic) => {
        setSelectedClinic(clinic);
        setFormData({ name: clinic.name, manager: clinic.manager, email: clinic.email, subscription: clinic.subscription });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (clinic) => {
        setSelectedClinic(clinic);
        setIsDeleteModalOpen(true);
    };

    const handleViewClick = (clinic) => {
        setSelectedClinic(clinic);
        setIsViewModalOpen(true);
    };

    const handleToggleStatus = async (clinic) => {
        const newStatus = clinic.status === 'Active' ? 'Suspendue' : 'Active';
        try {
            // Fetch the full User record from the backend before updating
            const res = await api.get(`/Clinics/${clinic.id}`);
            const fullClinic = res.data;
            fullClinic.status = newStatus;
            await api.put(`/Clinics/${clinic.id}`, fullClinic);
            setClinics(clinics.map(c =>
                c.id === clinic.id ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            console.error("Erreur de statut", error);
        }
    };

    const saveAdd = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                fullName: formData.name,
                email: formData.email,
                role: "Clinique",
                status: "Actif",
                subscription: {
                    planType: formData.subscription,
                    isActive: true,
                    maxDoctors: formData.subscription === 'Premium' ? -1 : formData.subscription === 'Pro' ? 7 : 3,
                    maxPatients: formData.subscription === 'Premium' ? -1 : formData.subscription === 'Pro' ? 10 : 3,
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                }
            };
            await api.post('/Clinics', payload);
            fetchClinics(); // Refresh with DB ID
        } catch (error) {
            console.error("Erreur d'ajout", error);
        }
        setIsAddModalOpen(false);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            // Fetch the full User record so we send a complete object
            const res = await api.get(`/Clinics/${selectedClinic.id}`);
            const fullClinic = res.data;
            
            // Update only the editable fields
            fullClinic.fullName = formData.name;
            fullClinic.email = formData.email;
            if (fullClinic.subscription) {
                fullClinic.subscription.planType = formData.subscription;
            } else {
                fullClinic.subscription = { planType: formData.subscription, isActive: true };
            }
            
            await api.put(`/Clinics/${selectedClinic.id}`, fullClinic);
            setClinics(clinics.map(c =>
                c.id === selectedClinic.id ? { ...c, ...formData } : c
            ));
        } catch (error) {
            console.error("Erreur d'édition", error);
        }
        setIsEditModalOpen(false);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/Clinics/${selectedClinic.id}`);
            setClinics(clinics.filter(c => c.id !== selectedClinic.id));
        } catch (error) {
            console.error("Erreur de suppression", error);
        }
        setIsDeleteModalOpen(false);
    };

    const exportToCSV = () => {
        // Ajout du BOM pour l'encodage UTF-8 sous Excel
        const BOM = '\uFEFF';
        const headers = ["Nom Clinique,Responsable,Email,Médecins,Patients,Abonnement,Statut"];
        const rows = filteredClinics.map(c =>
            `"${c.name}","${c.manager}","${c.email}",${c.doctors},${c.patients},"${c.subscription}","${c.status}"`
        );
        const csvContent = BOM + headers.concat(rows).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "cliniques_diacare.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportMenuOpen(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Titre
        doc.setFontSize(18);
        doc.setTextColor(8, 131, 149); // Couleur #088395
        doc.text("Liste des Cliniques Partenaires", 14, 22);

        // Date
        doc.setFontSize(10);
        doc.setTextColor(1.50);
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} - DiaCare Kids`, 14, 30);

        const tableColumn = ["Nom", "Responsable", "Email", "Médecins", "Patients", "Abonnement", "Statut"];
        const tableRows = filteredClinics.map(c => [
            c.name, c.manager, c.email, c.doctors, c.patients, c.subscription, c.status
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

        doc.save("cliniques_diacare.pdf");
        setIsExportMenuOpen(false);
    };

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                            Gestion des <span className="text-white/40">Cliniques</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Module de supervision des infrastructures médicales</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-4 py-5 px-10 bg-white text-[#1E88E5] font-black rounded-[24px] text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-white/10 group"
                    >
                        <Plus size={24} className="group-hover:rotate-90 transition-transform" /> Ajouter Clinique
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl">
                    <div className="flex flex-1 min-w-[300px] relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#1E88E5] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher clinique, responsable..."
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
                            <option value="Active">Active</option>
                            <option value="Suspendue">Suspendue</option>
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
                                        <button onClick={exportToCSV} className="w-full flex items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-widest text-white/0.80 hover:bg-white/5 hover:text-white transition-colors text-left">
                                            <FileText size={16} className="text-success" /> Format CSV
                                        </button>
                                        <button onClick={exportToPDF} className="w-full flex items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-widest text-white/0.80 hover:bg-white/5 hover:text-white transition-colors text-left border-t border-white/5">
                                            <FileDown size={16} className="text-error" /> Format PDF
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                                <tr>
                                    <th className="px-10 py-8">Nom Clinique</th>
                                    <th className="px-10 py-8">Responsable</th>
                                    <th className="px-10 py-8">Data</th>
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
                                ) : filteredClinics.map((clinic) => (
                                    <tr key={clinic.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-[#1E88E5]/10 rounded-2xl flex items-center justify-center text-[#1E88E5] border border-[#1E88E5]/20 group-hover:scale-110 transition-transform">
                                                    <Building2 size={24} />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{clinic.name}</div>
                                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                                                        <MapPin size={10} /> ID-CLINIC-{(clinic.id || "").toString().slice(-4)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div>
                                                <div className="text-sm">{clinic.manager}</div>
                                                <div className="text-[10px] text-white/40 lowercase italic font-medium pt-1">{clinic.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-lg font-black">{clinic.doctors}</div>
                                                    <div className="text-[8px] opacity-30 uppercase tracking-widest">Médecins</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-black">{clinic.patients}</div>
                                                    <div className="text-[8px] opacity-30 uppercase tracking-widest">Patients</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={cn(
                                                "text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest border",
                                                clinic.subscription === 'Premium' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                    clinic.subscription === 'Pro' ? "bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20" :
                                                        "bg-white/5 text-white/40 border-white/10"
                                            )}>
                                                {clinic.subscription}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    clinic.status === 'Active' ? "bg-success shadow-[0_0_10px_rgba(52,199,89,0.5)]" : "bg-accent shadow-[0_0_10px_rgba(255,112,67,0.5)]"
                                                )} />
                                                <span className={cn(
                                                    "text-[9px] uppercase tracking-widest",
                                                    clinic.status === 'Active' ? "text-success" : "text-accent"
                                                )}>{clinic.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <ActionButton icon={<Eye size={16} />} color="hover:text-[#1E88E5] text-white/40" onClick={() => handleViewClick(clinic)} title="Voir" />
                                                <ActionButton icon={<Edit size={16} />} color="hover:text-yellow-500 text-white/40" onClick={() => handleEditClick(clinic)} title="Modifier" />
                                                <ActionButton icon={<Lock size={16} />} color="hover:text-accent text-white/40" onClick={() => handleToggleStatus(clinic)} title="Bloquer/Débloquer" />
                                                <ActionButton icon={<Trash2 size={16} />} color="hover:text-error text-white/40" onClick={() => handleDeleteClick(clinic)} title="Supprimer" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredClinics.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-10 py-12 text-center text-white/40">
                                            Aucune clinique trouvée.
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/0.80 backdrop-blur-sm"
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                        />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-lg w-full relative z-10 shadow-2xl"
                        >
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-white">
                                {isEditModalOpen ? "Modifier Clinique" : "Nouvelle Clinique"}
                            </h2>
                            <form onSubmit={isEditModalOpen ? saveEdit : saveAdd} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Nom de la clinique</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Responsable</label>
                                    <input type="text" required value={formData.manager} onChange={e => setFormData({ ...formData, manager: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none" />
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
                                <button type="submit" className="w-full py-5 bg-[#1E88E5] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#1E88E5]/0.80 transition-colors mt-8">
                                    <Save size={20} /> {isEditModalOpen ? "Mettre à jour" : "Enregistrer"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL SUPPRESSION */}
            <AnimatePresence>
                {isDeleteModalOpen && selectedClinic && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/0.80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-error/20 rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-[0_0_50px_rgba(255,59,48,0.2)] text-center"
                        >
                            <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-white">Supprimer ?</h2>
                            <p className="text-white/60 text-sm mb-8">Êtes-vous sûr de vouloir supprimer la clinique <span className="text-white font-bold">{selectedClinic.name}</span> ? Cette action est irréversible.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Annuler</button>
                                <button onClick={confirmDelete} className="flex-1 py-4 bg-error text-white rounded-2xl font-black uppercase tracking-widest hover:bg-error/0.80 transition-colors">Supprimer</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VIEW MODAL */}
            <AnimatePresence>
                {isViewModalOpen && selectedClinic && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/0.80 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl"
                        >
                            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-[#1E88E5]/10 rounded-2xl flex items-center justify-center text-[#1E88E5]">
                                    <Building2 size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">{selectedClinic.name}</h2>
                                    <span className={cn("text-[9px] uppercase tracking-widest", selectedClinic.status === 'Active' ? "text-success" : "text-accent")}>{selectedClinic.status}</span>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm text-white/80">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-white/40">Responsable</span>
                                    <span className="font-bold">{selectedClinic.manager}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-white/40">Email</span>
                                    <span className="font-bold">{selectedClinic.email}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-white/40">Médecins Inscrits</span>
                                    <span className="font-bold">{selectedClinic.doctors}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-white/40">Patients Inscrits</span>
                                    <span className="font-bold">{selectedClinic.patients}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-white/40">Abonnement</span>
                                    <span className="font-bold text-[#1E88E5]">{selectedClinic.subscription}</span>
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
            "p-3 bg-white/5 border border-white/5 rounded-xl transition-all hover:bg-white hover:border-white hover:shadow-xl",
            color
        )}
    >
        {icon}
    </button>
);
