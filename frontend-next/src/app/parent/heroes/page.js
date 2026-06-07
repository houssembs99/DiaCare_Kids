"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Baby, Plus, Mail, Lock, User, Shield,
    ChevronRight, Loader2, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

export default function ParentHeroes() {
    const { t } = useLanguage();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [subDetails, setSubDetails] = useState(null);

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('H');
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [clinicDoctors, setClinicDoctors] = useState([]);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Get children
            const kidsRes = await api.get('/parent/children');
            setChildren(kidsRes.data);

            // Get current parent info for subscription check
            const userStore = JSON.parse(localStorage.getItem('user') || '{}');
            const userRes = await api.get(`/users/${userStore.id}`);
            setSubDetails(userRes.data.subscription);

            // Fetch doctors for this parent's clinic or independent doctor
            if (userRes.data.associatedDoctorId) {
                // Independent doctor case
                const docRes = await api.get(`/users/${userRes.data.associatedDoctorId}`);
                setClinicDoctors([docRes.data]);
                setSelectedDoctorId(docRes.data.id);
            } else if (userRes.data.associatedClinicId) {
                // Clinic case
                const docsRes = await api.get('/parent/my-clinic-doctors');
                setClinicDoctors(docsRes.data);
                if (docsRes.data.length > 0) setSelectedDoctorId(docsRes.data[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateChild = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        try {
            await api.post('/parent/create-child', {
                fullName, email, password,
                dateOfBirth: birthDate,
                gender,
                associatedDoctorId: selectedDoctorId
            });
            setShowCreateModal(false);
            setFullName('');
            setEmail('');
            setPassword('');
            setBirthDate('');
            setGender('H');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la création");
        } finally {
            setCreating(false);
        }
    };

    const maxReached = subDetails && children.length >= subDetails.maxKids;

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-10 pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic text-white">
                            {t('parent.myHeroes').split(' ')[0]} <span className="text-white/40">{t('parent.myHeroes').split(' ')[1]}</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-3">{t('parent.manageHeroes')}</p>
                    </div>

                    <button
                        disabled={maxReached}
                        onClick={() => setShowCreateModal(true)}
                        className={cn(
                            "btn-apple !py-5 px-8 flex items-center gap-3 shadow-2xl",
                            maxReached && "opacity-50 cursor-not-allowed grayscale"
                        )}
                    >
                        <Plus size={20} />
                        <span className="text-xs uppercase tracking-widest">{t('parent.addHero')}</span>
                    </button>
                </div>

                {/* Subscription Info Card */}
                {subDetails && (
                    <div className="apple-card p-8 bg-[#088395]/10 border-[#088395]/20 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-[#088395] rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <Shield size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('parent.currentPlan')}</div>
                                <div className="text-xl font-black text-white italic">{subDetails.planType} • {subDetails.maxKids} {t('parent.kidsMax')}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('parent.usage')}</div>
                            <div className="text-xl font-black text-white italic">{children.length} / {subDetails.maxKids} {t('parent.heroes')}</div>
                        </div>
                    </div>
                )}

                {/* Kids List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="animate-spin text-[#088395]" size={40} />
                        <span className="text-xs font-bold text-white/20 uppercase tracking-widest">{t('parent.fetchingTeam')}</span>
                    </div>
                ) : children.length === 0 ? (
                    <div className="apple-card p-20 text-center space-y-6 bg-white/5">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                            <Baby size={40} />
                        </div>
                        <p className="text-sm font-bold text-white/40 tracking-widest uppercase">{t('parent.noHeroesYet')}</p>
                        <button onClick={() => setShowCreateModal(true)} className="text-[#088395] text-xs font-black uppercase tracking-widest underline underline-offset-8">
                            {t('parent.startAdventure')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {children.map((child, idx) => (
                            <motion.div
                                key={child.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="apple-card p-8 bg-white/5 hover:bg-white/10 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 text-white/5 scale-[3] opacity-0 group-hover:opacity-10 transition-all">
                                    <Baby size={100} />
                                </div>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-[#088395] rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-xl">
                                        {child.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white italic leading-none truncate max-w-[150px]">{child.fullName}</h3>
                                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-2">
                                            {child.gender === 'H' ? t('parent.boy') : t('parent.girl')} • {child.dateOfBirth ? new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear() + ' Ans' : t('parent.activeHero')}
                                        </p>
                                        {child.fileNumber && (
                                            <div className="mt-2 text-[9px] font-black text-[#088395] uppercase tracking-[0.2em] bg-[#088395]/10 px-3 py-1 rounded-lg inline-block">
                                                Fiche: {child.fileNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-white/40">
                                        <Mail size={14} />
                                        <span className="text-xs font-medium">{child.email}</span>
                                    </div>
                                    <Link
                                        href={`/parent/heroes/${child.id}`}
                                        className="w-full py-4 mt-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#088395] hover:border-[#088395] text-[10px] font-black uppercase tracking-widest transition-all text-white/40 hover:text-white"
                                    >
                                        {t('parent.accessProfile')} <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl px-6">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-xl apple-card p-1"
                            >
                                <div className="bg-[#0b1b2b] rounded-[22px] p-10 lg:p-14 space-y-10 relative overflow-hidden">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="absolute top-8 right-8 p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all hover:rotate-90"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-[#088395] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl">
                                            <Baby size={32} />
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{t('parent.newHero').split(' ')[0]} <span className="text-white/40 italic">{t('parent.newHero').split(' ')[1]}</span></h2>
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{t('parent.createSecureAccount')}</p>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center gap-3 text-accent text-xs font-bold uppercase tracking-widest">
                                            <AlertCircle size={16} /> {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleCreateChild} className="space-y-6">
                                        <div className="space-y-4">
                                            <ModalInput
                                                icon={<User />} placeholder={t('parent.heroName')}
                                                value={fullName} onChange={setFullName}
                                            />
                                            <ModalInput
                                                icon={<Mail />} placeholder={t('parent.heroEmail')}
                                                type="text" value={email} onChange={setEmail}
                                            />
                                            <ModalInput
                                                icon={<Lock />} placeholder={t('parent.heroPass')}
                                                type="password" value={password} onChange={setPassword}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('parent.birthDate')}</label>
                                                    <input
                                                        type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-sm font-bold text-white outline-none focus:border-white/30 transition-all"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('parent.gender')}</label>
                                                    <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 h-[68px]">
                                                        <button
                                                            type="button" onClick={() => setGender('H')}
                                                            className={cn("flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", gender === 'H' ? "bg-white text-[#088395]" : "text-white/40")}
                                                        >
                                                            {t('parent.boy')}
                                                        </button>
                                                        <button
                                                            type="button" onClick={() => setGender('F')}
                                                            className={cn("flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", gender === 'F' ? "bg-white text-[#088395]" : "text-white/40")}
                                                        >
                                                            {t('parent.girl')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Doctor Selection */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Médecin référent (Expertise)</label>
                                                {clinicDoctors.length > 0 ? (
                                                    <select
                                                        value={selectedDoctorId}
                                                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-sm font-bold text-white outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                                                        required
                                                    >
                                                        {clinicDoctors.map(doc => (
                                                            <option key={doc.id} value={doc.id} className="bg-[#0b1b2b]">
                                                                {doc.fullName ? `Dr. ${doc.fullName}` : (doc.name || "Médecin")}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                                        Aucun médecin disponible dans votre clinique
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            disabled={creating}
                                            className="w-full py-6 bg-white text-[#088395] rounded-[24px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all mt-8"
                                        >
                                            {creating ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> {t('parent.addHero')}</>}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
}

const ModalInput = ({ icon, type = "text", placeholder, value, onChange }) => (
    <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-all">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-white/30 focus:bg-white/10 rounded-2xl py-6 pl-14 pr-8 text-sm font-bold text-white placeholder:text-white/10 transition-all outline-none"
            required
        />
    </div>
);
