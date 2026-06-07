"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import { Send, FileText, Search, CreditCard, Clock, CheckCircle, User, Phone, Mail, Calendar, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const getRemainingDays = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
};

export default function AdminPayments() {
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal state
    const [selectedUser, setSelectedUser] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [invoiceData, setInvoiceData] = useState({ description: "Abonnement", amount: 199.99, currency: "eur", planId: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resUsers, resPlans] = await Promise.all([
                    api.get('/Users'),
                    api.get('/Plans')
                ]);
                setUsers(resUsers.data.filter(u => u.role !== 'Admin'));
                setPlans(resPlans.data);
            } catch (error) {
                console.error("Erreur chargement données:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setIsDetailsModalOpen(true);
    };

    const handleSendInvoiceClick = (e, user) => {
        if (e) e.stopPropagation();
        setSelectedUser(user);
        
        let targetPlanName = user.subscription?.planType || 'Basic';
        if (!targetPlanName) targetPlanName = 'Basic';
        
        let roleTarget = user.role || 'Clinique';
        if (roleTarget === 'Agent Clinique') roleTarget = 'Clinique';

        let matchedPlan = plans.find(p => p.name?.trim().toLowerCase() === targetPlanName.trim().toLowerCase() && p.role?.trim().toLowerCase() === roleTarget.trim().toLowerCase());
        
        let defaultAmount = 9.99;
        let pCurrency = 'eur';
        let defaultDesc = `Abonnement - ${user.role}`;
        let pId = "";

        if (matchedPlan) {
            defaultAmount = matchedPlan.price;
            pCurrency = (matchedPlan.currency || 'eur').toLowerCase();
            defaultDesc = `Abonnement ${matchedPlan.name} - ${user.role}`;
            pId = matchedPlan.id;
        } else {
            // Pick any default plan for this role if the user doesn't have a matching plan string
            let firstRolePlan = plans.find(p => p.role?.trim().toLowerCase() === roleTarget.trim().toLowerCase());
            if (firstRolePlan) {
                defaultAmount = firstRolePlan.price;
                pCurrency = (firstRolePlan.currency || 'eur').toLowerCase();
                defaultDesc = `Abonnement ${firstRolePlan.name} - ${user.role}`;
                pId = firstRolePlan.id;
            } else {
                if (user.role === 'Medecin') defaultAmount = 49.99;
                if (user.role === 'Clinique' || roleTarget === 'Clinique') defaultAmount = 199.99;
            }
        }

        // Mapping devises "dt" => "tnd" pour Stripe
        if (pCurrency === 'dt') pCurrency = 'tnd';
        else if (pCurrency === '€') pCurrency = 'eur';
        else if (pCurrency === '$') pCurrency = 'usd';
        
        setInvoiceData({ description: defaultDesc, amount: defaultAmount, currency: pCurrency, planId: pId });
        setIsInvoiceModalOpen(true);
    };

    const handlePlanChange = (planId) => {
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            let pCurrency = (plan.currency || 'eur').toLowerCase();
            if (pCurrency === 'dt') pCurrency = 'tnd';
            else if (pCurrency === '€') pCurrency = 'eur';
            else if (pCurrency === '$') pCurrency = 'usd';
            
            setInvoiceData(prev => ({ 
                ...prev, 
                planId: plan.id,
                amount: plan.price,
                currency: pCurrency,
                description: `Abonnement ${plan.name} - ${selectedUser?.role || 'Clinique'}`
            }));
        }
    };

    const confirmSendInvoice = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            // Calculate correct sub-units for Stripe
            let multiplier = 100;
            if (invoiceData.currency === 'tnd') {
                multiplier = 1000; // TND uses 3 decimal places (millimes)
            }
            const sentAmount = Math.round(invoiceData.amount * multiplier);

            const res = await api.post('/Payments/send-invoice', {
                email: selectedUser.email,
                description: invoiceData.description,
                amount: sentAmount,
                currency: invoiceData.currency
            });
            alert(`Facture envoyée avec succès ! Lien: ${res.data.invoiceUrl}`);
            setIsInvoiceModalOpen(false);
        } catch (error) {
            console.error("Erreur envoi facture", error);
            const errorMsg = error.response?.data?.error || error.message;
            alert(`Erreur lors de l'envoi de la facture via Stripe : ${errorMsg}`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                            Paiements & <span className="text-white/40">Facturation</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                            Envoi de factures Stripe aux abonnés
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl">
                    <div className="flex flex-1 min-w-[300px] relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur (Email, Nom)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-8 text-sm font-bold text-white outline-none focus:border-[#1E88E5] transition-all"
                        />
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
                                    <th className="px-10 py-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan="3" className="px-10 py-12 text-center text-[#1E88E5]">Chargement...</td></tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} onClick={() => handleRowClick(user)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                        <td className="px-10 py-8">
                                            <div>
                                                <div className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{user.fullName}</div>
                                                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="px-3 py-1 rounded-full bg-[#1E88E5]/10 text-[#1E88E5] text-xs uppercase tracking-widest border border-[#1E88E5]/20">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button
                                                onClick={(e) => handleSendInvoiceClick(e, user)}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E88E5] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#1E88E5]/80 transition-all text-xs"
                                            >
                                                <Send size={14} /> Envoyer Facture
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Détails Utilisateur */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[40px] p-10 max-w-2xl w-full relative z-10 shadow-2xl"
                        >
                            <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-20 h-20 bg-[#1E88E5]/10 text-[#1E88E5] rounded-3xl flex items-center justify-center font-black text-3xl border border-[#1E88E5]/20">
                                    {selectedUser.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none mb-3">
                                        {selectedUser.fullName}
                                    </h2>
                                    <div className="flex gap-3">
                                        <span className="px-3 py-1 rounded-full bg-[#1E88E5]/10 text-[#1E88E5] text-[10px] font-black uppercase tracking-widest border border-[#1E88E5]/20">
                                            {selectedUser.role}
                                        </span>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            selectedUser.status === 'Actif' ? "bg-success/10 text-success border-success/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                        )}>
                                            {selectedUser.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-8 rounded-3xl border border-white/5 mb-8 shadow-inner">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                            <Mail size={12} /> Email
                                        </div>
                                        <div className="font-bold text-white text-sm">{selectedUser.email}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                            <Phone size={12} /> Téléphone
                                        </div>
                                        <div className="font-bold text-white text-sm">{selectedUser.contactNumber || 'Non renseigné'}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                            <CreditCard size={12} /> Méthode de Paiement
                                        </div>
                                        <div className="font-bold text-white text-sm">
                                            {selectedUser.subscription?.isActive ? 'En Ligne (Stripe)' : (selectedUser.status === 'En Attente' ? 'Présentiel / Clinique' : 'Non spécifié')}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                            <Activity size={12} /> Abonnement
                                        </div>
                                        <div className="font-bold text-[#1E88E5] text-sm uppercase tracking-wider">{selectedUser.subscription?.planType || 'Gratuit / Aucun'}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                            <Calendar size={12} /> Inscription
                                        </div>
                                        <div className="font-bold text-white text-sm">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR') : 'Non renseignée'}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                            <Clock size={12} /> Expiration
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-white text-sm">
                                                {selectedUser.subscription?.expiryDate ? new Date(selectedUser.subscription.expiryDate).toLocaleDateString('fr-FR') : 'Non définie'}
                                            </span>
                                            {selectedUser.subscription?.expiryDate && (
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-black border",
                                                    getRemainingDays(selectedUser.subscription.expiryDate) <= 10 ? "bg-accent/10 border-accent/20 text-accent" : "bg-success/10 border-success/20 text-success"
                                                )}>
                                                    {getRemainingDays(selectedUser.subscription.expiryDate)} jours restants
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    setIsDetailsModalOpen(false);
                                    setTimeout(() => handleSendInvoiceClick(e, selectedUser), 100);
                                }}
                                className="w-full py-5 bg-[#1E88E5] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:scale-105 hover:bg-[#1E88E5]/90 transition-all shadow-[0_10px_40px_rgba(30,136,229,0.3)]"
                            >
                                <Send size={18} /> Procéder à la facturation / Relance
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Envoi Facture (Configuration) */}
            <AnimatePresence>
                {isInvoiceModalOpen && selectedUser && !showPreview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsInvoiceModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#1E88E5]/10 text-[#1E88E5] flex items-center justify-center mb-6">
                                <FileText size={32} />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2 text-white">
                                Configurer la Facture
                            </h2>
                            <p className="text-white/40 text-sm mb-8 font-bold">
                                Destinataire: <span className="text-white">{selectedUser.email}</span>
                            </p>

                            <form onSubmit={(e) => { e.preventDefault(); setShowPreview(true); }} className="space-y-4">
                                {plans.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Choisir un Pack Pré-configuré</label>
                                        <select 
                                            value={invoiceData.planId}
                                            onChange={e => handlePlanChange(e.target.value)}
                                            className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-[#1E88E5] focus:border-[#1E88E5] outline-none font-black text-sm appearance-none mb-4 shadow-inner"
                                        >
                                            <option value="">-- Tarif Manuel --</option>
                                            {plans.filter(p => p.role?.trim().toLowerCase() === (selectedUser?.role === 'Agent Clinique' ? 'clinique' : selectedUser?.role?.toLowerCase())).map(plan => (
                                                <option key={plan.id} value={plan.id} className="bg-[#0b1b2b] font-bold">
                                                    {plan.name} ({plan.price} {plan.currency})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Description</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={invoiceData.description} 
                                        onChange={e => setInvoiceData({ ...invoiceData, description: e.target.value })} 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none font-bold" 
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Montant</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            required 
                                            value={invoiceData.amount} 
                                            onChange={e => setInvoiceData({ ...invoiceData, amount: parseFloat(e.target.value) || 0 })} 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none font-black text-xl" 
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Devise</label>
                                        <select 
                                            value={invoiceData.currency}
                                            onChange={e => setInvoiceData({ ...invoiceData, currency: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none font-black text-xl appearance-none"
                                        >
                                            <option value="eur" className="bg-[#0b1b2b]">EUR (€)</option>
                                            <option value="usd" className="bg-[#0b1b2b]">USD ($)</option>
                                            <option value="cad" className="bg-[#0b1b2b]">CAD ($)</option>
                                            <option value="tnd" className="bg-[#0b1b2b]">TND (DT)</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsInvoiceModalOpen(false)} 
                                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-[#1E88E5] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#1E88E5]/80 transition-all"
                                    >
                                        Aperçu Facture
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Aperçu & Envoi (InvoiceGenerator) */}
            <InvoiceGenerator
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                user={selectedUser}
                plan={{ name: invoiceData.description.split(' - ')[0].replace('Abonnement ', '') || 'Personnalisé', description: invoiceData.description, price: invoiceData.amount, currency: invoiceData.currency }}
            />
        </DashboardLayout>
    );
}
