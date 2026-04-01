"use client";

import React, { useState } from 'react';
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

const ProfileItem = ({ icon: Icon, label, value, color = "text-white/40" }) => (
    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/20 transition-all">
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth');
    };

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-10 pb-32 text-white max-w-lg mx-auto">

                {/* Profile Header SECTION 10 */}
                <div className="flex flex-col items-center pt-8 space-y-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-[#088395] to-[#066a7a] flex items-center justify-center text-white border-4 border-white/10 shadow-3xl overflow-hidden">
                            <Baby size={60} className="text-white group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                <Camera size={24} />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success border-4 border-[#1E88E5] rounded-full flex items-center justify-center shadow-xl">
                            <Activity size={14} className="text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Amine Trabelsi</h1>
                        <p className="text-[10px] font-black text-[#088395] uppercase tracking-widest mt-1">Champion DiaCare Kids #RT-9201</p>
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
                        <ProfileItem icon={Lock} label="Sécurité" value="Changer mon mot de passe" />
                        <ProfileItem icon={Globe} label="Langue" value="Français (FR)" />
                        <ProfileItem icon={Bell} label="Notifications" value="Activées" />
                        <ProfileItem icon={Smartphone} label="Appareils" value="iPhone 15 Pro" />
                    </div>
                </div>

                {/* Logout SECTION 10 */}
                <button
                    onClick={handleLogout}
                    className="w-full py-6 mt-6 bg-accent/20 border border-accent/20 text-accent rounded-[32px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {t('sidebar.logout')}
                </button>

                <div className="text-center pt-4">
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em]">DiaCare Kids v2.0.4 • 2024</p>
                </div>

            </div>
        </DashboardLayout>
    );
}
