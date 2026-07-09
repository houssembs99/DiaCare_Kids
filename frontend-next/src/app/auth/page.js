"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mail, Lock, User, ArrowRight, Loader2, ChevronLeft, Stethoscope, Home, Globe, ShieldCheck, Baby, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

export default function AuthPage() {
    const { t } = useLanguage();
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [subPlan, setSubPlan] = useState('Mensuel');
    const [maxKids, setMaxKids] = useState(1);
    const [selectedClinicId, setSelectedClinicId] = useState('');
    const [allClinics, setAllClinics] = useState([]);
    const [clinicPackages, setClinicPackages] = useState([]);
    const [selectedClinicPackageId, setSelectedClinicPackageId] = useState('');
    const [clinicType, setClinicType] = useState('Clinique');
    const [clinicAddress, setClinicAddress] = useState('');
    const [clinicPhone, setClinicPhone] = useState('');
    const [maxDoctors, setMaxDoctors] = useState(3);
    const [maxPatients, setMaxPatients] = useState(3);
    const [clinicPlan, setClinicPlan] = useState('Basic');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const queryRole = params.get('role');
            const queryPlan = params.get('plan');
            
            if (queryRole) {
                setRole(queryRole);
                setIsLogin(false);
            }
            if (queryPlan) {
                if (queryRole === 'Clinique') {
                    setClinicPlan(queryPlan);
                } else if (queryRole === 'Parent') {
                    if (queryPlan === 'Solo') setMaxKids(1);
                    else if (queryPlan === 'Duo') setMaxKids(2);
                    else if (queryPlan === 'Famille') setMaxKids(3);
                }
            }
        }
    }, []);

    const fetchClinics = async () => {
        try {
            const res = await api.get('/clinics');
            setAllClinics(res.data);
            if (res.data.length > 0 && role === 'Medecin') {
                setSelectedClinicId(res.data[0].id);
            } else {
                setSelectedClinicId('');
            }
        } catch (err) {
            console.error("Error fetching clinics:", err);
        }
    };

    React.useEffect(() => {
        if (!isLogin && (role === 'Parent' || role === 'Medecin')) {
            fetchClinics();
        }
    }, [isLogin, role]);

    React.useEffect(() => {
        if (!isLogin && role === 'Parent') {
            if (selectedClinicId) {
                api.get(`/ClinicPackages/clinic/${selectedClinicId}`).then(res => {
                    setClinicPackages(res.data);
                    if (res.data.length > 0) setSelectedClinicPackageId(res.data[0].id);
                    else setSelectedClinicPackageId('');
                }).catch(err => console.error("Error fetching clinic packages", err));
            } else {
                setClinicPackages([]);
                setSelectedClinicPackageId('');
            }
        }
    }, [selectedClinicId, role, isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let subscriptionPlanToSend = subPlan;
            let associatedClinicIdToSend = selectedClinicId;
            let maxDocsToSend = maxDoctors;
            let maxPatsToSend = maxPatients;

            if (role === 'Parent') {
                if (!selectedClinicId) {
                    associatedClinicIdToSend = null;
                    subscriptionPlanToSend = maxKids === 1 ? 'Solo' : (maxKids === 2 ? 'Duo' : 'Famille');
                } else {
                    subscriptionPlanToSend = 'Sous Clinique';
                }
            } else if (role === 'Clinique') {
                subscriptionPlanToSend = clinicPlan;
                maxDocsToSend = clinicPlan === 'Basic' ? 2 : (clinicPlan === 'Pro' ? 10 : 50);
                maxPatsToSend = clinicPlan === 'Basic' ? 50 : (clinicPlan === 'Pro' ? 500 : -1);
            }

            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin ? { email, password } : {
                email, password, fullName, role,
                subscriptionPlan: subscriptionPlanToSend,
                maxKids: maxKids,
                associatedClinicId: associatedClinicIdToSend,
                clinicPackageId: selectedClinicPackageId,
                clinicType,
                address: clinicAddress,
                contactNumber: clinicPhone,
                maxDoctors: maxDocsToSend,
                maxPatients: maxPatsToSend
            };
            const res = await api.post(endpoint, payload);

            if (isLogin) {
                // Backend returns { token, role, fullName }
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: res.data.id,
                    role: res.data.role,
                    fullName: res.data.fullName,
                    email: email
                }));

                const userRole = res.data.role;
                if (userRole === 'Medecin') router.push('/doctor/dashboard');
                else if (userRole === 'Parent') router.push('/parent/dashboard');
                else if (userRole === 'Admin') router.push('/admin/dashboard');
                else if (userRole === 'Enfant') router.push('/kid/dashboard');
                else router.push('/clinic/dashboard');
            } else {
                // Registration successful
                alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
                setIsLogin(true);
            }
        } catch (err) {
            console.error("Login/Register Error:", err);
            const errorMsg = err.response?.data?.message || err.response?.data;

            if (errorMsg) {
                alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
            } else {
                alert("Erreur de connexion. Vérifiez que le serveur est lancé.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col lg:flex-row items-center justify-center bg-[#0b1b2b] relative overflow-x-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="apple-card p-1 border-white/10">
                    <div className="bg-white/5 backdrop-blur-3xl rounded-[22px] p-12 lg:p-16 space-y-12 border border-white/10">

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-xl">
                                <Activity className="text-[#088395] w-8 h-8" />
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-white underline decoration-white/20 decoration-4 underline-offset-8">
                                {isLogin ? t('auth.welcomeBack') : t('auth.joinAdventure')}
                            </h1>
                            <p className="text-sm font-semibold text-white/40 uppercase tracking-widest pt-4">
                                {isLogin ? t('auth.loginDesc') : t('auth.registerDesc')}
                            </p>
                        </div>

                        {/* Switcher */}
                        <div className="flex p-1 bg-white/5 rounded-full relative overflow-hidden border border-white/10">
                            <button
                                onClick={() => { setIsLogin(true); setRole(null); }}
                                className={cn(
                                    "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all relative z-10 outline-none",
                                    isLogin ? "text-[#088395]" : "text-white/60"
                                )}
                            >
                                {t('auth.login')}
                            </button>
                            <button
                                onClick={() => { setIsLogin(false); setRole(null); }}
                                className={cn(
                                    "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all relative z-10 outline-none",
                                    !isLogin ? "text-[#088395]" : "text-white/60"
                                )}
                            >
                                {t('auth.register')}
                            </button>
                            <motion.div
                                animate={{ x: isLogin ? '0%' : '100%' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-lg"
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {!isLogin && !role ? (
                                <motion.div
                                    key="role-selector"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                                >
                                    <RoleButton icon={<Stethoscope />} label={t('auth.doctor')} onClick={() => setRole('Medecin')} />
                                    <RoleButton icon={<Home />} label={t('auth.parent')} onClick={() => setRole('Parent')} />
                                    <RoleButton icon={<Globe />} label={t('auth.clinic')} onClick={() => setRole('Clinique')} />
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="auth-form"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    onSubmit={handleSubmit} className="space-y-6"
                                >
                                    {!isLogin && (
                                        <button
                                            type="button" onClick={() => setRole(null)}
                                            className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest hover:translate-x-[-4px] transition-transform pb-4"
                                        >
                                            <ChevronLeft size={16} />
                                            {t('auth.backToRole')} ({role})
                                        </button>
                                    )}

                                    <div className="space-y-4">
                                        {!isLogin && (
                                            <AuthInput icon={<User />} type="text" placeholder={t('auth.fullName')} value={fullName} onChange={setFullName} />
                                        )}
                                        <AuthInput icon={<Mail />} type="email" placeholder={t('auth.email')} value={email} onChange={setEmail} />
                                        <AuthInput icon={<Lock />} type="password" placeholder={t('auth.password')} value={password} onChange={setPassword} />

                                        {!isLogin && role === 'Parent' && (
                                            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Type d'abonnement</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {['Mensuel', 'Annuel'].map(p => (
                                                            <button
                                                                key={p} type="button" onClick={() => setSubPlan(p)}
                                                                className={cn(
                                                                    "py-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                                                                    subPlan === p ? "bg-white text-[#088395] border-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                                                )}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Nombre d'héros (enfants)</label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {[1, 2, 3].map(n => (
                                                            <button
                                                                key={n} type="button" onClick={() => setMaxKids(n)}
                                                                className={cn(
                                                                    "py-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                                                                    maxKids === n ? "bg-white text-[#088395] border-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                                                )}
                                                            >
                                                                {n} {n === 1 ? 'Hero' : 'Heros'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!isLogin && (role === 'Parent' || role === 'Medecin') && (
                                            <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">
                                                    {role === 'Parent' ? 'Clinique / Cabinet de Suivi (Optionnel)' : 'Établissement où vous exercez'}
                                                </label>
                                                <select
                                                    value={selectedClinicId}
                                                    onChange={(e) => setSelectedClinicId(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-sm font-bold text-white outline-none focus:border-[#088395] transition-all appearance-none cursor-pointer"
                                                    required={role === 'Medecin'}
                                                >
                                                    <option value="" className="bg-[#0b1b2b]">
                                                        {role === 'Parent' ? 'Plan Personnel (Sans clinique - Paiement en ligne)' : 'Choisir un établissement'}
                                                    </option>
                                                    {allClinics.map(clinic => (
                                                        <option key={clinic.id} value={clinic.id} className="bg-[#0b1b2b]">
                                                            {clinic.fullName || clinic.name} ({clinic.clinicType || 'Clinique'})
                                                        </option>
                                                    ))}
                                                </select>
                                                
                                                {!isLogin && role === 'Parent' && selectedClinicId && clinicPackages.length > 0 && (
                                                    <div className="mt-4 space-y-3 animate-in fade-in">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Forfait de la clinique</label>
                                                        <select
                                                            value={selectedClinicPackageId}
                                                            onChange={(e) => setSelectedClinicPackageId(e.target.value)}
                                                            className="w-full bg-white/5 border border-[#088395]/50 rounded-2xl py-6 px-8 text-sm font-bold text-white outline-none focus:border-[#088395] transition-all appearance-none cursor-pointer"
                                                            required
                                                        >
                                                            {clinicPackages.map(pkg => (
                                                                <option key={pkg.id} value={pkg.id} className="bg-[#0b1b2b]">
                                                                    {pkg.name} - {pkg.price} {pkg.currency} / {pkg.paymentFrequency} (Max {pkg.maxKidsPerParent} enfant(s))
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {role === 'Medecin' && (
                                                    <p className="text-[9px] font-bold text-[#088395] uppercase tracking-widest ml-4 mt-2">
                                                        * Votre compte devra être validé par la clinique.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {!isLogin && role === 'Clinique' && (
                                            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Type d'établissement</label>
                                                        <select value={clinicType} onChange={e => setClinicType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none">
                                                            <option value="Clinique" className="bg-[#0b1b2b]">Clinique</option>
                                                            <option value="Cabinet" className="bg-[#0b1b2b]">Cabinet</option>
                                                            <option value="Hopital" className="bg-[#0b1b2b]">Hôpital</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Contact Tél</label>
                                                        <input type="text" value={clinicPhone} onChange={e => setClinicPhone(e.target.value)} placeholder="+216 ..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none" required />
                                                    </div>
                                                </div>

                                                <AuthInput icon={<Globe />} type="text" placeholder="Adresse complète (Map)" value={clinicAddress} onChange={setClinicAddress} />

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Forfait d'Abonnement</label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {[
                                                            { name: 'Basic', label: 'Basic (49 DT)' },
                                                            { name: 'Pro', label: 'Pro (149 DT)' },
                                                            { name: 'Premium', label: 'Premium (299 DT)' }
                                                        ].map(p => (
                                                            <button
                                                                key={p.name}
                                                                type="button"
                                                                onClick={() => {
                                                                    setClinicPlan(p.name);
                                                                    setSubPlan('Mensuel');
                                                                }}
                                                                className={cn(
                                                                    "py-4 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center flex flex-col items-center justify-center gap-1",
                                                                    clinicPlan === p.name ? "bg-white text-[#088395] border-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                                                )}
                                                            >
                                                                <span>{p.name}</span>
                                                                <span className="text-[8px] opacity-65">{p.name === 'Basic' ? '2 Méd / 50 Pat' : (p.name === 'Pro' ? '10 Méd / 500 Pat' : '50 Méd / ∞ Pat')}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        disabled={loading}
                                        className="w-full btn-apple !py-6 text-xl shadow-2xl flex items-center justify-center gap-4 group mt-10"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? t('auth.submitLogin') : t('auth.submitRegister'))}
                                        {!loading && <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </motion.div >
        </div >
    );
}

const AuthInput = ({ icon, type, placeholder, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <input
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/20 focus:bg-white/10 rounded-2xl py-6 pl-16 pr-16 text-lg font-medium text-white placeholder:text-white/20 transition-all outline-none"
                required
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            )}
        </div>
    );
};

const RoleButton = ({ icon, label, onClick }) => (
    <button
        type="button" onClick={onClick}
        className="p-10 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-4 group"
    >
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            {React.cloneElement(icon, { size: 28 })}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{label}</span>
    </button>
);

