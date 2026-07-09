"use client";

import React, { useState, useEffect } from 'react';
import { Check, Zap, CreditCard, Shield, Star, Crown, Users, Baby, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const renderPlanIcon = (iconName) => {
    switch (iconName) {
        case 'Star': return <Star size={32} />;
        case 'Crown': return <Crown size={32} />;
        default: return <Shield size={32} />;
    }
};

export default function PricingPage() {
    const [plansList, setPlansList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [activeTab, setActiveTab] = useState('Parent'); // Default view for guests

    useEffect(() => {
        const fetchPlans = async () => {
            let useClinicPackages = false;
            let clinicId = null;

            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    setUserRole(parsed.role);
                    if (parsed.role === 'Clinique' || parsed.role === 'Medecin') {
                        setActiveTab('Clinique');
                    } else {
                        setActiveTab('Parent');
                    }

                    if (parsed.role === 'Parent' && parsed.associatedClinicId) {
                        useClinicPackages = true;
                        clinicId = parsed.associatedClinicId;
                    }
                } catch (e) {
                    console.error("Error parsing user role:", e);
                }
            }

            try {
                let res;
                if (useClinicPackages) {
                    res = await api.get(`/ClinicPackages/clinic/${clinicId}`);
                    // Map clinic packages to unified format expected by the frontend
                    const mappedPlans = res.data.map(pkg => ({
                        id: pkg.id,
                        name: pkg.name,
                        price: pkg.price,
                        currency: pkg.currency || 'TND',
                        duration: pkg.paymentFrequency,
                        role: 'Parent',
                        maxKids: pkg.maxKidsPerParent,
                        features: pkg.services || [],
                        color: 'from-[#088395] to-[#0b1b2b]',
                        iconName: 'Star',
                        isPopular: pkg.price > 0 // Just an arbitrary UI logic
                    }));
                    setPlansList(mappedPlans);
                } else {
                    res = await api.get('/Plans');
                    setPlansList(res.data);
                }
            } catch (err) {
                console.error("Error fetching pricing plans:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleSubscribe = async (plan) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Vous devez être connecté pour vous abonner. Redirection vers la page d'inscription.");
            // Pass selected plan and role to register page
            window.location.href = `/auth?plan=${plan.name}&role=${plan.role}`;
            return;
        }

        const amountInCents = Math.round(plan.price * 100);
        window.location.href = `/checkout?amount=${amountInCents}&plan=${plan.name}`;
    };

    // Filter plans based on active tab / logged-in user role
    const displayedPlans = plansList.filter(plan => {
        if (userRole) {
            // Logged in: show role-specific plans
            if (userRole === 'Parent') return plan.role === 'Parent';
            if (userRole === 'Clinique' || userRole === 'Medecin') return plan.role === 'Clinique';
            return plan.role === 'Parent'; // fallback
        } else {
            // Guest: show based on tab
            return plan.role === activeTab;
        }
    });

    return (
        <div className="min-h-screen bg-[#0b1b2b] text-white py-20 px-4 flex flex-col items-center">
            {/* Background Glow */}
            <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-[#1E88E5]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => window.history.back()}
                className="absolute top-32 left-10 z-[100] flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Retour
            </motion.button>

            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mb-12 relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E88E5]/10 text-[#1E88E5] text-xs font-black uppercase tracking-widest mb-6 border border-[#1E88E5]/20">
                    <Shield size={14} /> Sécurisé par Stripe
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-6 leading-none">
                    Forfaits <span className="text-white/40">Tarifaires</span>
                </h1>
                <p className="text-white/60 text-base md:text-lg font-bold">
                    {userRole 
                        ? `Offres disponibles pour votre profil (${userRole})` 
                        : "Choisissez le plan qui correspond à vos besoins et bénéficiez de toutes les fonctionnalités de DiaCare Kids."}
                </p>
            </motion.div>

            {/* Segmented control for guests */}
            {!userRole && (
                <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-16 relative z-10">
                    <button
                        onClick={() => setActiveTab('Parent')}
                        className={cn(
                            "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'Parent' ? "bg-white text-[#0b1b2b] shadow-xl" : "text-white/60 hover:text-white"
                        )}
                    >
                        Pour les Parents
                    </button>
                    <button
                        onClick={() => setActiveTab('Clinique')}
                        className={cn(
                            "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'Clinique' ? "bg-white text-[#0b1b2b] shadow-xl" : "text-white/60 hover:text-white"
                        )}
                    >
                        Pour les Cliniques
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center relative z-10">
                    <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest text-white/40">Chargement des forfaits...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
                    {displayedPlans.map((plan, index) => (
                        <motion.div
                            key={plan.id || plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#1E88E5]/50 transition-colors shadow-2xl"
                        >
                            {plan.isPopular && (
                                <div className="absolute top-6 right-[-30px] bg-[#1E88E5] px-10 py-1 rotate-45 text-[9px] font-black uppercase tracking-widest shadow-lg">
                                    Populaire
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-xl",
                                        plan.color || 'from-[#1E88E5] to-[#1565C0]'
                                    )}>
                                        {renderPlanIcon(plan.iconName)}
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest border border-white/5">
                                        {plan.role}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-2 mb-8 border-b border-white/5 pb-6">
                                    <span className="text-4xl font-black">{plan.price}</span>
                                    <span className="text-sm font-bold opacity-40 uppercase tracking-widest">
                                        {(plan.currency || 'dt').toUpperCase()} / {plan.duration}
                                    </span>
                                </div>

                                {/* Plan quotas/limits info */}
                                <div className="space-y-3 mb-8">
                                    {plan.role === 'Clinique' ? (
                                        <>
                                            <div className="flex items-center gap-3 text-white/0.70 text-xs font-bold uppercase tracking-wide">
                                                <Users size={14} className="text-[#1E88E5]" />
                                                <span>
                                                    {plan.maxDoctors === -1 ? 'Médecins illimités' : `${plan.maxDoctors} Médecins Max`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-white/0.70 text-xs font-bold uppercase tracking-wide">
                                                <Zap size={14} className="text-yellow-500" />
                                                <span>
                                                    {plan.maxPatients === -1 ? 'Patients illimités' : `${plan.maxPatients} Patients Max`}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-3 text-white/0.70 text-xs font-bold uppercase tracking-wide">
                                            <Baby size={14} className="text-[#1E88E5]" />
                                            <span>
                                                Jusqu'à {plan.maxKids} {plan.maxKids > 1 ? 'Enfants' : 'Enfant'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center gap-3 text-white/0.80 font-bold text-xs uppercase tracking-wide">
                                            <div className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center border border-success/20">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan)}
                                className="w-full py-5 bg-white text-[#0b1b2b] rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#1E88E5] hover:text-white transition-all shadow-xl mt-auto"
                            >
                                <CreditCard size={18} /> {plan.price === 0 ? 'Choisir ce plan' : 'S\'abonner'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
