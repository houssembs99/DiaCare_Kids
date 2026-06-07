"use client";

import React, { useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Settings, User, Mail,
    Shield, Lock, Bell,
    Save, Key, Smartphone,
    Upload, Image, Trash2, CheckCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useLogo } from '@/lib/LogoContext';

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
    const { logoUrl, setLogoUrl } = useLogo();
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoSaved, setLogoSaved] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleLogoUpload = async (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert("Format non supporté. Utilisez PNG, JPG, SVG ou WebP.");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Fichier trop volumineux. Taille maximale : 5 Mo.");
            return;
        }

        setLogoUploading(true);
        setLogoSaved(false);

        try {
            // Upload to Cloudinary via backend
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/settings/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const uploadedUrl = response.data.logoUrl;
            setLogoUrl(uploadedUrl);
            setLogoSaved(true);
            setTimeout(() => setLogoSaved(false), 3000);
        } catch (err) {
            console.error('Logo upload error:', err);
            // Fallback: convert to base64 and store locally
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoUrl(e.target.result);
                setLogoSaved(true);
                setTimeout(() => setLogoSaved(false), 3000);
            };
            reader.readAsDataURL(file);
        } finally {
            setLogoUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleLogoUpload(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => setDragActive(false);

    const removeLogo = () => {
        setLogoUrl(null);
        setLogoSaved(false);
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

                    {/* ═══ Logo de la Plateforme ═══ */}
                    <SettingsSection 
                        title="Logo de la Plateforme" 
                        sub="Personnalisez l'identité visuelle de DiaCare Kids" 
                        icon={<Image size={24} />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Upload Zone */}
                            <div className="space-y-6">
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "relative border-2 border-dashed rounded-[28px] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 min-h-[220px] group",
                                        dragActive
                                            ? "border-[#1E88E5] bg-[#1E88E5]/10 scale-[1.02]"
                                            : "border-white/15 bg-white/3 hover:border-[#1E88E5]/50 hover:bg-white/5"
                                    )}
                                >
                                    {logoUploading ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-3"
                                        >
                                            <Loader2 size={36} className="text-[#1E88E5] animate-spin" />
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Upload en cours...</span>
                                        </motion.div>
                                    ) : logoSaved ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-3"
                                        >
                                            <CheckCircle size={36} className="text-green-400" />
                                            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Logo sauvegardé !</span>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#1E88E5]/40 group-hover:bg-[#1E88E5]/10 transition-all">
                                                <Upload size={28} className="text-white/30 group-hover:text-[#1E88E5] transition-colors" />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <p className="text-xs font-bold text-white/60">
                                                    Glissez-déposez votre logo ici
                                                </p>
                                                <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest">
                                                    ou cliquez pour parcourir
                                                </p>
                                                <p className="text-[8px] font-bold text-white/15 uppercase tracking-widest mt-2">
                                                    PNG, JPG, SVG, WebP • Max 5 Mo
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                        className="hidden"
                                        onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 pl-2">
                                        Aperçu du Logo
                                    </label>
                                    <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
                                        {logoUrl ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col items-center gap-6 w-full"
                                            >
                                                {/* Logo preview in different contexts */}
                                                <div className="space-y-4 w-full">
                                                    {/* Navbar preview */}
                                                    <div className="bg-[#0b1b2b]/80 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
                                                        <img 
                                                            src={logoUrl} 
                                                            alt="Logo" 
                                                            className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1"
                                                        />
                                                        <div>
                                                            <span className="text-sm font-extrabold tracking-tight uppercase leading-none">
                                                                <span className="text-[#1E88E5]">DiaCare</span><span className="text-white italic">Kids</span>
                                                            </span>
                                                            <div className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em]">Navbar</div>
                                                        </div>
                                                    </div>

                                                    {/* Large preview */}
                                                    <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
                                                        <img 
                                                            src={logoUrl} 
                                                            alt="Logo DiaCare Kids" 
                                                            className="max-h-20 max-w-[200px] object-contain"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Remove button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeLogo();
                                                    }}
                                                    className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/20 hover:border-red-500/40"
                                                >
                                                    <Trash2 size={14} />
                                                    Supprimer le logo
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <Image size={48} className="text-white/20" />
                                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest text-center">
                                                    Aucun logo importé
                                                </p>
                                                <p className="text-[8px] font-bold text-white/15 uppercase tracking-widest text-center max-w-[200px]">
                                                    Le logo sera affiché dans la navbar, le footer et les factures
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Where it will be used */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {[
                                { label: 'Navbar', desc: 'Barre de navigation' },
                                { label: 'Footer', desc: 'Pied de page' },
                                { label: 'Factures', desc: 'Documents PDF' },
                                { label: 'Emails', desc: 'Notifications' },
                            ].map((item) => (
                                <div key={item.label} className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                                    <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">{item.label}</div>
                                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">{item.desc}</div>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mx-auto mt-3",
                                        logoUrl ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" : "bg-white/10"
                                    )} />
                                </div>
                            ))}
                        </div>
                    </SettingsSection>

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
