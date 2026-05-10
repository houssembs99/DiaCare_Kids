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
    const [clinicType, setClinicType] = useState('Clinique');
    const [clinicAddress, setClinicAddress] = useState('');
    const [clinicPhone, setClinicPhone] = useState('');
    const [maxDoctors, setMaxDoctors] = useState(3);
    const [maxPatients, setMaxPatients] = useState(3);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchClinics = async () => {
        try {
            const res = await api.get('/clinics');
            setAllClinics(res.data);
            if (res.data.length > 0) setSelectedClinicId(res.data[0].id);
        } catch (err) {
            console.error("Error fetching clinics:", err);
        }
    };

    React.useEffect(() => {
        if (!isLogin && (role === 'Parent' || role === 'Medecin')) {
            fetchClinics();
        }
    }, [isLogin, role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin ? { email, password } : {
                email, password, fullName, role,
                subscriptionPlan: subPlan,
                maxKids: maxKids,
                associatedClinicId: selectedClinicId,
                clinicType,
                address: clinicAddress,
                contactNumber: clinicPhone,
                maxDoctors,
                maxPatients
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
            <TestCredentials />
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
                                                    {role === 'Parent' ? 'Clinique / Cabinet de Suivi' : 'Établissement où vous exercez'}
                                                </label>
                                                <select
                                                    value={selectedClinicId}
                                                    onChange={(e) => setSelectedClinicId(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-sm font-bold text-white outline-none focus:border-[#088395] transition-all appearance-none cursor-pointer"
                                                    required
                                                >
                                                    <option value="" className="bg-[#0b1b2b]">Choisir un établissement</option>
                                                    {allClinics.map(clinic => (
                                                        <option key={clinic.id} value={clinic.id} className="bg-[#0b1b2b]">
                                                            {clinic.fullName || clinic.name} ({clinic.clinicType || 'Clinique'})
                                                        </option>
                                                    ))}
                                                </select>
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
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Capacité Médecins</label>
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {[3, 7, 15, -1].map(n => (
                                                            <button key={n} type="button" onClick={() => setMaxDoctors(n)} className={cn("py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", maxDoctors === n ? "bg-white text-[#088395] border-white" : "bg-white/5 border-white/10 text-white/40")}>
                                                                {n === -1 ? '∞' : n}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Capacité Patients (Parents)</label>
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {[3, 10, 15, -1].map(n => (
                                                            <button key={n} type="button" onClick={() => setMaxPatients(n)} className={cn("py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", maxPatients === n ? "bg-white text-[#088395] border-white" : "bg-white/5 border-white/10 text-white/40")}>
                                                                {n === -1 ? '∞' : n}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Durée de l'Abonnement</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {['Mensuel', 'Annuel'].map(p => (
                                                            <button key={p} type="button" onClick={() => setSubPlan(p)} className={cn("py-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all", subPlan === p ? "bg-white text-[#088395] border-white" : "bg-white/5 border-white/10 text-white/40")}>
                                                                {p}
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

const TestCredentials = () => {
    const [copied, setCopied] = useState('');

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(''), 2000);
    };

    const CopyButton = ({ text }) => (
        <button 
            type="button"
            onClick={() => handleCopy(text)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
        >
            {copied === text ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-white/60" />}
        </button>
    );

    const creds = [
        { role: 'Agent Clinique', email: 'agentclinique@gmail.com', pass: 'agentclinique10' },
        { role: 'Médecin', email: 'medmed@gmail.com', pass: 'med12345' },
        { role: 'Parent', email: 'ahmed@gmail.com', pass: 'ahmed2020' },
        { role: 'Enfant', email: 'anas@gmail.com', pass: 'anas30' }
    ];

    return (
        <div className="relative lg:absolute lg:top-24 lg:left-6 w-full lg:w-auto mb-8 lg:mb-0 bg-[#088395]/10 backdrop-blur-xl border border-[#088395]/30 p-4 rounded-2xl z-50 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#088395] mb-4 flex items-center gap-2">
                <Activity size={14} /> Panel de Test
            </h3>
            <div className="space-y-4 text-white">
                {creds.map(c => (
                    <div key={c.role} className="space-y-1">
                        <div className="font-bold text-[#088395] text-[9px] uppercase tracking-widest">{c.role}</div>
                        <div className="flex items-center justify-between gap-6 bg-black/40 p-2 rounded-lg border border-white/5">
                            <span className="font-mono text-[10px] opacity-80">{c.email}</span>
                            <CopyButton text={c.email} />
                        </div>
                        <div className="flex items-center justify-between gap-6 bg-black/40 p-2 rounded-lg border border-white/5">
                            <span className="font-mono text-[10px] opacity-80">{c.pass}</span>
                            <CopyButton text={c.pass} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
