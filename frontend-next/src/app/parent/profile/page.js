"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    User, Settings, Shield, Bell,
    Globe, LogOut, Camera, ChevronRight,
    Stethoscope, Phone, Mail, Lock,
    Baby, Activity, MapPin, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

const ProfileItem = ({ icon: Icon, label, value, color = "text-white/40", onClick }) => (
    <div 
        onClick={onClick}
        className={cn("flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/20 transition-all", onClick && "cursor-pointer")}
    >
        <div className="flex items-center gap-5">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5", color)}>
                <Icon size={20} />
            </div>
            <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-white/20">{label}</div>
                <div className="text-sm font-black uppercase tracking-tighter text-white/80">{value}</div>
            </div>
        </div>
        <ChevronRight size={16} className="text-white/10 group-hover:text-white transition-colors" />
    </div>
);

export default function ParentProfile() {
    const { t } = useLanguage();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
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
            setIsPasswordModalOpen(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Erreur lors du changement de mot de passe.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.id) {
            setUser(storedUser);
            // Optionally fetch fresh data from API
            api.get(`/Users/${storedUser.id}`).then(res => {
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
            }).catch(err => console.error("Error fetching user", err));
        } else {
            router.push('/auth');
        }
    }, [router]);

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
            alert("Photo de profil mise à jour !");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'upload de l'image.");
        }
    };

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-10 pb-32 text-white max-w-lg mx-auto">

                {/* Profile Header SECTION 10 */}
                <div className="flex flex-col items-center pt-8 space-y-4">
                    <div className="relative group">
                        <label className="cursor-pointer block">
                            <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-[#088395] to-[#066a7a] flex items-center justify-center text-white border-4 border-white/10 shadow-3xl overflow-hidden relative">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <Baby size={60} className="text-white group-hover:scale-110 transition-transform duration-500" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success border-4 border-[#1E88E5] rounded-full flex items-center justify-center shadow-xl">
                            <Activity size={14} className="text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter">{user?.fullName || "Utilisateur"}</h1>
                        <p className="text-[10px] font-black text-[#088395] uppercase tracking-widest mt-1">Champion DiaCare Kids #{user?.id?.slice(-4) || "0000"}</p>
                    </div>
                </div>

                {/* Child Info SECTION 10 */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 pl-4">Informations Enfant</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <ProfileItem icon={Baby} label="Date de naissance" value="12 Mars 2018" color="text-[#088395]" />
                        <ProfileItem icon={Activity} label="Type de Diabète" value="Type 1" color="text-accent" />
                        <ProfileItem icon={MapPin} label="Localisation" value="Tunis, Tunisie" />
                    </div>
                </div>

                {/* Doctor Contact SECTION 10 */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 pl-4">Médecin Référent</h3>
                    <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-8 shadow-2xl">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-[#088395]/10 rounded-3xl flex items-center justify-center text-[#088395] border border-[#088395]/20">
                                <Stethoscope size={30} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black italic uppercase tracking-tighter">Dr. Ahmed Amor</h4>
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Endocrinologue Pédiatre</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                <Phone size={18} className="text-[#088395]" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Appeler</span>
                            </button>
                            <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                <Mail size={18} className="text-[#088395]" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* App Settings SECTION 10 */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 pl-4">Préférences l'application</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <ProfileItem 
                            icon={Lock} 
                            label="Sécurité" 
                            value="Changer mon mot de passe" 
                            onClick={() => setIsPasswordModalOpen(true)}
                        />
                        <ProfileItem icon={Globe} label="Langue" value="Français (FR)" />
                        <ProfileItem icon={Bell} label="Notifications" value="Activées" />
                        <ProfileItem icon={Smartphone} label="Appareils" value="iPhone 15 Pro" />
                    </div>
                </div>

                {/* Logout SECTION 10 */}
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/auth');
                    }}
                    className="w-full py-6 mt-6 bg-accent/20 border border-accent/20 text-accent rounded-[32px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {t('sidebar.logout')}
                </button>

                <div className="text-center pt-4">
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em]">DiaCare Kids v2.0.4 • 2024</p>
                </div>

            </div>

            {/* Password Change Modal */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsPasswordModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl"
                        >
                            <button 
                                onClick={() => setIsPasswordModalOpen(false)} 
                                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-8 text-white flex items-center gap-3">
                                <Lock size={20} className="text-[#088395]" /> Sécurité
                            </h2>
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 pl-2">Mot de passe actuel</label>
                                    <input 
                                        type="password" 
                                        required 
                                        value={currentPassword} 
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#088395] outline-none" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 pl-2">Nouveau mot de passe</label>
                                    <input 
                                        type="password" 
                                        required 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#088395] outline-none" 
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-5 bg-[#088395] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#066a7a] transition-all disabled:opacity-50 mt-4 shadow-[0_10px_20px_rgba(8,131,149,0.2)]"
                                >
                                    <Save size={18} /> {loading ? "Mise à jour..." : "Confirmer"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
