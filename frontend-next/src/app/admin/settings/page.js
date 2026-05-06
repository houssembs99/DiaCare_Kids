"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Settings, User, Mail,
    Shield, Lock, Bell,
    Save, Key, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const SettingsSection = ({ title, sub, icon, children }) => (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl space-y-10 group hover:border-[#1E88E5]/30 transition-all">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-[#1E88E5]">
                    {icon}
                    <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-white italic">{title}</h2>
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{sub}</p>
            </div>
        </div>
        <div className="space-y-8">
            {children}
        </div>
    </div>
);

const InputField = ({ label, placeholder, icon: Icon, type = "text", value, onChange }) => (
    <div className="space-y-3 group/field">
        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within/field:text-[#1E88E5] transition-colors pl-2">{label}</label>
        <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#1E88E5] transition-colors">
                <Icon size={18} />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-[22px] py-5 px-16 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#1E88E5] focus:bg-white/10 transition-all text-white placeholder:text-white/5"
            />
        </div>
    </div>
);

export default function AdminSettings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            alert("Mot de passe modifié avec succès !");
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Erreur lors du changement de mot de passe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Settings size={28} className="text-[#1E88E5]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Mon <span className="text-white/40">Profil Admin</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gérez vos accès privilégiés et la sécurité système</p>
                    </div>

                    <button className="flex items-center gap-3 px-10 py-5 bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(30,136,229,0.3)] hover:scale-105 active:scale-95 transition-all">
                        <Save size={18} /> Sauvegarder Profil
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-12">

                    {/* Admin Info */}
                    <SettingsSection title="Informations Administrateur" sub="Vos identifiants de gestionnaire système" icon={<Shield size={24} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Prénom & Nom" placeholder="Admin" icon={User} value="Houssem" />
                            <InputField label="Email Système" placeholder="ADMIN@DIACARE.TN" icon={Mail} value="admin@diacare.tn" />
                        </div>
                    </SettingsSection>

                    {/* Security */}
                    <SettingsSection title="Sécurité du Super-Admin" sub="Renforcez la protection de votre accès" icon={<Lock size={24} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <InputField 
                                    label="Mot de passe actuel" 
                                    placeholder="••••••••••••" 
                                    icon={Lock} 
                                    type="password" 
                                    value={currentPassword}
                                    onChange={setCurrentPassword}
                                />
                                <InputField 
                                    label="Nouveau mot de passe" 
                                    placeholder="••••••••••••" 
                                    icon={Lock} 
                                    type="password" 
                                    value={newPassword}
                                    onChange={setNewPassword}
                                />
                                <button 
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                    className="w-full py-5 border border-white/10 hover:border-[#1E88E5] hover:text-[#1E88E5] rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    {loading ? "Chargement..." : "Mettre à jour mot de passe"}
                                </button>
                            </div>

                            <div className="space-y-8 p-8 bg-white/2 rounded-[32px] border border-white/5">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 italic">
                                    <Smartphone size={18} className="text-[#1E88E5]" /> Sécurité Avancée
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-white/40 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                                        <Bell size={14} /> Alertes de connexion suspecte
                                    </div>
                                    <div className="flex items-center gap-4 text-white/40 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                                        <Key size={14} /> Gestion des clés API système
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                </div>

            </div>
        </DashboardLayout>
    );
}
