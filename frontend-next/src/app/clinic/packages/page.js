"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, X, Package } from 'lucide-react';
import api from '@/lib/api';

export default function ClinicPackagesPage() {
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

    if (loading) return <DashboardLayout role="Clinique"><div className="text-white text-center py-20">Chargement...</div></DashboardLayout>;

    return (
        <DashboardLayout role="Clinique">
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Packs & Forfaits</h1>
                        <p className="text-white/50 text-sm font-bold tracking-widest uppercase">Créez et gérez les offres pour vos patients</p>
                    </div>
                    {!isEditing && (
                        <button onClick={handleNew} className="btn-apple bg-[#088395] hover:bg-[#088395]/0.80 text-white flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl">
                            <Plus size={20} /> Nouveau Pack
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-2xl">
                        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">{currentPackage ? 'Modifier le Pack' : 'Créer un Nouveau Pack'}</h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Nom du Pack</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#088395]" placeholder="Ex: Suivi Mensuel Basic" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Prix (TND)</label>
                                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#088395]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Fréquence de Paiement</label>
                                    <select value={paymentFrequency} onChange={e => setPaymentFrequency(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#088395]">
                                        <option value="Mensuel" className="bg-[#0b1b2b]">Mensuel</option>
                                        <option value="Trimestriel" className="bg-[#0b1b2b]">Trimestriel</option>
                                        <option value="Annuel" className="bg-[#0b1b2b]">Annuel</option>
                                        <option value="Par Consultation" className="bg-[#0b1b2b]">Par Consultation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Max Enfants par Parent</label>
                                    <input type="number" value={maxKidsPerParent} onChange={e => setMaxKidsPerParent(e.target.value)} required min="1" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#088395]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Services Inclus (1 par ligne)</label>
                                <textarea value={servicesText} onChange={e => setServicesText(e.target.value)} rows={4} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#088395]" placeholder="Ex: 1 Consultation par mois&#10;Suivi des glycémies&#10;Messagerie 24/7"></textarea>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs transition-all">
                                    Annuler
                                </button>
                                <button type="submit" className="px-6 py-3 rounded-xl bg-[#088395] text-white hover:bg-[#088395]/0.80 font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg">
                                    <Check size={16} /> Enregistrer
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map(pkg => (
                            <motion.div key={pkg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`bg-white/5 border ${pkg.isActive ? 'border-[#088395]/40' : 'border-red-500/40 opacity-60'} p-6 rounded-3xl backdrop-blur-md relative group flex flex-col`}>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(pkg)} className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"><Edit2 size={14} /></button>
                                    {pkg.isActive && <button onClick={() => handleDelete(pkg.id)} className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/40"><Trash2 size={14} /></button>}
                                </div>
                                <div className="w-12 h-12 bg-[#088395]/20 rounded-xl flex items-center justify-center text-[#088395] mb-4">
                                    <Package size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-1">{pkg.name}</h3>
                                <div className="text-2xl font-black text-[#088395] mb-4">{pkg.price} {pkg.currency} <span className="text-sm text-white/40 uppercase font-bold tracking-widest">/ {pkg.paymentFrequency}</span></div>
                                <ul className="space-y-2 mb-6 flex-1">
                                    {pkg.services.map((service, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-white/0.70">
                                            <Check size={16} className="text-[#088395] mt-0.5" />
                                            <span>{service}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-auto pt-4 border-t border-white/10 text-xs text-white/40 font-bold uppercase tracking-widest flex justify-between">
                                    <span>{pkg.maxKidsPerParent} Enfant(s) Max</span>
                                    <span>{pkg.isActive ? 'Actif' : 'Inactif'}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
