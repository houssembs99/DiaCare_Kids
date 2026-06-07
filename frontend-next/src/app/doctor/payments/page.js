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
            // 1. My own bills to DiaCare
            const transRes = await api.get(`/Transactions/user/${doctorId}`);
            setMyTransactions(transRes.data);

            // 2. Parents (Patients) managed by me to see their payment status
            const usersRes = await api.get('/Users');
            const myPatients = usersRes.data.filter(u => 
                u.associatedDoctorId === doctorId && u.role === 'Parent'
            );
            setPatientSubscribers(myPatients);

            // 3. My Packages to get prices
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

    const filteredPatients = patientSubscribers.filter(p => 
        p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">Échéance</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">Statut Paiement</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-right">Actions</th>
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
                                ) : (activeTab === 'revenue' ? filteredPatients : filteredMyBills).length === 0 ? (
                                    <tr><td colSpan="5" className="px-10 py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs italic">Aucune donnée correspondante.</td></tr>
                                ) : (
                                    (activeTab === 'revenue' ? filteredPatients : filteredMyBills).map((item, idx) => (
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
                                                                {item.fullName?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black uppercase italic tracking-tight">{item.fullName}</div>
                                                                <div className="text-[10px] font-bold text-white/20 lowercase tracking-widest">{item.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                                            {item.subscription?.planType || 'Standard'}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-center">
                                                        <span className="text-xs font-bold text-white/40">
                                                            {item.subscription?.expiryDate ? new Date(item.subscription.expiryDate).toLocaleDateString() : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex justify-center">
                                                            <button 
                                                                onClick={() => toggleSubscriptionStatus(item)}
                                                                className={cn(
                                                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                                    item.subscription?.isActive 
                                                                        ? "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20" 
                                                                        : "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20"
                                                                )}
                                                            >
                                                                {item.subscription?.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                                {item.subscription?.isActive ? 'Payé (Actif)' : 'Non Payé (Inactif)'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <button 
                                                            onClick={() => handleOpenInvoice(item)}
                                                            className="px-6 py-3 bg-[#088395] hover:bg-[#066a7a] text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ml-auto"
                                                        >
                                                            <Receipt size={14} /> Gérer Facture
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
                                                            {(item.amount / 100).toFixed(2)} €
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[9px] font-black uppercase tracking-widest w-fit">
                                                            <CheckCircle2 size={12} /> Payée
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <button className="p-4 bg-white/5 hover:bg-white hover:text-[#0b1b2b] rounded-2xl text-white/20 transition-all border border-white/10 group">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Total {activeTab === 'revenue' ? 'Patients' : 'Dépenses'}</p>
                            <div className="text-3xl font-black italic tracking-tight">
                                {activeTab === 'revenue' ? patientSubscribers.length : `${(myTransactions.reduce((acc, c) => acc + c.amount, 0) / 100).toFixed(2)} €`}
                            </div>
                        </div>
                        {activeTab === 'revenue' && (
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Abonnements Actifs</p>
                                <div className="text-3xl font-black italic tracking-tight text-green-400">
                                    {patientSubscribers.filter(p => p.subscription?.isActive).length}
                                </div>
                            </div>
                        )}
                        {activeTab === 'revenue' && (
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">En Attente</p>
                                <div className="text-3xl font-black italic tracking-tight text-red-400">
                                    {patientSubscribers.filter(p => !p.subscription?.isActive).length}
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
                    issuerInfo={{
                        name: `Dr. ${doctorInfo?.fullName || 'Médecin'}`,
                        address: doctorInfo?.address || 'Cabinet Médical',
                        phone: doctorInfo?.contactNumber || '',
                        email: doctorInfo?.email || '',
                        website: 'www.diacarekids.com'
                    }}
                    plan={{
                        name: selectedUserForInvoice.subscription?.planType || 'Consultation',
                        price: packages.find(p => p.name === selectedUserForInvoice.subscription?.planType)?.price || 80, 
                        currency: 'TND',
                        description: `Honoraires de suivi médical (Cabinet) pour ${selectedUserForInvoice.fullName}`
                    }}
                />
            )}
        </DashboardLayout>
    );
}
