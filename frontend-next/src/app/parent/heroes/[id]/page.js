"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Baby, Calendar, Mail, Stethoscope, Building2,
    ChevronLeft, Loader2, Shield, Heart, Activity,
    User, Mars, Venus, Edit3
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

export default function ChildProfile() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [resetting, setResetting] = useState(false);
    const [editForm, setEditForm] = useState({
        weight: '', height: '', allergies: '', diabetesType: '', diagnosisDate: ''
    });

    const fetchChildDetails = async () => {
        setLoading(true);
        try {
            // Re-fetch parent summary
            const res = await api.get('/parent/dashboard-summary');
            const found = res.data.children.find(c => c.id === id);

            if (found) {
                // To get weight/height which might not be in the summary, 
                // we technically need the full patient object. We'll fetch it by calling /users/:id.
                const userRes = await api.get(`/users/${id}`);
                const fullChild = { ...found, ...userRes.data };
                setChild(fullChild);

                setEditForm({
                    weight: fullChild.weight || '',
                    height: fullChild.height || '',
                    allergies: fullChild.allergies || '',
                    diabetesType: fullChild.diabetesType || 'Type 1',
                    diagnosisDate: fullChild.diagnosisDate ? fullChild.diagnosisDate.split('T')[0] : ''
                });
            } else {
                setError("Héros non trouvé.");
            }
        } catch (err) {
            console.error("Error fetching child profile:", err);
            setError("Erreur lors de la récupération des détails.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchChildDetails();
    }, [id]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/parent/update-child-profile/${id}`, editForm);
            setShowEditModal(false);
            fetchChildDetails(); // Refresh data
        } catch (err) {
            console.error(err);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword) return;
        setResetting(true);
        try {
            await api.post(`/parent/reset-child-password/${id}`, { newPassword });
            alert("Mot de passe du héros réinitialisé !");
            setShowPasswordModal(false);
            setNewPassword('');
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la réinitialisation.");
        } finally {
            setResetting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="Parent">
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin text-[#088395]" size={40} />
                    <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Ouverture du dossier secret...</span>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !child) {
        return (
            <DashboardLayout role="Parent">
                <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
                    <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                        <Shield size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic">{error || "Dossier introuvable"}</h2>
                    <button onClick={() => router.back()} className="text-[#088395] text-xs font-black uppercase tracking-widest underline underline-offset-8">
                        Retourner à mes héros
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const age = child.dateOfBirth ? new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear() : 'N/A';

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-10 pb-20">
                {/* Header with Back Button */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#088395]">Profil du Patient</div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic text-white">
                            {child.fullName}
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Identity Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <div className="apple-card p-10 bg-gradient-to-br from-[#0b1b2b] to-[#088395]/10 border-[#088395]/20 flex flex-col items-center text-center relative group">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="absolute top-4 right-4 p-3 bg-white/5 hover:bg-white/20 rounded-xl text-white/40 hover:text-white transition-all"
                            >
                                <Edit3 size={16} />
                            </button>
                            <div className="w-32 h-32 bg-[#088395] rounded-[40px] flex items-center justify-center text-white text-5xl font-black shadow-2xl mb-8 border-4 border-white/10">
                                {child.fullName.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{child.fullName}</h2>
                            <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5 text-[#088395] text-[10px] font-black uppercase tracking-[0.2em]">
                                Petit Champion • {child.gender === 'H' ? 'Garçon' : 'Fille'}
                            </div>

                            <div className="w-full space-y-4 mt-8">
                                <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <div className="space-y-1">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Âge Actuel</div>
                                        <div className="text-lg font-black text-white italic">{age} Ans</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Statut</div>
                                        <div className="text-lg font-black text-success italic">Actif</div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full py-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center gap-3 text-accent hover:bg-accent hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    <Shield size={16} /> Réinitialiser le mot de passe
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="apple-card p-6 bg-white/5 border-white/10 flex flex-col items-center gap-3">
                                <Activity className="text-success" size={20} />
                                <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Glycémie</div>
                                <div className="text-sm font-black text-white">Modale</div>
                            </div>
                            <div className="apple-card p-6 bg-white/5 border-white/10 flex flex-col items-center gap-3">
                                <Heart className="text-accent" size={20} />
                                <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Humeur</div>
                                <div className="text-sm font-black text-white">Super !</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Detailed Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8 space-y-8"
                    >
                        {/* Medical Team Card */}
                        <div className="apple-card p-10 bg-white/5 border-white/10">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <Stethoscope size={20} className="text-[#088395]" />
                                Accompagnement Médical
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Médecin Référent</div>
                                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[24px] border border-white/5">
                                        <div className="w-12 h-12 bg-[#088395]/10 rounded-2xl flex items-center justify-center text-[#088395]">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white uppercase">{child.doctorName || "Non assigné"}</div>
                                            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Expert Diabétologue</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Établissement</div>
                                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[24px] border border-white/5">
                                        <div className="w-12 h-12 bg-[#1E88E5]/10 rounded-2xl flex items-center justify-center text-[#1E88E5]">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white uppercase">{child.clinicName || "Non assigné"}</div>
                                            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Centre de Suivi</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="apple-card p-10 bg-white/5 border-white/10">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <User size={20} className="text-[#088395]" />
                                Données Personnelles Sécurisées
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <InfoRow icon={<Shield size={16} />} label="Numéro de fiche unique" value={child.fileNumber} />
                                    <InfoRow icon={<Mail size={16} />} label="Identifiant unique" value={child.email} />
                                    <InfoRow icon={<Calendar size={16} />} label="Date de naissance" value={child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                </div>
                                <div className="space-y-6">
                                    <InfoRow
                                        icon={child.gender === 'H' ? <Mars size={16} /> : <Venus size={16} />}
                                        label="Genre biologique"
                                        value={child.gender === 'H' ? 'Masculin' : 'Féminin'}
                                    />
                                    <InfoRow icon={<Shield size={16} />} label="Type de dossier" value="Pédiatrique (T1D)" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl px-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-[#0b1b2b] border border-white/10 rounded-[40px] p-10 relative shadow-2xl"
                        >
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-6 right-6 p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all hover:rotate-90"
                            >
                                x
                            </button>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 bg-gradient-to-r from-[#088395] to-white bg-clip-text text-transparent">
                                Mettre à jour le profil de {child.fullName}
                            </h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Poids (Kg)</label>
                                        <input type="number" step="0.1" value={editForm.weight} onChange={e => setEditForm({ ...editForm, weight: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Taille (m)</label>
                                        <input type="number" step="0.01" value={editForm.height} onChange={e => setEditForm({ ...editForm, height: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Date de Diagnostic</label>
                                    <input type="date" value={editForm.diagnosisDate} onChange={e => setEditForm({ ...editForm, diagnosisDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Type de Diabète</label>
                                    <select value={editForm.diabetesType} onChange={e => setEditForm({ ...editForm, diabetesType: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all">
                                        <option value="Type 1">Type 1</option>
                                        <option value="Type 2">Type 2</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Allergies</label>
                                    <input type="text" value={editForm.allergies} onChange={e => setEditForm({ ...editForm, allergies: e.target.value })} placeholder="Ex: Pénicilline, Arachides..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all" />
                                </div>

                                <button type="submit" className="w-full py-5 bg-gradient-to-r from-[#088395] to-[#066a7a] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                    Sauvegarder les modifications
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl px-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-sm bg-[#0b1b2b] border border-white/10 rounded-[40px] p-10 relative shadow-2xl text-center"
                        >
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="absolute top-6 right-6 p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all"
                            >
                                x
                            </button>
                            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-accent">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Sécurité Héros</h3>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-8">Définir un nouveau mot de passe</p>
                            
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <input 
                                    type="password" 
                                    placeholder="Nouveau mot de passe"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-accent transition-all text-center"
                                    required
                                />
                                <button 
                                    type="submit" 
                                    disabled={resetting}
                                    className="w-full py-5 bg-accent text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {resetting ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Confirmer le nouveau code"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 group">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:bg-[#088395]/10 group-hover:text-[#088395] transition-all">
            {icon}
        </div>
        <div className="space-y-1">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">{label}</div>
            <div className="text-sm font-bold text-white">{value}</div>
        </div>
    </div>
);
