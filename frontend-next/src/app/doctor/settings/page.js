"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Settings, Camera, User, Mail,
    Phone, Shield, Lock, Bell,
    Globe, Save, Stethoscope, Briefcase,
    Credential, History, Key, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SettingsSection = ({ title, sub, icon, children }) => (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl space-y-10 group hover:border-[#088395]/30 transition-all">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-[#088395]">
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

const InputField = ({ label, placeholder, icon: Icon, type = "text", value }) => (
    <div className="space-y-3 group/field">
        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within/field:text-[#088395] transition-colors pl-2">{label}</label>
        <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#088395] transition-colors">
                <Icon size={18} />
            </div>
            <input
                type={type}
                defaultValue={value}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-[22px] py-5 px-16 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] focus:bg-white/10 transition-all text-white placeholder:text-white/5"
            />
        </div>
    </div>
);

export default function DoctorSettings() {
    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-10 text-white max-w-5xl mx-auto">

                {/* Header SECTION 10 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Settings size={28} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Mon <span className="text-white/40">Profil Médico</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gérez vos informations professionnelles et votre sécurité</p>
                    </div>

                    <button className="flex items-center gap-3 px-10 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(8,131,149,0.3)] hover:scale-105 active:scale-95 transition-all">
                        <Save size={18} /> Mettre à jour profil
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-12">

                    {/* Professional Info SECTION 10 */}
                    <SettingsSection title="Informations Professionnelles" sub="Détails de votre identité médicale et spécialisation" icon={<Stethoscope size={24} />}>
                        <div className="flex flex-col lg:flex-row gap-12">
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative group/photo">
                                    <div className="w-40 h-40 rounded-[48px] overflow-hidden border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5 group-hover/photo:border-[#088395] transition-all">
                                        <User size={60} className="text-white/10 group-hover/photo:text-[#088395] transition-colors" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all cursor-pointer">
                                            <Camera size={30} className="text-white" />
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-center mt-4 text-white/20 italic">Format souhaité: PNG ou JPG</p>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Prénom & Nom" placeholder="DR. flen" icon={User} value="Dr. Ahmed Amor" />
                                <InputField label="Spécialité" placeholder="EX: ENDOCRINOLOGUE PÉDIATRE" icon={Briefcase} value="Endocrinologue Pédiatre" />
                                <InputField label="Numéro d'ordre" placeholder="12345" icon={Shield} value="9201-TU-2024" />
                                <InputField label="Email Professionnel" placeholder="DIRECT@DOCTOR.TN" icon={Mail} value="ahmed.amor@diacare.tn" />
                                <InputField label="Téléphone" placeholder="+216 -- --- ---" icon={Phone} value="+216 22 123 456" />
                                <InputField label="Langue de l'interface" placeholder="FRANÇAIS" icon={Globe} value="Français (FR)" />
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Security & Access SECTION 10 */}
                    <SettingsSection title="Sécurité du E-Cabinet" sub="Protégez votre accès aux données sensibles" icon={<Lock size={24} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <InputField label="Mot de passe actuel" placeholder="••••••••••••" icon={Lock} type="password" />
                                <InputField label="Nouveau mot de passe" placeholder="••••••••••••" icon={Lock} type="password" />
                                <button className="w-full py-5 border border-white/10 hover:border-[#088395] hover:text-[#088395] rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all">
                                    Changer de mot de passe
                                </button>
                            </div>

                            <div className="space-y-8 p-8 bg-white/2 rounded-[32px] border border-white/5">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 italic">
                                    <Smartphone size={18} className="text-[#088395]" /> Double Facteur (2FA)
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Notification Mobile</span>
                                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Actif sur iPhone 15 Pro</span>
                                    </div>
                                    <div className="w-14 h-8 bg-[#088395] rounded-full p-1 flex justify-end cursor-pointer transition-all">
                                        <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-white/40 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                                        <Bell size={14} /> Préférences de notifications critiques
                                    </div>
                                    <div className="flex items-center gap-4 text-white/40 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                                        <Key size={14} /> Historique des accès (IP Logs)
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
