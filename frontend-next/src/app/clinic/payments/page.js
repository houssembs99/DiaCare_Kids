"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Wallet, Download, Search, FileText, CheckCircle2,
    ChevronLeft, ChevronRight, User as UserIcon,
    Users, CreditCard, Clock, CheckCircle, XCircle,
    ArrowUpRight, Receipt, Printer, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import InvoiceGenerator from '@/components/InvoiceGenerator';

export default function ClinicPayments() {
    const [activeTab, setActiveTab] = useState('revenue'); // 'my_bills' or 'revenue'
    const [myTransactions, setMyTransactions] = useState([]); // Factures DiaCare
    const [patientSubscribers, setPatientSubscribers] = useState([]); // Revenus Patients
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [clinicInfo, setClinicInfo] = useState(null);
    const [packages, setPackages] = useState([]);
    const [parents, setParents] = useState([]);

    // Invoice Generator State
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    
    // New Manual Invoice Modal state
    const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState("");
    const [newInvoiceData, setNewInvoiceData] = useState({ description: "Abonnement", amount: 0, currency: "eur", planId: "" });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setClinicInfo(parsed);
            
            Promise.all([
                api.get(`/Transactions/clinic/${parsed.id}`),
                api.get('/ClinicManagement/patients'),
                api.get('/ClinicPackages')
            ]).then(([txRes, parentsRes, pkgRes]) => {
                const allTrans = txRes.data;
                
                // Separer: Factures payés à DiaCare vs Revenus générés par la clinique
                const myBills = allTrans.filter(t => t.userId === parsed.id && !t.paymentIntentId?.startsWith('manual_'));
                const myRevenue = allTrans.filter(t => t.userId !== parsed.id || t.paymentIntentId?.startsWith('manual_'));
                
                setMyTransactions(myBills);
                setPatientSubscribers(myRevenue);
                
                setParents(parentsRes.data.map(p => p.parent));
                setPackages(pkgRes.data);
                setIsLoading(false);
            }).catch(err => {
                console.error("Erreur de récupération des données", err);
                setIsLoading(false);
            });
        }
    }, []);

    const handleOpenInvoice = (user) => {
        setSelectedInvoice(user);
        setShowInvoice(true);
    };

    const filteredMyBills = myTransactions.filter(p => 
        p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.planName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredRevenue = patientSubscribers.filter(t => 
        (t.userFullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.planName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.role || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-12 pb-10 text-white">

                {/* Header SECTION */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395] rounded-2xl flex items-center justify-center shadow-xl">
                                <Wallet size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                    Historique <span className="text-white/40">Paiements</span>
                                </h1>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-2">Suivi de vos revenus et de vos factures DiaCare</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                        {[
                            { id: 'revenue', label: 'Revenus Patients', icon: <Users size={16} /> },
                            { id: 'my_bills', label: 'Mes Factures DiaCare', icon: <Receipt size={16} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all",
                                    activeTab === tab.id ? "bg-[#088395] text-white shadow-lg" : "text-white/40 hover:text-white"
                                )}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#088395] transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={activeTab === 'revenue' ? "RECHERCHER UN PATIENT PAR NOM OU ROLE..." : "RECHERCHER PAR ID TRANSACTION..."}
                            className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all placeholder:text-white/20"
                        />
                    </div>
                    {activeTab === 'revenue' && (
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsNewInvoiceModalOpen(true)}
                                className="flex items-center gap-3 px-8 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_10px_30px_rgba(8,131,149,0.3)]"
                            >
                                <FileText size={18} />
                                Nouvelle Facture
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    {activeTab === 'revenue' ? (
                                        <>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Client</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Pack Souscrit</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">Date Paiement</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">Montant</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">Statut</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-right">Facture</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Forfait</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Date</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Montant</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Statut</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-right">Détails</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan="6" className="px-10 py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs italic">Chargement des données sécurisées...</td></tr>
                                ) : (activeTab === 'revenue' ? filteredRevenue : filteredMyBills).length === 0 ? (
                                    <tr><td colSpan="6" className="px-10 py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs italic">Aucune donnée correspondante.</td></tr>
                                ) : (
                                    (activeTab === 'revenue' ? filteredRevenue : filteredMyBills).map((item, idx) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-white/[0.02] transition-all"
                                        >
                                            {activeTab === 'revenue' ? (
                                                <>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-[#088395]/10 rounded-xl flex items-center justify-center font-black text-[#088395]">
                                                                {(item.userFullName?.charAt(0) || '?')}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black uppercase italic tracking-tight">{item.userFullName || 'Patient'}</div>
                                                                <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">
                                                                    {item.role || 'Patient'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                                            {item.planName || 'Standard'}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-center text-xs font-bold text-white/40">
                                                        {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—'}
                                                    </td>
                                                    <td className="px-10 py-8 text-center">
                                                        <div className="text-lg font-black italic tracking-tighter text-[#088395]">
                                                            {((item.amount || 0) / 100).toFixed(2)} DT
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex justify-center">
                                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[9px] font-black uppercase tracking-widest">
                                                                <CheckCircle size={12} /> {item.status || 'Payé'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <button 
                                                            onClick={() => handleOpenInvoice({ id: item.userId, fullName: item.userFullName || 'Patient', email: item.userEmail || '', role: item.role, subscription: { planType: item.planName || 'Standard', isActive: true, startDate: item.date }, amount: item.amount })}
                                                            className="p-4 bg-white/5 hover:bg-white hover:text-[#0b1b2b] rounded-2xl text-[#088395] transition-all border border-white/10 group-hover:scale-105" 
                                                            title="Générer et envoyer la facture"
                                                        >
                                                            <Receipt size={18} />
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-10 py-8">
                                                        <span className="text-sm font-black uppercase italic text-white">{item.planName}</span>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <span className="text-xs font-bold text-white/40">{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="text-lg font-black italic tracking-tighter text-[#1E88E5]">
                                                            {(item.amount / 100).toFixed(2)} DT
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[9px] font-black uppercase tracking-widest w-fit">
                                                            <CheckCircle2 size={12} /> Payée
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <button 
                                                            onClick={() => handleOpenInvoice({ id: clinicInfo?.id, fullName: clinicInfo?.fullName, role: 'Clinique', subscription: { planType: item.planName || 'Standard', isActive: true, startDate: item.date }, amount: item.amount, isSelfBill: true })}
                                                            className="p-4 bg-white/5 hover:bg-white hover:text-[#0b1b2b] rounded-2xl text-white/20 transition-all border border-white/10 group-hover:scale-105"
                                                            title="Télécharger ma facture DiaCare"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Stats */}
                {!isLoading && (
                    <div className={cn(
                        "grid gap-6",
                        activeTab === 'revenue' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
                    )}>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Total {activeTab === 'revenue' ? 'Transactions' : 'Dépenses'}</p>
                            <div className="text-3xl font-black italic tracking-tight">
                                {activeTab === 'revenue' ? patientSubscribers.length : `${(myTransactions.reduce((acc, c) => acc + c.amount, 0) / 100).toFixed(2)} DT`}
                            </div>
                        </div>

                        {activeTab === 'revenue' && (
                            <>
                                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl border-l-[#088395] border-l-4">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Revenu Total Encaissé</p>
                                    <div className="text-3xl font-black italic tracking-tight text-[#088395]">
                                        {(patientSubscribers.reduce((acc, t) => acc + (t.amount || 0), 0) / 100).toFixed(2)} DT
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Ce Mois-ci</p>
                                    <div className="text-3xl font-black italic tracking-tight text-green-400">
                                        {(patientSubscribers.filter(t => {
                                            const d = new Date(t.date);
                                            const now = new Date();
                                            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                        }).reduce((acc, t) => acc + (t.amount || 0), 0) / 100).toFixed(2)} DT
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Créer Facture Libre */}
            <AnimatePresence>
                {isNewInvoiceModalOpen && !showInvoice && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/0.80 backdrop-blur-sm" onClick={() => setIsNewInvoiceModalOpen(false)} />
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
                                    amount: newInvoiceData.amount * 100,
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
                    user={{ fullName: selectedInvoice.userFullName, role: selectedInvoice.role, email: selectedInvoice.email || selectedInvoice.userEmail || '', subscription: { isActive: true, planType: selectedInvoice.planName, startDate: selectedInvoice.date } }}
                    plan={{ name: selectedInvoice.planName, description: selectedInvoice.isSelfBill ? `Abonnement Plateforme DiaCare Kids` : `Prestation Clinique - ${selectedInvoice.planName}`, price: selectedInvoice.amount / 100, currency: selectedInvoice.isSelfBill ? 'DT' : 'DT' }}
                    issuerInfo={selectedInvoice.isSelfBill ? undefined : (clinicInfo ? { name: clinicInfo.fullName, address: clinicInfo.address || "Adresse de la clinique", phone: clinicInfo.contactNumber, email: clinicInfo.email, website: clinicInfo.fileNumber } : undefined)}
                />
            )}
        </DashboardLayout>
    );
}
