"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Settings, Camera, User, Mail,
    Phone, MapPin, Shield, Lock,
    Bell, Globe, Save, Trash2,
    Building2, Key, Smartphone, ChevronRight, History as HistoryIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const SettingsSection = ({ title, sub, icon, children }) => (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl space-y-10 group hover:border-[#088395]/30 transition-all">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-[#088395]">
                    {icon}
                    <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-white">{title}</h2>
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
        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within/field:text-[#088395] transition-colors pl-2">{label}</label>
        <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#088395] transition-colors">
                <Icon size={18} />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-[22px] py-5 px-16 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] focus:bg-white/10 transition-all text-white placeholder:text-white/5"
            />
        </div>
    </div>
);

export default function ClinicSettings() {
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
        <DashboardLayout role="Clinique">
            <div className="space-y-12 pb-10 text-white max-w-5xl mx-auto">

                {/* Header SECTION 10.2 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Settings size={28} className="text-[#088395] animate-spin-slow" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Config. <span className="text-white/40">Clinique</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Personnalisez votre espace et gérez la sécurité</p>
                    </div>

                    <button className="flex items-center gap-3 px-10 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(8,131,149,0.3)] hover:scale-105 active:scale-95 transition-all">
                        <Save size={18} /> Sauvegarder
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-12">

                    {/* Clinic Profile SECTION 10.2 */}
                    <SettingsSection title="Informations Clinique" sub="Configurez l'identité publique de votre établissement" icon={<Building2 size={24} />}>
                        <div className="flex flex-col lg:flex-row gap-12">
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative group/photo">
                                    <div className="w-40 h-40 rounded-[48px] overflow-hidden border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5 group-hover/photo:border-[#088395] transition-all">
                                        <Building2 size={60} className="text-white/10 group-hover/photo:text-[#088395] transition-colors" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all cursor-pointer">
                                            <Camera size={30} className="text-white" />
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-center mt-4 text-white/20 italic">Format: PNG, JPG (SVG recommandé)</p>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Nom de la Clinique" placeholder="EX: CLINIQUE EL AMEL" icon={Building2} value="Clinique Centrale Tunis" />
                                <InputField label="Email de Contact" placeholder="EX: CONTACT@CLINIC.TN" icon={Mail} value="admin@clinic-central.tn" />
                                <InputField label="Téléphone" placeholder="+216 -- --- ---" icon={Phone} value="+216 71 000 000" />
                                <InputField label="Site Web" placeholder="WWW.VOTRESITE.TN" icon={Globe} value="www.clinic-tunis.tn" />
                                <div className="md:col-span-2">
                                    <InputField label="Adresse Physique" placeholder="RUE DE LA MÉDECINE, TUNIS" icon={MapPin} value="12 Avenue Habib Bourguiba, 1000 Tunis" />
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Security & Access SECTION 10.2 */}
                    <SettingsSection title="Sécurité & Accès" sub="Protégez votre compte et gérez les autorisations" icon={<Shield size={24} />}>
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
                                    className="w-full py-5 border border-white/10 hover:border-[#088395] hover:text-[#088395] rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all mt-4 disabled:opacity-50"
                                >
                                    {loading ? "Chargement..." : "Mettre à jour le mot de passe"}
                                </button>
                            </div>

                            <div className="space-y-8 p-8 bg-white/2 rounded-[32px] border border-white/5">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                                    <Smartphone size={18} className="text-[#088395]" /> 2FA Authentication
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Double Authentification</span>
                                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Renforce la sécurité lors de la connexion</span>
                                    </div>
                                    <div className="w-14 h-8 bg-[#088395] rounded-full p-1 flex justify-end cursor-pointer">
                                        <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-white/40 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                                        <Key size={14} /> Gérer les clés de sécurité physique
                                    </div>
                                    <div className="flex items-center gap-4 text-white/40 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                                        <HistoryIcon size={14} /> Voir l'historique des connexions
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Responsible Manager SECTION 10.2 */}
                    <SettingsSection title="Responsable de Clinique" sub="Informations sur le gestionnaire principal" icon={<User size={24} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputField label="Prénom & Nom" placeholder="flen" icon={User} value="Houssem Ben Salem" />
                            <InputField label="Poste / Rôle" placeholder="EX: DIRECTEUR ADM." icon={Shield} value="Responsable Médical" />
                            <InputField label="Identifiant Système" placeholder="ID-0000" icon={Key} value="USER-CL-9201" />
                        </div>
                    </SettingsSection>

                    {/* Dangerous Zone */}
                    <div className="p-10 bg-accent/5 border border-accent/20 rounded-[40px] flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                            <Trash2 size={32} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Zone de Danger</h2>
                            <p className="text-sm font-medium text-white/30 max-w-lg mx-auto leading-relaxed">
                                La suppression de votre compte clinique est irréversible. Toutes les données des médecins et des patients seront définitivement effacées conformément au RGPD.
                            </p>
                        </div>
                        <button className="px-10 py-5 bg-accent/20 hover:bg-accent text-accent hover:text-white border border-accent/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                            Désactiver le Compte Clinique
                        </button>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
