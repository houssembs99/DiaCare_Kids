"use client";

import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Settings, User, Mail,
    Shield, Lock, Bell,
    Save, Key, Smartphone,
    Upload, Image, Trash2, CheckCircle, Loader2,
    Phone, MapPin, Quote, Globe, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useBranding } from '@/lib/BrandingContext';

const SettingsSection = ({ title, sub, icon, children, action }) => (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl space-y-10 group hover:border-[#1E88E5]/30 transition-all text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-[#1E88E5]">
                    {icon}
                    <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tighter italic">{title}</h2>
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{sub}</p>
            </div>
            {action && <div>{action}</div>}
        </div>
        <div className="space-y-8">
            {children}
        </div>
    </div>
);

const InputField = ({ label, placeholder, icon: Icon, type = "text", value, onChange, textarea = false }) => (
    <div className="space-y-3 group/field">
        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within/field:text-[#1E88E5] transition-colors pl-2">{label}</label>
        <div className="relative">
            <div className={cn(
                "absolute left-6 text-white/20 group-focus-within/field:text-[#1E88E5] transition-colors",
                textarea ? "top-6" : "top-1/2 -translate-y-1/2"
            )}>
                <Icon size={18} />
            </div>
            {textarea ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 px-16 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#1E88E5] focus:bg-white/10 transition-all text-white placeholder:text-white/5 resize-none"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-[22px] py-5 px-16 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#1E88E5] focus:bg-white/10 transition-all text-white placeholder:text-white/5"
                />
            )}
        </div>
    </div>
);

export default function AdminSettings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Branding Logic
    const { branding, updateBranding, isLoading } = useBranding();
    const [footerDescription, setFooterDescription] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactAddress, setContactAddress] = useState('');
    const [contactWebsite, setContactWebsite] = useState('');

    // Only populate form fields when branding finishes loading for the first time
    useEffect(() => {
        if (!isLoading && branding) {
            setFooterDescription(branding.description || '');
            setContactPhone(branding.phone || '');
            setContactEmail(branding.email || '');
            setContactAddress(branding.address || '');
            setContactWebsite(branding.website || '');
        }
    }, [isLoading, branding]);

    const [logoUploading, setLogoUploading] = useState(false);
    const [logoSaved, setLogoSaved] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleSaveBranding = () => {
        console.log("Saving footer branding...");
        updateBranding({
            description: footerDescription,
            phone: contactPhone,
            email: contactEmail,
            address: contactAddress,
            website: contactWebsite
        });
        setLogoSaved(true);
        setTimeout(() => setLogoSaved(false), 3000);
    };

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

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert("Format non supporté. Utilisez PNG, JPG, SVG ou WebP.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Fichier trop volumineux. Taille maximale : 5 Mo.");
            return;
        }

        setLogoUploading(true);
        setLogoSaved(false);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/settings/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const uploadedUrl = response.data.logoUrl;
            updateBranding({ logoUrl: uploadedUrl });
            setLogoSaved(true);
            setTimeout(() => setLogoSaved(false), 3000);
        } catch (err) {
            console.error('Logo upload error:', err);
            const reader = new FileReader();
            reader.onload = (e) => {
                updateBranding({ logoUrl: e.target.result });
                setLogoSaved(true);
                setTimeout(() => setLogoSaved(false), 3000);
            };
            reader.readAsDataURL(file);
        } finally {
            setLogoUploading(false);
        }
    };

    const removeLogo = () => {
        updateBranding({ logoUrl: null });
    };

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16 px-4 lg:px-0">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Settings size={28} className="text-[#1E88E5]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Paramètres <span className="text-white/40">Plateforme</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Configurez l'identité et les coordonnées de DiaCare Kids</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleSaveBranding}
                            className="flex items-center gap-3 px-10 py-5 bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(30,136,229,0.3)] hover:scale-105 active:scale-95 transition-all"
                        >
                            <Save size={18} /> {logoSaved ? "Modifications Enregistrées !" : "Sauvegarder tout"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 px-4 lg:px-0">

                    {/* ═══ Identité Visuelle (Logo) ═══ */}
                    <SettingsSection
                        title="Identité Visuelle"
                        sub="Logo s'affichant en haut et au pied de page"
                        icon={<Image size={24} />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div
                                    onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) handleLogoUpload(f); }}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "relative border-2 border-dashed rounded-[28px] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 min-h-[220px] group",
                                        dragActive ? "border-[#1E88E5] bg-[#1E88E5]/10 scale-[1.02]" : "border-white/15 bg-white/3 hover:border-[#1E88E5]/50 hover:bg-white/5"
                                    )}
                                >
                                    {logoUploading ? <Loader2 size={36} className="text-[#1E88E5] animate-spin" /> :
                                        logoSaved ? <CheckCircle size={36} className="text-green-400" /> :
                                            <>
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#1E88E5]/40 group-hover:bg-[#1E88E5]/10 transition-all">
                                                    <Upload size={28} className="text-white/30 group-hover:text-[#1E88E5] transition-colors" />
                                                </div>
                                                <p className="text-xs font-bold text-white/60">Glissez-déposez votre logo ici</p>
                                            </>}
                                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 flex flex-col items-center justify-center min-h-[220px] relative">
                                {branding.logoUrl ? (
                                    <div className="flex flex-col items-center gap-6 w-full">
                                        <div className="bg-white rounded-2xl p-6 flex items-center justify-center w-full">
                                            <img src={branding.logoUrl} alt="Logo" className="max-h-20 max-w-[200px] object-contain" />
                                        </div>
                                        <button onClick={removeLogo} className="flex items-center gap-2 text-red-400 text-[9px] font-black uppercase tracking-widest hover:text-red-300 transition-colors">
                                            <Trash2 size={14} /> Supprimer
                                        </button>
                                    </div>
                                ) : <div className="opacity-20 text-center uppercase text-[10px] font-black tracking-widest"><Image size={40} className="mx-auto mb-2" /> Aucun logo</div>}
                            </div>
                        </div>
                    </SettingsSection>

                    {/* ═══ Configuration du Footer ═══ */}
                    <SettingsSection
                        title="Configuration du Footer"
                        sub="Description et coordonnées affichées en bas de page"
                        icon={<Layout size={24} />}
                    >
                        <div className="space-y-10">
                            <InputField
                                label="Slogan / Description (Footer)"
                                placeholder="Redonner le sourire aux petits champions..."
                                icon={Quote}
                                value={footerDescription}
                                onChange={setFooterDescription}
                                textarea
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InputField label="Téléphone de Contact" placeholder="+216 71 000 000" icon={Phone} value={contactPhone} onChange={setContactPhone} />
                                <InputField label="Email de Contact" placeholder="diacarekids@gmail.com" icon={Mail} value={contactEmail} onChange={setContactEmail} />
                                <InputField label="Site Web" placeholder="www.diacarekids.org" icon={Globe} value={contactWebsite} onChange={setContactWebsite} />
                            </div>
                            <InputField label="Adresse Physique" placeholder="Hôpital des Enfants" icon={MapPin} value={contactAddress} onChange={setContactAddress} />
                        </div>
                    </SettingsSection>

                    {/* Admin Profile & Security */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <SettingsSection title="Sécurité Profil" sub="Gérez vos accès admin" icon={<Shield size={24} />}>
                            <InputField label="Nouveau mot de passe" placeholder="••••••••••••" icon={Lock} type="password" value={newPassword} onChange={setNewPassword} />
                            <button onClick={handleChangePassword} disabled={loading} className="w-full py-5 border border-white/10 hover:border-[#1E88E5] hover:text-[#1E88E5] rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all">
                                {loading ? "Mise à jour..." : "Modifier mot de passe"}
                            </button>
                        </SettingsSection>

                        <div className="space-y-8 p-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] flex flex-col justify-center italic">
                            <p className="text-[10px] font-bold text-[#1E88E5] uppercase tracking-widest">Informations Administrateur</p>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tighter">Houssem Bennaceur</h4>
                                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Super-Administrateur Système</p>
                            </div>
                            <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                                <Smartphone size={16} /> Session active depuis Tunis
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
