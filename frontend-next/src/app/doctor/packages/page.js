"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, X, Package, Shield, Zap, Info } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function DoctorPackagesPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPackage, setCurrentPackage] = useState(null);

    // Form states
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [paymentFrequency, setPaymentFrequency] = useState('Mensuel');
    const [servicesText, setServicesText] = useState('');
    const [maxKidsPerParent, setMaxKidsPerParent] = useState(1);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await api.get('/ClinicPackages');
            setPackages(res.data);
        } catch (err) {
            console.error("Error fetching packages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (pkg) => {
        setCurrentPackage(pkg);
        setName(pkg.name);
        setPrice(pkg.price);
        setPaymentFrequency(pkg.paymentFrequency);
        setServicesText(pkg.services.join('\n'));
        setMaxKidsPerParent(pkg.maxKidsPerParent);
        setIsEditing(true);
    };

    const handleNew = () => {
        setCurrentPackage(null);
        setName('');
        setPrice(0);
        setPaymentFrequency('Mensuel');
        setServicesText('');
        setMaxKidsPerParent(1);
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name,
                price: Number(price),
                paymentFrequency,
                services: servicesText.split('\n').filter(s => s.trim() !== ''),
                maxKidsPerParent: Number(maxKidsPerParent),
                isActive: true
            };

            if (currentPackage) {
                await api.put(`/ClinicPackages/${currentPackage.id}`, payload);
            } else {
                await api.post('/ClinicPackages', payload);
            }

            setIsEditing(false);
            fetchPackages();
        } catch (err) {
            console.error("Error saving package", err);
            alert("Erreur lors de la sauvegarde.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Voulez-vous vraiment désactiver ce pack ?")) {
            try {
                await api.delete(`/ClinicPackages/${id}`);
                fetchPackages();
            } catch (err) {
                console.error("Error deleting", err);
            }
        }
    };

    if (loading) return (
        <DashboardLayout role="Medecin">
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-white">
                <div className="w-12 h-12 border-4 border-[#088395] border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">Chargement de vos offres...</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-10 text-white">
                
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Package size={28} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Packs <span className="text-white/40">& Forfaits</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Configurez les formules d'abonnement pour les parents de vos patients</p>
                    </div>

                    {!isEditing && (
                        <button 
                            onClick={handleNew} 
                            className="bg-[#088395] hover:bg-[#066a7a] text-white flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus size={18} /> Créer un nouveau pack
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[40px] shadow-2xl relative overflow-hidden"
                    >
                         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Package size={120} />
                        </div>

                        <h2 className="text-2xl font-black text-white mb-10 uppercase italic tracking-tighter">
                            {currentPackage ? 'Mise à jour du' : 'Nouveau'} <span className="text-[#088395]">Pack de suivi</span>
                        </h2>

                        <form onSubmit={handleSave} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 pl-2">Désignation du Pack</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all" placeholder="EX: SUIVI MENSUEL PREMIUM" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 pl-2">Tarif (DT)</label>
                                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 pl-2">Périodicité</label>
                                    <select value={paymentFrequency} onChange={e => setPaymentFrequency(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all text-white appearance-none">
                                        <option value="Mensuel" className="bg-[#0b1b2b]">Mensuel</option>
                                        <option value="Trimestriel" className="bg-[#0b1b2b]">Trimestriel</option>
                                        <option value="Annuel" className="bg-[#0b1b2b]">Annuel</option>
                                        <option value="Par Consultation" className="bg-[#0b1b2b]">Par Consultation</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 pl-2">Capacité Enfants / Parent</label>
                                    <input type="number" value={maxKidsPerParent} onChange={e => setMaxKidsPerParent(e.target.value)} required min="1" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 pl-2">Avantages inclus (1 par ligne)</label>
                                <textarea value={servicesText} onChange={e => setServicesText(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all resize-none" placeholder="EX: 1 CONSULTATION PAR MOIS&#10;ACCÈS AUX ALERTES TEMPS RÉEL&#10;TÉLÉ-CONSULTATION INCLUSE"></textarea>
                            </div>
                            
                            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-10 py-4 rounded-xl bg-white/5 text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all">
                                    Abandonner
                                </button>
                                <button type="submit" className="px-10 py-4 rounded-xl bg-[#088395] text-white hover:bg-[#066a7a] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl">
                                    <Check size={16} /> Valider le pack
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {packages.length === 0 ? (
                                <div className="col-span-full py-20 bg-white/2 border border-white/5 border-dashed rounded-[40px] flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white/10"><Info size={32} /></div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-black uppercase italic tracking-tighter">Aucun pack configuré</p>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Cliquez sur le bouton en haut à droite pour créer votre première offre</p>
                                    </div>
                                </div>
                            ) : packages.map(pkg => (
                                <motion.div 
                                    key={pkg.id} 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    className={cn(
                                        "bg-white/5 border backdrop-blur-3xl p-8 rounded-[40px] relative group flex flex-col shadow-2xl transition-all hover:border-[#088395]/50",
                                        pkg.isActive ? 'border-white/10' : 'border-red-500/20 opacity-50 grayscale'
                                    )}
                                >
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleEdit(pkg)} className="p-3 bg-white/5 hover:bg-white hover:text-[#0b1b2b] rounded-xl transition-all shadow-xl border border-white/10"><Edit2 size={14} /></button>
                                        {pkg.isActive && <button onClick={() => handleDelete(pkg.id)} className="p-3 bg-red-500/10 hover:bg-red-500 text-white rounded-xl transition-all shadow-xl border border-red-500/20"><Trash2 size={14} /></button>}
                                    </div>
                                    
                                    <div className="w-14 h-14 bg-[#088395] rounded-2xl flex items-center justify-center text-white mb-8 shadow-[0_10px_20px_rgba(8,131,149,0.3)]">
                                        <Package size={24} />
                                    </div>

                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">{pkg.name}</h3>
                                    
                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-4xl font-black italic">{pkg.price} DT</span>
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">/ {pkg.paymentFrequency}</span>
                                    </div>

                                    <div className="space-y-4 mb-10 flex-1">
                                        {pkg.services.map((service, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                                    <Check size={10} className="text-green-500" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-white/60 leading-normal">{service}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                                            <Zap size={12} className="text-yellow-500" /> {pkg.maxKidsPerParent} Enfants Max
                                        </div>
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            pkg.isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                        )}>
                                            {pkg.isActive ? 'Actif' : 'Désactivé'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
