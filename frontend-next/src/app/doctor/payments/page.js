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

export default function DoctorPayments() {
    const [activeTab, setActiveTab] = useState('revenue'); // 'my_bills' or 'revenue'
    const [myTransactions, setMyTransactions] = useState([]);
    const [patientSubscribers, setPatientSubscribers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [packages, setPackages] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Invoice Generator State
    const [selectedUserForInvoice, setSelectedUserForInvoice] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setDoctorInfo(parsed);
            fetchData(parsed.id);
        }
    }, []);

    const fetchData = async (doctorId) => {
        setIsLoading(true);
        try {
            // 1. My own bills to DiaCare (my own subscription payments)
            const transRes = await api.get(`/Transactions/user/${doctorId}`);
            const allTrans = transRes.data;
            
            // Separate: bills I paid vs revenue I earned
            const myBills = allTrans.filter(t => !t.paymentIntentId?.startsWith('manual_'));
            const myRevenue = allTrans.filter(t => t.paymentIntentId?.startsWith('manual_'));

            setMyTransactions(myBills); // Only bills for 'my_bills' tab
            setPatientSubscribers(myRevenue); // Revenue tab: real recorded transactions

            // 2. My Packages to get prices
            const pkgsRes = await api.get('/ClinicPackages');
            setPackages(pkgsRes.data);

        } catch (err) {
            console.error("Erreur de récupération des données", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSubscriptionStatus = async (user) => {
        const newStatus = !user.subscription?.isActive;
        const action = newStatus ? "activer" : "désactiver";
        if (!confirm(`Voulez-vous vraiment ${action} l'abonnement de ${user.fullName} ?`)) return;

        try {
            await api.patch(`/Users/${user.id}/subscription`, {
                isActive: newStatus,
                planType: user.subscription?.planType || 'Standard'
            });
            // Refresh data
            fetchData(doctorInfo.id);
        } catch (err) {
            console.error("Error updating subscription", err);
            alert("Erreur lors de la mise à jour.");
        }
    };

    const handleOpenInvoice = (user) => {
        setSelectedUserForInvoice(user);
        setIsInvoiceOpen(true);
    };

    const filteredMyBills = myTransactions.filter(p => 
        p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.planName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredRevenue = patientSubscribers.filter(t => 
        (t.userFullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.planName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-10 text-white">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395] rounded-2xl flex items-center justify-center shadow-xl">
                                <Wallet size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                    Gestion <span className="text-white/40">Financière</span>
                                </h1>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-2">Suivi des abonnements patients et de vos factures DiaCare</p>
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

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#088395] transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={activeTab === 'revenue' ? "RECHERCHER UN PATIENT PAR NOM..." : "RECHERCHER PAR ID TRANSACTION..."}
                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all placeholder:text-white/20"
                    />
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    {activeTab === 'revenue' ? (
                                        <>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Patient (Parent)</th>
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
                                    <tr><td colSpan="5" className="px-10 py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs italic">Chargement des données sécurisées...</td></tr>
                                ) : (activeTab === 'revenue' ? filteredRevenue : filteredMyBills).length === 0 ? (
                                    <tr><td colSpan="5" className="px-10 py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs italic">Aucune donnée correspondante.</td></tr>
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
                                                                <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">{item.paymentIntentId?.startsWith('manual_') ? 'Activation manuelle' : item.paymentIntentId}</div>
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
                                                            onClick={() => handleOpenInvoice({ id: item.userId, fullName: item.userFullName || 'Patient', email: item.userEmail || '', subscription: { planType: item.planName || 'Standard', isActive: true }, amount: item.amount })}
                                                            className="p-4 bg-white/5 hover:bg-white hover:text-[#0b1b2b] rounded-2xl text-[#088395] transition-all border border-white/10 group" 
                                                            title="Générer et envoyer la facture"
                                                        >
                                                            <Receipt size={18} className="group-hover:scale-110 transition-transform" />
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
                                                            onClick={() => handleOpenInvoice({ id: doctorInfo?.id, fullName: doctorInfo?.fullName, subscription: { planType: item.planName || 'Standard', isActive: true }, amount: item.amount, isSelfBill: true })}
                                                            className="p-4 bg-white/5 hover:bg-white hover:text-[#0b1b2b] rounded-2xl text-white/20 transition-all border border-white/10 group"
                                                            title="Télécharger ma facture DiaCare"
                                                        >
                                                            <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
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
                        activeTab === 'revenue' ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
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
                                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Nombre Activations</p>
                                    <div className="text-3xl font-black italic tracking-tight text-white/60">
                                        {patientSubscribers.length}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'my_bills' && (
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Prochaine Échéance</p>
                                <div className="text-2xl font-black italic tracking-tight text-white/40">
                                    30 Jours
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Invoice Generator Modal */}
            {selectedUserForInvoice && (
                <InvoiceGenerator
                    isOpen={isInvoiceOpen}
                    onClose={() => setIsInvoiceOpen(false)}
                    user={selectedUserForInvoice}
                    issuerInfo={selectedUserForInvoice.isSelfBill ? undefined : {
                        name: `Dr. ${doctorInfo?.fullName || 'Médecin'}`,
                        address: doctorInfo?.address || 'Cabinet Médical',
                        phone: doctorInfo?.contactNumber || '',
                        email: doctorInfo?.email || '',
                        website: 'www.diacarekids.com'
                    }}
                    plan={{
                        name: selectedUserForInvoice.subscription?.planType || 'Consultation',
                        price: selectedUserForInvoice.amount ? (selectedUserForInvoice.amount / 100) : (packages.find(p => p.name === selectedUserForInvoice.subscription?.planType)?.price || 80), 
                        currency: selectedUserForInvoice.isSelfBill ? 'DT' : 'DT',
                        description: selectedUserForInvoice.isSelfBill ? `Abonnement Plateforme DiaCare Kids - ${selectedUserForInvoice.subscription?.planType}` : `Honoraires de suivi médical (Cabinet) pour ${selectedUserForInvoice.fullName}`
                    }}
                />
            )}
        </DashboardLayout>
    );
}
