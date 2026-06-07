"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Wallet, Download, Search, Filter,
    FileText, CheckCircle2, Clock,
    ArrowUpRight, CreditCard, ExternalLink,
    ChevronLeft, ChevronRight, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import InvoiceGenerator from '@/components/InvoiceGenerator';

export default function ClinicPayments() {
    const [payments, setPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [clinicInfo, setClinicInfo] = useState(null);

    const [parents, setParents] = useState([]);
    const [packages, setPackages] = useState([]);
    const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState("");
    const [newInvoiceData, setNewInvoiceData] = useState({ description: "Abonnement", amount: 0, currency: "eur", planId: "" });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setClinicInfo(parsed);
            // Pour la clinique, on récupère ses propres transactions ET ses patients et ses packs
            Promise.all([
                api.get(`/Transactions/clinic/${parsed.id}`),
                api.get('/ClinicManagement/patients'),
                api.get('/ClinicPackages')
            ]).then(([txRes, parentsRes, pkgRes]) => {
                setPayments(txRes.data);
                // API '/ClinicManagement/patients' returns { parent, children }. Extraire uniquement les parents:
                setParents(parentsRes.data.map(p => p.parent));
                setPackages(pkgRes.data);
                setIsLoading(false);
            }).catch(err => {
                console.error("Erreur de récupération des données", err);
                setIsLoading(false);
            });
        }
    }, []);

    const filteredPayments = payments.filter(p => 
        p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userFullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.planName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION 8.1 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Wallet size={24} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Historique <span className="text-white/40">Paiements</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Consultez les paiements de la clinique, de vos médecins et de vos patients</p>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsNewInvoiceModalOpen(true)}
                            className="flex items-center gap-3 px-8 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_10px_30px_rgba(8,131,149,0.3)]"
                        >
                            <FileText size={18} />
                            Nouvelle Facture
                        </button>
                        <button className="flex items-center gap-3 px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] transition-all">
                            <Download size={18} />
                            Exporter
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#088395] transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="RECHERCHER PAR NOM, ROLE, FORFAIT OU ID..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>

                {/* Payments Table SECTION 8.1 */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Utilisateur</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Rôle</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Forfait</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Date</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Montant</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Statut</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Facture</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="px-10 py-16 text-center text-white/40 font-bold uppercase tracking-widest text-xs">
                                            Chargement des transactions...
                                        </td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-10 py-16 text-center text-white/40 font-bold uppercase tracking-widest text-xs">
                                            Aucune transaction trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((pay, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={pay.id}
                                            className="group hover:bg-white/5 transition-colors"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 text-white/60 flex items-center justify-center font-bold text-xs">
                                                        <UserIcon size={14} />
                                                    </div>
                                                    <span className="text-sm font-black uppercase tracking-tighter leading-none text-white">{pay.userFullName || "Anonyme"}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    pay.role === 'Clinique' ? "bg-accent/10 border-accent/20 text-accent" :
                                                    pay.role === 'Medecin' ? "bg-[#1E88E5]/10 border-[#1E88E5]/20 text-[#1E88E5]" :
                                                    "bg-success/10 border-success/20 text-success"
                                                )}>
                                                    {pay.role || "Utilisateur"}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-xs font-bold text-white/80">{pay.planName}</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-xs font-bold text-white/40">{new Date(pay.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-lg font-black italic tracking-tighter text-[#088395]">
                                                    {(pay.amount / 100).toFixed(2)} €
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-xl text-success text-[9px] font-black uppercase tracking-widest w-fit">
                                                    <CheckCircle2 size={12} />
                                                    {pay.status}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button 
                                                    onClick={() => { setSelectedInvoice(pay); setShowInvoice(true); }}
                                                    className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-2xl text-white/40 transition-all group/btn shadow-xl border border-white/5"
                                                    title="Voir et Télécharger la Facture"
                                                >
                                                    <FileText size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="p-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                            Total Facturé: <span className="text-white">{(totalAmount / 100).toFixed(2)} €</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-xl text-white/40 transition-all border border-white/10 group">
                                <ChevronLeft size={20} className="group-active:-translate-x-1 transition-transform" />
                            </button>
                            <button className="w-12 h-12 rounded-xl text-[10px] font-black bg-[#088395] text-white border border-transparent shadow-[0_10px_30px_rgba(8,131,149,0.3)]">1</button>
                            <button className="p-4 bg-white/5 hover:bg-white hover:text-[#088395] rounded-xl text-white/40 transition-all border border-white/10 group">
                                <ChevronRight size={20} className="group-active:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal Créer Facture Libre */}
            <AnimatePresence>
                {isNewInvoiceModalOpen && !showInvoice && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsNewInvoiceModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#088395]/10 text-[#088395] flex items-center justify-center mb-6">
                                <FileText size={32} />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6 text-white">
                                Nouvelle Facture Libre
                            </h2>

                            <form onSubmit={(e) => { 
                                e.preventDefault(); 
                                if(!selectedParentId) { alert('Veuillez sélectionner un patient'); return; }
                                const targetParent = parents.find(p => p.id === selectedParentId);
                                setSelectedInvoice({
                                    userFullName: targetParent?.fullName,
                                    email: targetParent?.email,
                                    role: 'Parent',
                                    planName: newInvoiceData.description,
                                    amount: newInvoiceData.amount * 100, // as cents
                                    date: new Date().toISOString()
                                });
                                setIsNewInvoiceModalOpen(false);
                                setShowInvoice(true);
                            }} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Parent / Client</label>
                                    <select 
                                        value={selectedParentId}
                                        onChange={e => setSelectedParentId(e.target.value)}
                                        className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-white focus:border-[#088395] outline-none font-bold text-sm appearance-none mb-4 shadow-inner"
                                    >
                                        <option value="" className="bg-[#0b1b2b]">-- Sélectionner le parent --</option>
                                        {parents.map(parent => (
                                            <option key={parent.id} value={parent.id} className="bg-[#0b1b2b] font-bold">
                                                {parent.fullName} ({parent.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {packages.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Pack Clinique (Option)</label>
                                        <select 
                                            value={newInvoiceData.planId}
                                            onChange={e => {
                                                const pkg = packages.find(p => p.id === e.target.value);
                                                if (pkg) {
                                                    let cur = (pkg.currency || 'eur').toLowerCase();
                                                    if (cur === 'dt') cur = 'tnd';
                                                    setNewInvoiceData({ planId: pkg.id, description: pkg.name, amount: pkg.price, currency: cur });
                                                } else {
                                                    setNewInvoiceData({ ...newInvoiceData, planId: "" });
                                                }
                                            }}
                                            className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-[#088395] focus:border-[#088395] outline-none font-black text-sm appearance-none mb-4 shadow-inner"
                                        >
                                            <option value="">-- Saisie Manuelle --</option>
                                            {packages.map(pkg => (
                                                <option key={pkg.id} value={pkg.id} className="bg-[#0b1b2b] font-bold">
                                                    {pkg.name} ({pkg.price} {pkg.currency})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Description Facture</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={newInvoiceData.description} 
                                        onChange={e => setNewInvoiceData({ ...newInvoiceData, description: e.target.value })} 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#088395] outline-none font-bold" 
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Montant</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            required 
                                            value={newInvoiceData.amount} 
                                            onChange={e => setNewInvoiceData({ ...newInvoiceData, amount: parseFloat(e.target.value) || 0 })} 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#088395] outline-none font-black text-xl" 
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Devise</label>
                                        <select 
                                            value={newInvoiceData.currency}
                                            onChange={e => setNewInvoiceData({ ...newInvoiceData, currency: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#088395] outline-none font-black text-xl appearance-none"
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
                                        onClick={() => setIsNewInvoiceModalOpen(false)} 
                                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-[#088395] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#066a7a] transition-all"
                                    >
                                        Aperçu
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            {/* Modal Aperçu & Envoi (InvoiceGenerator) */}
            {selectedInvoice && (
                <InvoiceGenerator
                    isOpen={showInvoice}
                    onClose={() => setShowInvoice(false)}
                    user={{ fullName: selectedInvoice.userFullName, role: selectedInvoice.role, email: selectedInvoice.email || "email_non_fourni@client.com", subscription: { isActive: true, planType: selectedInvoice.planName, startDate: selectedInvoice.date } }}
                    plan={{ name: selectedInvoice.planName, description: `Abonnement ${selectedInvoice.planName}`, price: selectedInvoice.amount / 100, currency: 'eur' }}
                    issuerInfo={clinicInfo ? { name: clinicInfo.fullName, address: clinicInfo.address || "Adresse de la clinique", phone: clinicInfo.contactNumber, email: clinicInfo.email, website: clinicInfo.fileNumber } : undefined}
                />
            )}
        </DashboardLayout>
    );
}
