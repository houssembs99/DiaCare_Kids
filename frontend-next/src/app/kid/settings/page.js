"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Settings, Camera, User, Lock,
    Save, Crown, Star, Sparkles,
    ChevronLeft, Palette, Bell, Shield,
    Gamepad2, Trophy, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const SettingsSection = ({ title, icon, children, delay = 0 }) => (
    <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl space-y-8 group"
    >
        <div className="flex items-center gap-4 text-[#FFB300]">
            <div className="p-3 bg-[#FFB300]/20 rounded-2xl group-hover:rotate-12 transition-transform">
                {icon}
            </div>
            <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-white italic">{title}</h2>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </motion.div>
);

const InputField = ({ label, placeholder, icon: Icon, type = "text", value, onChange }) => (
    <div className="space-y-3 group/field">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within/field:text-[#FFB300] transition-colors pl-2">{label}</label>
        <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#FFB300] transition-colors">
                <Icon size={18} />
            </div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 px-16 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-[#FFB300] focus:bg-white/10 transition-all text-white placeholder:text-white/5"
            />
        </div>
    </div>
);

export default function KidSettings() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.id) {
            setUser(storedUser);
            // Fetch fresh data
            api.get(`/Users/${storedUser.id}`).then((res) => {
                const userData = res.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }).catch(err => console.error("Error fetching kid profile", err));
        } else {
            router.push('/auth');
        }
    }, [router]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post(`/Users/upload-avatar/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = { ...user, avatarUrl: res.data.avatarUrl };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert("Super ! Ta nouvelle photo est géniale ! 🌟");
        } catch (err) {
            console.error(err);
            alert("Oups ! Une petite erreur est survenue lors de l'envoi de ta photo.");
        } finally {
            setUploading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            alert("Remplis tous les champs pour changer ton code secret !");
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            alert("Code secret modifié avec succès ! Garde-le bien caché ! 🔒");
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Oups ! Ton ancien code secret n'est pas correct.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <DashboardLayout role="Enfant">
            <div className="min-h-screen pb-32 max-w-4xl mx-auto px-6 pt-6 text-white">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div className="flex items-center gap-5">
                        <button 
                            onClick={() => router.back()}
                            className="p-4 bg-white/5 hover:bg-[#FFB300] hover:text-black rounded-2xl transition-all group"
                        >
                            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                                Mes <span className="text-[#FFB300]">Paramètres</span>
                            </h1>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">Personnalise ton univers DiaCare</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-6 py-3 bg-[#FFB300]/10 border border-[#FFB300]/20 rounded-2xl">
                        <Trophy size={18} className="text-[#FFB300]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300]">Champion Niveau {Math.floor((user.xp || 0) / 100) + 1}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    
                    {/* Profile & Avatar Section */}
                    <div className="md:col-span-5">
                        <SettingsSection title="Mon Image" icon={<Palette size={20} />} delay={0.1}>
                            <div className="flex flex-col items-center gap-8">
                                <label className="relative group/avatar cursor-pointer">
                                    <div className="w-48 h-48 rounded-[56px] bg-gradient-to-br from-[#FFB300] to-[#E65100] p-1 shadow-2xl relative overflow-hidden group-hover:rotate-3 transition-transform duration-500">
                                        <div className="w-full h-full rounded-[52px] bg-[#0b1b2b] flex items-center justify-center overflow-hidden relative">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Crown size={60} className="text-white/10 group-hover/avatar:text-[#FFB300] transition-colors" />
                                                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Choisir une photo</span>
                                                </div>
                                            )}
                                            
                                            {/* Overlay on hover */}
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300">
                                                <Camera size={32} className="text-[#FFB300] mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-white">Changer</span>
                                            </div>

                                            {/* Progress overlap when uploading */}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                                                    <Loader2 size={32} className="text-[#FFB300] animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                    
                                    {/* Small Achievement Badge */}
                                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#34C759] border-4 border-[#0b1b2b] rounded-full flex items-center justify-center shadow-xl rotate-12">
                                        <Shield size={18} className="text-white" />
                                    </div>
                                </label>

                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{user.fullName}</h3>
                                    <div className="bg-white/5 py-2 px-4 rounded-full border border-white/5">
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Héros ID: #{user.id.slice(-4)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center gap-1">
                                        <Star size={16} className="text-[#FFB300] fill-[#FFB300]" />
                                        <span className="text-[10px] font-black uppercase text-white/60">{(user.xp || 0) % 100}/100 XP</span>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center gap-1">
                                        <Sparkles size={16} className="text-[#34C759]" />
                                        <span className="text-[10px] font-black uppercase text-white/60">Total {user.xp || 0} XP</span>
                                    </div>
                                </div>
                            </div>
                        </SettingsSection>
                    </div>

                    {/* Security Section */}
                    <div className="md:col-span-7 space-y-8">
                        <SettingsSection title="Mon Code Secret" icon={<Lock size={20} />} delay={0.2}>
                            <div className="space-y-6">
                                <InputField 
                                    label="Code Secret Actuel" 
                                    placeholder="••••••••" 
                                    icon={Lock} 
                                    type="password" 
                                    value={currentPassword}
                                    onChange={setCurrentPassword}
                                />
                                <InputField 
                                    label="Nouveau Code Secret" 
                                    placeholder="••••••••" 
                                    icon={Shield} 
                                    type="password" 
                                    value={newPassword}
                                    onChange={setNewPassword}
                                />
                                <button 
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                    className="w-full py-5 bg-[#FFB300] hover:bg-[#E65100] text-[#0b1b2b] rounded-3xl font-black uppercase tracking-widest text-xs shadow-[0_20px_40px_rgba(255,179,0,0.2)] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                                    {loading ? "Enregistrement..." : "Sauvegarder"}
                                </button>
                            </div>
                        </SettingsSection>


                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="mt-20 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">DiaCare Kids Zone Sécurisée</p>
                </div>

            </div>
        </DashboardLayout>
    );
}
