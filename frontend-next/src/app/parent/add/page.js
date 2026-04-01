"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Activity, Clock, Syringe, Utensils,
    Zap, MessageSquare, Save, AlertTriangle,
    X, CheckCircle2, ChevronRight, ArrowLeft, PlusCircle,
    Baby, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const FormSection = ({ title, children, icon: Icon }) => (
    <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 pl-4 flex items-center gap-2">
            {Icon && <Icon size={14} />} {title}
        </label>
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 space-y-4 shadow-xl">
            {children}
        </div>
    </div>
);

export default function AddMeasure() {
    const { t } = useLanguage();
    const router = useRouter();
    const [glucose, setGlucose] = useState("");
    const [moment, setMoment] = useState("before");
    const [insulin, setInsulin] = useState(false);
    const [dose, setDose] = useState("");
    const [meal, setMeal] = useState("none");
    const [activity, setActivity] = useState(false);
    const [comment, setComment] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [showAiResult, setShowAiResult] = useState(false);
    const [aiData, setAiData] = useState(null);
    const [alertType, setAlertType] = useState(null); // 'hypo' or 'hyper'
    const [patientKids, setPatientKids] = useState([]);
    const [selectedChild, setSelectedChild] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await api.get('/parent/children');
                setPatientKids(res.data);
                if (res.data.length > 0) setSelectedChild(res.data[0].id);
            } catch (err) {
                console.error("Error fetching children:", err);
            }
        };
        fetchChildren();
    }, []);

    const handleSave = async () => {
        if (!glucose || !selectedChild) return;
        
        setIsSaving(true);
        try {
            const payload = {
                patientId: selectedChild,
                glucoseValue: parseFloat(glucose),
                timing: moment,
                insulinDose: insulin ? parseFloat(dose) : 0,
                carbsEstimated: meal !== 'none' ? 40 : 0, // Mock carb estimation based on meal
                activityLevel: activity ? "Modérée" : "Faible",
                notes: comment
            };

            const res = await api.post('/medicalrecords', payload);
            console.log("API Response:", res.data);
            
            if (res.data.aiPrediction) {
                setAiData(res.data);
                setShowAiResult(true);
            } else if (parseFloat(glucose) < 70) {
                setAlertType('hypo');
                setShowAlert(true);
            } else if (parseFloat(glucose) > 250) {
                setAlertType('hyper');
                setShowAlert(true);
            } else {
                router.push('/parent/dashboard');
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "ERREUR LORS DE LA CRÉATION";
            alert(msg + (err.response?.data?.details ? "\n" + err.response.data.details : ""));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout role="Parent">
            <div className="space-y-8 pb-32 text-white max-w-lg mx-auto relative">

                {/* Header SECTION 5.1 */}
                <div className="flex items-center gap-6 pt-4">
                    <button onClick={() => router.back()} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-black tracking-tight leading-none italic uppercase">
                        Saisie <span className="text-white/40">Rapide</span>
                    </h1>
                </div>

                {/* Child Selector */}
                {patientKids.length > 1 && (
                    <FormSection title="Sélectionner l'enfant" icon={Baby}>
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {patientKids.map(child => (
                                <button
                                    key={child.id}
                                    onClick={() => setSelectedChild(child.id)}
                                    className={cn(
                                        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border whitespace-nowrap transition-all",
                                        selectedChild === child.id ? "bg-white text-[#088395] border-transparent shadow-xl" : "bg-white/5 border-white/5 text-white/40"
                                    )}
                                >
                                    {child.fullName}
                                </button>
                            ))}
                        </div>
                    </FormSection>
                )}

                {/* Glucose Input SECTION 5.2 */}
                <div className="flex flex-col items-center">
                    <div className="w-full bg-gradient-to-br from-[#088395] to-[#066a7a] rounded-[40px] p-10 shadow-2xl relative overflow-hidden flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">Taux de Glycémie</div>
                        <div className="flex items-baseline gap-4">
                            <input
                                type="number"
                                value={glucose}
                                onChange={(e) => setGlucose(e.target.value)}
                                placeholder="--"
                                className="bg-transparent text-center text-7xl font-black italic tracking-tighter w-40 focus:outline-none placeholder:text-white/10"
                            />
                            <span className="text-2xl font-bold opacity-30">mg/dL</span>
                        </div>
                    </div>
                </div>

                {/* Form Sections SECTION 5.2 */}
                <div className="space-y-10">

                    {/* Moment */}
                    <FormSection title="Moment du prélèvement" icon={Clock}>
                        <div className="grid grid-cols-2 gap-3">
                            {['before', 'after', 'bedtime', 'other'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMoment(m)}
                                    className={cn(
                                        "py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                        moment === m ? "bg-white text-[#088395] border-transparent shadow-xl" : "bg-white/5 border-white/5 text-white/40"
                                    )}
                                >
                                    {t(`parent.moment.${m}`)}
                                </button>
                            ))}
                        </div>
                    </FormSection>

                    {/* Insulin */}
                    <FormSection title="Insuline injectée" icon={Syringe}>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setInsulin(!insulin)}
                                className={cn(
                                    "px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                    insulin ? "bg-success text-white border-transparent" : "bg-white/5 border-white/5 text-white/40"
                                )}
                            >
                                {insulin ? 'OUI' : 'NON'}
                            </button>
                            {insulin && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex-1 relative">
                                    <input
                                        type="number"
                                        placeholder="DOSE (UI)"
                                        value={dose}
                                        onChange={(e) => setDose(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[10px] font-black uppercase focus:border-success focus:outline-none"
                                    />
                                </motion.div>
                            )}
                        </div>
                    </FormSection>

                    {/* Meal */}
                    <FormSection title="Repas consommé" icon={Utensils}>
                        <div className="grid grid-cols-2 gap-3">
                            {['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMeal(m)}
                                    className={cn(
                                        "py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                        meal === m ? "bg-[#088395] text-white border-transparent shadow-xl" : "bg-white/5 border-white/5 text-white/40"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </FormSection>

                    {/* Physical Activity */}
                    <FormSection title="Activité Physique" icon={Zap}>
                        <div className="flex items-center justify-between p-2">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Activité réalisée aujourd'hui ?</div>
                            <div
                                onClick={() => setActivity(!activity)}
                                className={cn(
                                    "w-14 h-8 rounded-full p-1 cursor-pointer transition-all",
                                    activity ? "bg-success flex justify-end" : "bg-white/10 flex justify-start"
                                )}
                            >
                                <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
                            </div>
                        </div>
                    </FormSection>

                    {/* Comments */}
                    <FormSection title="Commentaire & Observations" icon={MessageSquare}>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Observations, allergies, fatigue..."
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-[11px] font-medium min-h-[120px] focus:outline-none focus:border-[#088395]"
                        />
                    </FormSection>

                    {/* CTA Save */}
                    <button
                        onClick={handleSave}
                        disabled={!glucose || isSaving}
                        className="w-full py-6 bg-white text-[#088395] rounded-[32px] font-black uppercase tracking-[0.3em] text-[12px] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:scale-100"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
                        {isSaving ? 'ENREGISTREMENT...' : 'ENREGISTRER LA MESURE'}
                    </button>

                </div>

                {/* AI Result Result SECTION 5.3 */}
                <AnimatePresence>
                    {showAiResult && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center px-6 bg-black/60 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-md bg-gradient-to-br from-[#088395] to-[#044a55] rounded-[40px] p-8 border border-white/20 shadow-3xl text-white relative text-center"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                    <Activity size={40} className="text-[#088395]" />
                                </div>
                                
                                <h2 className="text-2xl font-black italic uppercase tracking-tight mt-6">Analyse de DiaPote</h2>
                                
                                <div className="my-8 space-y-4">
                                    <div className="bg-white/10 rounded-3xl p-6 border border-white/10">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Glycémie Prédictive</div>
                                        <div className="text-5xl font-black italic flex items-baseline justify-center gap-2">
                                            {Math.round(aiData?.aiPrediction)}
                                            <span className="text-sm opacity-40">mg/dL</span>
                                        </div>
                                        <div className={cn(
                                            "mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            aiData?.aiPrediction > aiData?.record?.glucoseValue ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"
                                        )}>
                                            {aiData?.aiPrediction > aiData?.record?.glucoseValue ? "Tendance en hausse ↑" : "Tendance en baisse ↓"}
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm font-medium leading-relaxed italic opacity-90">
                                        "{aiData?.aiMessage}"
                                    </p>
                                </div>

                                <button
                                    onClick={() => router.push('/parent/dashboard')}
                                    className="w-full py-5 bg-white text-[#088395] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-opacity-90 transition-all"
                                >
                                    CONTINUER AU TABLEAU DE BORD
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Intelligent Alert Result SECTION 5.3 */}
                <AnimatePresence>
                    {showAlert && (
                        <div className="fixed inset-0 z-[110] flex items-end p-6 bg-black/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ y: 200, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 200, opacity: 0 }}
                                className={cn(
                                    "w-full max-w-lg mx-auto rounded-[40px] p-10 shadow-3xl border text-white relative",
                                    alertType === 'hypo' ? "bg-accent border-accent/20" : "bg-orange-500 border-orange-500/20"
                                )}
                            >
                                <button onClick={() => setShowAlert(false)} className="absolute top-6 right-6 p-2 bg-black/10 rounded-full">
                                    <X size={20} />
                                </button>
                                <div className="flex flex-col items-center text-center space-y-6 pt-4">
                                    <div className="w-20 h-20 bg-black/10 rounded-full flex items-center justify-center">
                                        <AlertTriangle size={40} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">ATTENTION !</h2>
                                    <p className="text-sm font-medium leading-relaxed opacity-90">
                                        {alertType === 'hypo' ? t('parent.hypoWarning') : t('parent.hyperWarning')}
                                    </p>
                                    <button
                                        onClick={() => router.push('/parent/dashboard')}
                                        className="w-full py-5 bg-white/10 border border-white/20 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                    >
                                        J'AI COMPRIS
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
}
