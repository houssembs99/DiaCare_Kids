"use client";

import React, { useState, useEffect } from 'react';
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
                readOnly={!onChange}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-[22px] py-5 px-16 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] focus:bg-white/10 transition-all text-white placeholder:text-white/5"
            />
        </div>
    </div>
);

export default function ClinicSettings() {
    const [user, setUser] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.id) {
            setUser(storedUser);
            // Fetch fresh data
            api.get(`/Users/${storedUser.id}`).then(res => {
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
            }).catch(err => console.error("Error fetching clinic", err));
        }
    }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post(`/Users/upload-avatar/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = { ...user, avatarUrl: res.data.avatarUrl };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert("Logo mis à jour !");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'upload.");
        }
    };

    const handleUserChange = (field, value) => {
        setUser(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleProfileUpdate = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { fullName, email, contactNumber, fileNumber, address } = user;
            await api.put(`/Users/${user.id}`, { fullName, email, contactNumber, fileNumber, address });
            localStorage.setItem('user', JSON.stringify(user));
            alert("Informations mises à jour avec succès !");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la mise à jour.");
        } finally {
            setLoading(false);
        }
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

                    <button onClick={handleProfileUpdate} disabled={loading} className="flex items-center gap-3 px-10 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(8,131,149,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                        <Save size={18} /> {loading ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-12">

                    {/* Clinic Profile SECTION 10.2 */}
                    <SettingsSection title="Informations Clinique" sub="Configurez l'identité publique de votre établissement" icon={<Building2 size={24} />}>
                        <div className="flex flex-col lg:flex-row gap-12">
                            <div className="flex flex-col items-center gap-6">
                                <label className="relative group/photo cursor-pointer block">
                                    <div className="w-40 h-40 rounded-[48px] overflow-hidden border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5 group-hover/photo:border-[#088395] transition-all relative">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <Building2 size={60} className="text-white/10 group-hover/photo:text-[#088395] transition-colors" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all">
                                            <Camera size={30} className="text-white" />
                                        </div>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                    <p className="text-[8px] font-black uppercase tracking-widest text-center mt-4 text-white/20 italic">Format: PNG, JPG (SVG recommandé)</p>
                                </label>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Nom de la Clinique" placeholder="EX: CLINIQUE EL AMEL" icon={Building2} value={user?.fullName || ""} onChange={(val) => handleUserChange('fullName', val)} />
                                <InputField label="Email de Contact" placeholder="EX: CONTACT@CLINIC.TN" icon={Mail} value={user?.email || ""} onChange={(val) => handleUserChange('email', val)} />
                                <InputField label="Téléphone" placeholder="+216 -- --- ---" icon={Phone} value={user?.contactNumber || ""} onChange={(val) => handleUserChange('contactNumber', val)} />
                                <InputField label="Site Web" placeholder="WWW.VOTRESITE.TN" icon={Globe} value={user?.fileNumber || ""} onChange={(val) => handleUserChange('fileNumber', val)} />
                                <div className="md:col-span-2">
                                    <InputField label="Adresse Physique" placeholder="RUE DE LA MÉDECINE, TUNIS" icon={MapPin} value={user?.address || ""} onChange={(val) => handleUserChange('address', val)} />
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


                        </div>
                    </SettingsSection>

                    {/* Responsible Manager SECTION 10.2 */}
                    <SettingsSection title="Responsable de Clinique" sub="Informations sur le gestionnaire principal" icon={<User size={24} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputField label="Prénom & Nom" placeholder="flen" icon={User} value={user?.fullName || "Houssem Ben Salem"} />
                            <InputField label="Poste / Rôle" placeholder="EX: DIRECTEUR ADM." icon={Shield} value={user?.role || "Responsable Médical"} />
                            <InputField label="Identifiant Système" placeholder="ID-0000" icon={Key} value={`USER-CL-${user?.id?.slice(-4) || "9201"}`} />
                        </div>
                    </SettingsSection>



                </div>

            </div>
        </DashboardLayout>
    );
}
