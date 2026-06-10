"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Settings, Camera, User, Mail,
    Phone, Lock, Save, Stethoscope, Briefcase,
    Building2, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

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

const InputField = ({ label, placeholder, icon: Icon, type = "text", value, onChange, readOnly = false }) => (
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
                readOnly={readOnly || !onChange}
                placeholder={placeholder}
                className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-[22px] py-5 px-16 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] focus:bg-white/10 transition-all text-white placeholder:text-white/5",
                    (readOnly || !onChange) && "opacity-60 cursor-default"
                )}
            />
        </div>
    </div>
);

export default function DoctorSettings() {
    const [user, setUser] = useState(null);
    const [fullName, setFullName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [phone, setPhone] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [clinicName, setClinicName] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.id) {
            setUser(storedUser);
            api.get(`/Users/${storedUser.id}`).then(async (res) => {
                const userData = res.data;
                setUser(userData);
                setFullName(userData.fullName || '');
                setSpecialty(userData.clinicType || '');
                setPhone(userData.contactNumber || '');
                setOrderNumber(userData.orderNumber || '');
                localStorage.setItem('user', JSON.stringify(userData));

                if (userData.associatedClinicId) {
                    try {
                        const clinicRes = await api.get(`/Users/${userData.associatedClinicId}`);
                        setClinicName(clinicRes.data.fullName || "Clinique Partenaire");
                    } catch (err) {
                        console.error("Error fetching clinic name", err);
                    }
                }
            }).catch(err => console.error("Error fetching doctor", err));
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
            alert("Photo mise à jour !");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'upload.");
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const payload = {
                fullName,
                clinicType: specialty,
                contactNumber: phone,
                orderNumber,
            };
            await api.put(`/Users/${user.id}`, payload);
            const updatedUser = { ...user, ...payload };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert("Profil mis à jour avec succès !");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Erreur lors de la mise à jour du profil.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        setSavingPassword(true);
        try {
            await api.post('/auth/change-password', { currentPassword, newPassword });
            alert("Mot de passe modifié avec succès !");
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Erreur lors du changement de mot de passe.");
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-12 pb-10 text-white max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16 px-4 lg:px-0">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Settings size={28} className="text-[#088395]" />
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                Mon <span className="text-white/40">Profil Médico</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Gérez vos informations professionnelles et votre sécurité</p>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex items-center gap-3 px-10 py-5 bg-[#088395] hover:bg-[#066a7a] text-white rounded-[22px] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(8,131,149,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {savingProfile ? "Enregistrement..." : "Mettre à jour profil"}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-12 px-4 lg:px-0">

                    {/* Professional Info */}
                    <SettingsSection
                        title="Informations Professionnelles"
                        sub="Détails de votre identité médicale et établissement"
                        icon={<Stethoscope size={24} />}
                    >
                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-6">
                                <label className="relative group/photo cursor-pointer block">
                                    <div className="w-40 h-40 rounded-[48px] overflow-hidden border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5 group-hover/photo:border-[#088395] transition-all relative">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <User size={60} className="text-white/10 group-hover/photo:text-[#088395] transition-colors" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all">
                                            <Camera size={30} className="text-white" />
                                        </div>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                    <p className="text-[8px] font-black uppercase tracking-widest text-center mt-4 text-white/20 italic">Format souhaité: PNG ou JPG</p>
                                </label>
                            </div>

                            {/* Fields */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Prénom & Nom"
                                    placeholder="DR. NOM PRÉNOM"
                                    icon={User}
                                    value={fullName}
                                    onChange={setFullName}
                                />
                                <InputField
                                    label="Spécialité"
                                    placeholder="EX: PÉDIATRE DIABÉTOLOGUE"
                                    icon={Briefcase}
                                    value={specialty}
                                    onChange={setSpecialty}
                                />
                                <InputField
                                    label="Numéro d'Ordre / Spécialité"
                                    placeholder="EX: MED-2024-00123"
                                    icon={Hash}
                                    value={orderNumber}
                                    onChange={setOrderNumber}
                                />
                                <InputField
                                    label="Téléphone"
                                    placeholder="+216 -- --- ---"
                                    icon={Phone}
                                    value={phone}
                                    onChange={setPhone}
                                />
                                <InputField
                                    label="Email Professionnel"
                                    icon={Mail}
                                    value={user?.email || ""}
                                    readOnly
                                />
                                <InputField
                                    label="Établissement"
                                    icon={Building2}
                                    value={clinicName || "Indépendant / Cabinet"}
                                    readOnly
                                />
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Security */}
                    <SettingsSection
                        title="Sécurité du E-Cabinet"
                        sub="Protégez votre accès aux données sensibles de vos patients"
                        icon={<Lock size={24} />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-xl">
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
                            <div className="md:col-span-2">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={savingPassword}
                                    className="w-full py-5 border border-white/10 hover:border-[#088395] hover:text-[#088395] rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    {savingPassword ? "Chargement..." : "Changer de mot de passe"}
                                </button>
                            </div>
                        </div>
                    </SettingsSection>

                </div>
            </div>
        </DashboardLayout>
    );
}
