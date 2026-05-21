"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Send, FileText, Search, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function AdminPayments() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    
    // Modal state
    const [selectedUser, setSelectedUser] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState({ description: "Abonnement Annuel DiaCare", amount: 199.99 });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/Users');
                setUsers(res.data.filter(u => u.role !== 'Admin'));
            } catch (error) {
                console.error("Erreur chargement utilisateurs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendInvoiceClick = (user) => {
        setSelectedUser(user);
        
        let defaultAmount = 9.99;
        let defaultDesc = `Abonnement Mensuel - ${user.role}`;
        
        if (user.role === 'Medecin') defaultAmount = 49.99;
        if (user.role === 'Clinique' || user.role === 'Agent Clinique') defaultAmount = 199.99;
        
        setInvoiceData({ description: defaultDesc, amount: defaultAmount });
        setIsInvoiceModalOpen(true);
    };

    const confirmSendInvoice = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            const amountInCents = Math.round(invoiceData.amount * 100);
            const res = await api.post('/Payments/send-invoice', {
                email: selectedUser.email,
                description: invoiceData.description,
                amount: amountInCents
            });
            alert(`Facture envoyée avec succès ! Lien: ${res.data.invoiceUrl}`);
            setIsInvoiceModalOpen(false);
        } catch (error) {
            console.error("Erreur envoi facture", error);
            alert("Erreur lors de l'envoi de la facture via Stripe.");
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
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
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
                                                onClick={() => handleSendInvoiceClick(user)}
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

            {/* Modal Envoi Facture */}
            <AnimatePresence>
                {isInvoiceModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSending && setIsInvoiceModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#1E88E5]/10 text-[#1E88E5] flex items-center justify-center mb-6">
                                <FileText size={32} />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2 text-white">
                                Nouvelle Facture
                            </h2>
                            <p className="text-white/40 text-sm mb-8 font-bold">
                                Destinataire: <span className="text-white">{selectedUser.email}</span>
                            </p>

                            <form onSubmit={confirmSendInvoice} className="space-y-4">
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
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Montant (€)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        required 
                                        value={invoiceData.amount} 
                                        onChange={e => setInvoiceData({ ...invoiceData, amount: parseFloat(e.target.value) })} 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#1E88E5] outline-none font-black text-xl" 
                                    />
                                </div>
                                
                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsInvoiceModalOpen(false)} 
                                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                                        disabled={isSending}
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSending}
                                        className="flex-1 py-4 bg-[#1E88E5] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#1E88E5]/80 transition-all disabled:opacity-50"
                                    >
                                        {isSending ? 'Envoi...' : 'Générer & Envoyer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
