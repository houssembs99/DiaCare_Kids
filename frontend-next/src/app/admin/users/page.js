"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Users, Search, Plus, Filter, MoreVertical,
    Shield, Key, Lock, UserX, UserCheck,
    Mail, Clock, ShieldAlert, X, Save, AlertTriangle,
    Download, FileText, FileDown, Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const initialUsers = [];

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("Tous");
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/Users');
            // Mapping backend model field "fullName" to "name" for the frontend display
            const mappedUsers = response.data.map(u => ({
                id: u.id,
                name: u.fullName || 'Utilisateur',
                email: u.email,
                role: u.role,
                status: u.status || 'Actif',
                subscription: u.subscription, // Full subscription data
                lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : 'Jamais'
            }));
            setUsers(mappedUsers);
        } catch (error) {
            console.error("Erreur de chargement des utilisateurs API:", error);
            setUsers(initialUsers); // Fallback aux fausses données en cas d'erreur de connexion API
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Admin',
        newPassword: '',
        status: 'Actif',
        planType: 'Mensuel',
        maxDoctors: 3,
        maxPatients: 3,
        maxKids: 1,
        subscriptionIsActive: false,
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        associatedClinicId: '',
        associatedDoctorId: '',
        associatedParentId: ''
    });

    const filteredUsers = users.filter(u =>
        (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (roleFilter === "Tous" || u.role.includes(roleFilter))
    );

    const handleAddClick = () => {
        setFormData({ 
            name: '', 
            email: '', 
            role: 'Admin', 
            newPassword: '', 
            status: 'Actif',
            planType: 'Mensuel',
            maxDoctors: 3, 
            maxPatients: 3,
            maxKids: 1,
            subscriptionIsActive: false,
            expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            associatedClinicId: '',
            associatedDoctorId: '',
            associatedParentId: ''
        });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            newPassword: '', // Stay empty unless resetting
            status: user.status,
            planType: user.subscription?.planType || 'Mensuel',
            maxDoctors: user.subscription?.maxDoctors ?? 3,
            maxPatients: user.subscription?.maxPatients ?? 3,
            maxKids: user.subscription?.maxKids ?? 1,
            subscriptionIsActive: user.subscription?.isActive || false,
            expiryDate: user.subscription?.expiryDate ? new Date(user.subscription.expiryDate).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            associatedClinicId: user.associatedClinicId || '',
            associatedDoctorId: user.associatedDoctorId || '',
            associatedParentId: user.associatedParentId || ''
        });
        setIsEditModalOpen(true);
    };

    const handleToggleStatusClick = (user) => {
        setSelectedUser(user);
        setIsToggleStatusModalOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/Users/${selectedUser.id}`);
            setUsers(users.filter(u => u.id !== selectedUser.id));
        } catch (error) {
            console.error("Erreur de suppression", error);
        }
        setIsDeleteModalOpen(false);
    };

    const confirmToggleStatus = async () => {
        const newStatus = selectedUser.status === 'Actif' ? 'Bloqué' : 'Actif';
        try {
            const apiPayload = { id: selectedUser.id, fullName: selectedUser.name, email: selectedUser.email, role: selectedUser.role, status: newStatus };
            await api.put(`/Users/${selectedUser.id}`, apiPayload);
            setUsers(users.map(u =>
                u.id === selectedUser.id ? { ...u, status: newStatus } : u
            ));
        } catch (error) {
            console.error("Erreur statut", error);
        }
        setIsToggleStatusModalOpen(false);
    };

    const saveAdd = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                fullName: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                newPassword: formData.newPassword,
                associatedClinicId: formData.associatedClinicId || null,
                associatedDoctorId: formData.associatedDoctorId || null,
                associatedParentId: formData.associatedParentId || null
            };
            await api.post('/Users', payload);
            fetchUsers(); 
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Erreur lors de l'ajout", error);
            alert("Erreur lors de la création de l'utilisateur.");
        }
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            const isClinic = formData.role === 'Clinique' || formData.role === 'Agent Clinique';
            const isParent = formData.role === 'Parent';
            const hasSub = isClinic || isParent;

            let subscriptionPayload = null;
            if (hasSub) {
                subscriptionPayload = {
                    planType: formData.planType || 'Mensuel',
                    maxDoctors: isClinic ? parseInt(formData.maxDoctors ?? 3) : 0,
                    maxPatients: isClinic ? parseInt(formData.maxPatients ?? 3) : 0,
                    maxKids: isParent ? parseInt(formData.maxKids ?? 1) : 1,
                    isActive: formData.subscriptionIsActive,
                    expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : new Date(new Date().setMonth(new Date().getMonth() + 1))
                };
            }

            const payload = {
                id: selectedUser.id,
                fullName: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                newPassword: formData.newPassword || null,
                associatedClinicId: formData.associatedClinicId || null,
                associatedDoctorId: formData.associatedDoctorId || null,
                associatedParentId: formData.associatedParentId || null,
                subscription: subscriptionPayload
            };
            await api.put(`/Users/${selectedUser.id}`, payload);
            fetchUsers();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Erreur d'édition", error);
            alert("Erreur lors de la mise à jour de l'utilisateur.");
        }
    };

    const exportToCSV = () => {
        const BOM = '\uFEFF';
        const headers = ["Nom,Email,Rôle,Statut,Dernière Connexion"];
        const rows = filteredUsers.map(u =>
            `"${u.name}","${u.email}","${u.role}","${u.status}","${u.lastLogin}"`
        );
        const csvContent = BOM + headers.concat(rows).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "utilisateurs_diacare.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportMenuOpen(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(8, 131, 149);
        doc.text("Liste des Utilisateurs du Système", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} - DiaCare Kids`, 14, 30);

        const tableColumn = ["Nom Complet", "Email", "Rôle", "Statut", "Dernière Connexion"];
        const tableRows = filteredUsers.map(u => [
            u.name, u.email, u.role, u.status, u.lastLogin
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

        doc.save("utilisateurs_diacare.pdf");
        setIsExportMenuOpen(false);
    };

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                            Utilisateurs <span className="text-white/40">Système</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gestion des accès et des rôles de la plateforme</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-4 py-5 px-10 bg-white text-[#1E88E5] font-black rounded-[24px] text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl group"
                    >
                        <Plus size={24} /> Créer Utilisateur
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl">
                    <div className="flex flex-1 min-w-[300px] relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-8 text-sm font-bold text-white outline-none focus:border-[#1E88E5] transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="appearance-none bg-[#0b1b2b] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#1E88E5] transition-colors cursor-pointer text-white"
                            >
                                <option value="Tous">Tous Rôles</option>
                                <option value="Admin">Admin</option>
                                <option value="Médecin">Médecin</option>
                                <option value="Clinique">Clinique</option>
                                <option value="Parent">Parent</option>
                            </select>
                            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        </div>
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

                {/* Table */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold">
                            <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                                <tr>
                                    <th className="px-10 py-8">Utilisateur</th>
                                    <th className="px-10 py-8">Rôle</th>
                                    <th className="px-10 py-8">Statut</th>
                                    <th className="px-10 py-8">Dernière Connexion</th>
                                    <th className="px-10 py-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-[#1E88E5]">
                                                <div className="w-10 h-10 border-4 border-t-[#1E88E5] border-white/10 rounded-full animate-spin mb-4" />
                                                <span className="text-white/40 text-xs font-black uppercase tracking-widest">Récupération des données API...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white font-black text-xl group-hover:scale-110 group-hover:bg-[#1E88E5] transition-all">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{user.name}</div>
                                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                                                        <Mail size={10} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center border",
                                                    user.role.includes('Admin') ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20"
                                                )}>
                                                    <Shield size={16} />
                                                </div>
                                                <span className="text-sm uppercase tracking-tighter font-black">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    user.status === 'Actif' ? "bg-success shadow-[0_0_10px_rgba(52,199,89,0.5)]" : "bg-accent shadow-[0_0_10px_rgba(255,112,67,0.5)]"
                                                )} />
                                                <span className={cn(
                                                    "text-[9px] uppercase tracking-widest font-black",
                                                    user.status === 'Actif' ? "text-success" : "text-accent"
                                                )}>{user.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 text-white/30 font-black text-[10px] uppercase tracking-widest">
                                                <Clock size={14} /> {user.lastLogin}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <ActionButton
                                                    icon={user.status === 'Actif' ? <UserX size={16} /> : <UserCheck size={16} />}
                                                    color={user.status === 'Actif' ? "hover:text-accent text-white/40" : "hover:text-success text-white/40"}
                                                    onClick={() => handleToggleStatusClick(user)}
                                                    title={user.status === 'Actif' ? "Bloquer" : "Débloquer"}
                                                />
                                                <ActionButton icon={<Edit3 size={16} />} color="hover:text-primary text-white/40" onClick={() => handleEditClick(user)} title="Modifier" />
                                                <ActionButton
                                                    icon={<Trash2 size={16} />}
                                                    color="hover:text-error text-white/40"
                                                    onClick={() => handleDeleteClick(user)}
                                                    title="Supprimer"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-12 text-center text-white/40">Aucun utilisateur trouvé.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL AJOUT/EDITION Utilisateur */}
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
                                {isEditModalOpen ? "Modifier l'Utilisateur" : "Nouvel Utilisateur"}
                            </h2>
                            <form onSubmit={isEditModalOpen ? saveEdit : saveAdd} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Nom complet</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Email</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Rôle</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer">
                                        <option value="Admin">Admin</option>
                                        <option value="Medecin">Médecin</option>
                                        <option value="Clinique">Clinique</option>
                                        <option value="Agent Clinique">Agent Clinique</option>
                                        <option value="Parent">Parent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">
                                        {isEditModalOpen ? "Nouveau Mot de passe (Laisser vide si inchangé)" : "Mot de passe initial"}
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={formData.newPassword} 
                                            onChange={e => setFormData({ ...formData, newPassword: e.target.value })} 
                                            placeholder={isEditModalOpen ? "••••••••" : "DiaCare123!"}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none" 
                                        />
                                        <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Statut</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer">
                                        <option value="Actif">Actif</option>
                                        <option value="Bloqué">Bloqué</option>
                                    </select>
                                </div>

                                {(formData.role === 'Clinique' || formData.role === 'Agent Clinique' || formData.role === 'Parent') && isEditModalOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-4 pt-4 border-t border-white/5"
                                    >
                                        <div className="text-[11px] font-black uppercase tracking-widest text-[#1E88E5] mb-2 flex items-center gap-2">
                                            <Shield size={14} /> Gestion de l'Abonnement ({formData.role})
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Plan</label>
                                                <select
                                                    value={formData.planType}
                                                    onChange={e => setFormData({ ...formData, planType: e.target.value })}
                                                    className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer text-xs uppercase font-bold"
                                                >
                                                    <option value="Mensuel">Mensuel</option>
                                                    <option value="Annuel">Annuel</option>
                                                    <option value="Standard">Standard</option>
                                                    <option value="Premium">Premium</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Date d'expiration</label>
                                                <input
                                                    type="date"
                                                    value={formData.expiryDate}
                                                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none text-xs font-mono"
                                                />
                                            </div>
                                        </div>

                                        {(formData.role === 'Clinique' || formData.role === 'Agent Clinique') ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-[#1E88E5] uppercase tracking-widest pl-4 mb-2 block">Médecins Max</label>
                                                    <input
                                                        type="number"
                                                        value={formData.maxDoctors}
                                                        onChange={e => setFormData({ ...formData, maxDoctors: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none"
                                                        placeholder="Ex: 15 ( -1 = ∞ )"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-[#1E88E5] uppercase tracking-widest pl-4 mb-2 block">Patients Max</label>
                                                    <input
                                                        type="number"
                                                        value={formData.maxPatients}
                                                        onChange={e => setFormData({ ...formData, maxPatients: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none"
                                                        placeholder="Ex: 50 ( -1 = ∞ )"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-[10px] font-bold text-[#1E88E5] uppercase tracking-widest pl-4 mb-2 block">Nombre d'enfants max (Héros)</label>
                                                <select
                                                    value={formData.maxKids}
                                                    onChange={e => setFormData({ ...formData, maxKids: parseInt(e.target.value) })}
                                                    className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer font-bold"
                                                >
                                                    <option value={1}>1 Héros</option>
                                                    <option value={2}>2 Héros</option>
                                                    <option value={3}>3 Héros</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 mt-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest cursor-pointer">Paiement Effectué (Abonnement Actif)</label>
                                            <input 
                                                type="checkbox" 
                                                checked={formData.subscriptionIsActive}
                                                onChange={e => setFormData({ ...formData, subscriptionIsActive: e.target.checked })}
                                                className="w-5 h-5 rounded bg-white/10 border-white/20 text-[#1E88E5] focus:ring-[#1E88E5]"
                                            />
                                        </div>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-4 italic">
                                            * Utilisez -1 en capacité pour un accès illimité.
                                        </p>
                                    </motion.div>
                                )}
                                <button type="submit" className="w-full py-5 bg-[#1E88E5] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#1E88E5]/80 transition-colors mt-8">
                                    <Save size={20} /> {isEditModalOpen ? "Mettre à jour" : "Créer le compte"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL BLOQUER/DEBLOQUER */}
            <AnimatePresence>
                {isToggleStatusModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsToggleStatusModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl text-center"
                        >
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                                selectedUser.status === 'Actif' ? "bg-accent/10 text-accent" : "bg-success/10 text-success"
                            )}>
                                {selectedUser.status === 'Actif' ? <UserX size={40} /> : <UserCheck size={40} />}
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-white">
                                {selectedUser.status === 'Actif' ? 'Bloquer' : 'Débloquer'} ?
                            </h2>
                            <p className="text-white/60 text-sm mb-8">
                                Confirmez-vous le changement de statut pour <span className="text-white font-bold">{selectedUser.name}</span> ?
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setIsToggleStatusModalOpen(false)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Annuler</button>
                                <button
                                    onClick={confirmToggleStatus}
                                    className={cn(
                                        "flex-1 py-4 text-white rounded-2xl font-black uppercase tracking-widest transition-colors border",
                                        selectedUser.status === 'Actif' ? "bg-accent border-accent/20 hover:bg-accent/80" : "bg-success border-success/20 hover:bg-success/80"
                                    )}
                                >
                                    Confirmer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL SUPPRIMER */}
            <AnimatePresence>
                {isDeleteModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-white">
                                Supprimer cet utilisateur ?
                            </h2>
                            <p className="text-white/60 text-sm mb-8">
                                Cette action est irréversible. Toutes les données liées à <span className="text-white font-bold">{selectedUser.name}</span> seront perdues.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Annuler</button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-4 bg-error border border-error/20 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-error/80 transition-colors"
                                >
                                    Supprimer
                                </button>
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

const Edit3 = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);
