"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    CreditCard, Check, Shield, Star, Crown, Plus,
    Edit3, Trash2, Package, Clock, Users, Zap, X, Save, Baby
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const renderIcon = (name) => {
    if (name === "Star") return <Star size={40} />;
    if (name === "Crown") return <Crown size={40} />;
    return <Shield size={40} />;
};

export default function AdminSubscriptions() {
    const [plansList, setPlansList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        currency: 'dt',
        duration: 'Mensuel',
        role: 'Clinique',
        maxDoctors: 3,
        maxPatients: 50,
        maxKids: 1,
        features: '',
        color: 'from-[#1E88E5] to-[#1565C0]',
        iconName: 'Shield',
        isPopular: false
    });

    const fetchPlans = async () => {
        try {
            const res = await api.get('/plans');
            setPlansList(res.data);
        } catch (error) {
            console.error("Erreur de chargement des plans :", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleAddClick = () => {
        setEditingPlan(null);
        setFormData({
            name: '',
            price: '99',
            currency: 'dt',
            duration: 'Mensuel',
            role: 'Clinique',
            maxDoctors: 5,
            maxPatients: 100,
            maxKids: 1,
            features: 'Gestion complète, Support prioritaire',
            color: 'from-[#1E88E5] to-[#1565C0]',
            iconName: 'Shield',
            isPopular: false
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price.toString(),
            currency: plan.currency || 'dt',
            duration: plan.duration,
            role: plan.role || 'Clinique',
            maxDoctors: plan.maxDoctors,
            maxPatients: plan.maxPatients === -1 ? 'Illimité' : plan.maxPatients,
            maxKids: plan.maxKids || 1,
            features: plan.features.join(', '),
            color: plan.color,
            iconName: plan.iconName || 'Shield',
            isPopular: plan.isPopular || false
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (confirm("Confirmez-vous la suppression de ce plan ?")) {
            try {
                await api.delete(`/plans/${id}`);
                alert("Plan supprimé avec succès !");
                fetchPlans();
            } catch (error) {
                console.error("Erreur suppression plan:", error);
                alert("Erreur lors de la suppression du plan.");
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
        
        let doctorsNum = parseInt(formData.maxDoctors);
        let patientsNum = formData.maxPatients === 'Illimité' || formData.maxPatients === '-1' || isNaN(parseInt(formData.maxPatients)) ? -1 : parseInt(formData.maxPatients);
        let kidsNum = parseInt(formData.maxKids);

        const payload = {
            name: formData.name,
            price: parseFloat(formData.price) || 0,
            currency: formData.currency,
            duration: formData.duration,
            role: formData.role,
            maxDoctors: formData.role === 'Clinique' ? (isNaN(doctorsNum) ? 3 : doctorsNum) : 0,
            maxPatients: formData.role === 'Clinique' ? patientsNum : 0,
            maxKids: formData.role === 'Parent' ? (isNaN(kidsNum) ? 1 : kidsNum) : 0,
            features: featuresArray,
            color: formData.color,
            iconName: formData.iconName,
            isPopular: formData.isPopular
        };

        try {
            if (editingPlan) {
                await api.put(`/plans/${editingPlan.id}`, payload);
                alert("Plan mis à jour avec succès !");
            } else {
                await api.post('/plans', payload);
                alert("Nouveau plan créé avec succès !");
            }
            fetchPlans();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erreur d'enregistrement:", error);
            alert("Erreur lors de la sauvegarde du plan.");
        }
    };

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-16 pb-10 text-white">

                {/* Header SECTION */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                            Plans <span className="text-white/40">Tarifaires</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gestion des offres et des limites du système</p>
                    </div>
                    <button 
                        onClick={handleAddClick}
                        className="flex items-center gap-4 py-5 px-10 bg-white text-[#1E88E5] font-black rounded-[24px] text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl group"
                    >
                        <Plus size={24} /> Créer Nouveau Plan
                    </button>
                </div>

                {/* Plans List */}
                {isLoading ? (
                    <div className="py-20 flex justify-center items-center">
                        <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {plansList.map((plan, idx) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 relative group hover:border-[#1E88E5]/50 transition-all overflow-hidden flex flex-col justify-between shadow-2xl"
                            >
                                {plan.isPopular && (
                                    <div className="absolute top-8 right-[-35px] bg-[#1E88E5] px-12 py-1 rotate-45 text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        Populaire
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "w-20 h-20 rounded-3xl flex items-center justify-center text-white bg-gradient-to-br shadow-xl",
                                            plan.color
                                        )}>
                                            {renderIcon(plan.iconName)}
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest">
                                            {plan.role}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{plan.name}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black">{plan.price}</span>
                                            <span className="text-lg font-bold text-white/60 uppercase">{plan.currency || 'dt'}</span>
                                            <span className="text-sm font-bold opacity-30 uppercase tracking-widest">/ {plan.duration}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-10 border-t border-white/5 mb-12">
                                        {plan.role === 'Clinique' ? (
                                            <>
                                                <div className="flex items-center gap-4 text-white/60">
                                                    <Users size={16} className="text-[#1E88E5]" />
                                                    <span className="text-xs font-bold uppercase tracking-widest leading-none">
                                                        Jusqu'à {plan.maxDoctors === -1 ? 'Médecins illimités' : `${plan.maxDoctors} Médecins`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-white/60">
                                                    <Zap size={16} className="text-yellow-500" />
                                                    <span className="text-xs font-bold uppercase tracking-widest leading-none">
                                                        {plan.maxPatients === -1 ? 'Patients illimités' : `${plan.maxPatients} Patients Max`}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-4 text-white/60">
                                                <Baby size={16} className="text-[#1E88E5]" />
                                                <span className="text-xs font-bold uppercase tracking-widest leading-none">
                                                    Jusqu'à {plan.maxKids} {plan.maxKids > 1 ? 'Enfants' : 'Enfant'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="h-px bg-white/5 w-full my-4" />
                                        {plan.features.map(f => (
                                            <div key={f} className="flex items-center gap-4 group/item">
                                                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20 group-hover/item:scale-125 transition-transform"><Check size={12} strokeWidth={4} /></div>
                                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 mt-auto border-t border-white/5">
                                    <button 
                                        onClick={() => handleEditClick(plan)}
                                        className="flex-1 py-5 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[#1E88E5] transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <Edit3 size={16} className="group-hover:rotate-12 transition-transform" /> Modifier
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(plan.id)}
                                        className="p-5 bg-white/5 rounded-2xl text-white/20 hover:text-accent hover:bg-accent/10 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* MODAL EDITION/AJOUT */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-lg w-full relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                            >
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-white">
                                    {editingPlan ? "Modifier le Plan" : "Nouveau Plan"}
                                </h2>
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Nom du Plan</label>
                                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Pro" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Destinataire (Rôle)</label>
                                            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer font-bold">
                                                <option value="Clinique">Clinique / Agent Clinique</option>
                                                <option value="Parent">Parent</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Tarif</label>
                                            <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="Ex: 149" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Devise</label>
                                            <select value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer font-bold">
                                                <option value="dt">DT (Dinar)</option>
                                                <option value="$">$ (Dollar)</option>
                                                <option value="€">€ (Euro)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Périodicité</label>
                                            <select value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer font-bold">
                                                <option value="Mensuel">Mensuel</option>
                                                <option value="Annuel">Annuel</option>
                                            </select>
                                        </div>
                                        {formData.role === 'Parent' ? (
                                            <div>
                                                <label className="text-[10px] font-bold text-[#1E88E5] uppercase tracking-widest pl-4 mb-2 block">Enfants Inclus</label>
                                                <select value={formData.maxKids} onChange={e => setFormData({ ...formData, maxKids: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer font-bold">
                                                    <option value={1}>Solo (1 Enfant)</option>
                                                    <option value={2}>Duo (2 Enfants)</option>
                                                    <option value={3}>Famille (3 Enfants)</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-[10px] font-bold text-[#1E88E5] uppercase tracking-widest pl-4 mb-2 block">Médecins Inclus</label>
                                                <input type="number" required value={formData.maxDoctors} onChange={e => setFormData({ ...formData, maxDoctors: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none font-bold" />
                                            </div>
                                        )}
                                    </div>
                                    {formData.role === 'Clinique' && (
                                        <div>
                                            <label className="text-[10px] font-bold text-[#1E88E5] uppercase tracking-widest pl-4 mb-2 block">Patients/Parents Inclus</label>
                                            <input type="text" required value={formData.maxPatients} onChange={e => setFormData({ ...formData, maxPatients: e.target.value })} placeholder="Ex: 500 ou Illimité" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none font-bold" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Badge Design</label>
                                            <select value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer font-bold">
                                                <option value="from-slate-400 to-slate-600">Gris Acier (Basic)</option>
                                                <option value="from-[#1E88E5] to-[#1565C0]">Bleu Électrique (Pro)</option>
                                                <option value="from-yellow-500 to-orange-600">Or Doré (Premium)</option>
                                                <option value="from-emerald-400 to-emerald-600 font-bold">Émeraude (Solo)</option>
                                                <option value="from-indigo-400 to-indigo-600">Indigo (Duo)</option>
                                                <option value="from-pink-400 to-pink-600">Rose (Famille)</option>
                                                <option value="from-purple-400 to-purple-600">Violet Nébuleuse</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Icône</label>
                                            <select value={formData.iconName} onChange={e => setFormData({ ...formData, iconName: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none cursor-pointer font-bold">
                                                <option value="Shield">Bouclier (Shield)</option>
                                                <option value="Star">Étoile (Star)</option>
                                                <option value="Crown">Couronne (Crown)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Fonctionnalités (séparées par une virgule)</label>
                                        <textarea rows={3} required value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} placeholder="Ex: Analyse IA Basique, Multi-Clinique, Support 24/7" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none font-medium text-xs resize-none" />
                                    </div>
                                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <label className="text-[10px] font-bold text-[#1E88E5] uppercase tracking-widest cursor-pointer">Mettre en Avant (Tag Populaire)</label>
                                        <input type="checkbox" checked={formData.isPopular} onChange={e => setFormData({ ...formData, isPopular: e.target.checked })} className="w-5 h-5 rounded bg-white/10 border-white/20 text-[#1E88E5] focus:ring-[#1E88E5]" />
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-[#1E88E5] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#1E88E5]/80 transition-colors mt-8">
                                        <Save size={20} /> {editingPlan ? "Enregistrer les modifications" : "Créer l'offre"}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
}
