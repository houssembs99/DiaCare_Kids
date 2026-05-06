"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Heart, Zap, MessageCircle, PlayCircle, Apple, Syringe } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const ARScene = dynamic(() => import('@/components/AR/ARScene'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b1b2b]">
      <div className="w-16 h-16 border-4 border-white/10 border-t-[#FFB300] rounded-full animate-spin mb-4" />
      <p className="text-white/40 font-black uppercase tracking-widest text-xs">Initialisation de Hamouch AR...</p>
    </div>
  )
});

export default function ARPage() {
  const { t, lang } = useLanguage();
  const [animation, setAnimation] = useState("greeting");
  const [glucose, setGlucose] = useState(100);
  const [isGreeting, setIsGreeting] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("perfect"); // perfect, hypo, hyper

  const handleSpeak = (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'ar' ? 'ar-SA' : (lang === 'en' ? 'en-US' : 'fr-FR');
        window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const initAR = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        try {
          const res = await api.get(`/medicalrecords/patient/${user.id}`);
          if (res.data && res.data.length > 0) {
            const val = res.data[0].glucoseValue;
            setGlucose(val);
            
            // Phase d'accueil
            setTimeout(() => {
                setShowPopup(true);
                handleSpeak(t('kid.arEdu.greeting'));
            }, 1000);

            // Phase après accueil
            setTimeout(() => {
                setIsGreeting(false);
                if (val < 70) {
                    setAnimation("basgl");
                    setCurrentStatus("hypo");
                    handleSpeak(t('kid.arEdu.hypoDesc'));
                } else if (val > 140) {
                    setAnimation("hautegl");
                    setCurrentStatus("hyper");
                    handleSpeak(t('kid.arEdu.hyperDesc'));
                } else {
                    setAnimation("happyidle");
                    setCurrentStatus("perfect");
                    handleSpeak(t('kid.arEdu.perfectDesc'));
                }
            }, 6000);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    initAR();
    return () => window.speechSynthesis?.cancel();
  }, [lang]);

  const handleAction = (type) => {
    if (type === 'sugar' && currentStatus === 'hypo') {
        setAnimation("happyidle");
        setCurrentStatus("perfect");
        setShowPopup(false);
        setGlucose(95);
    }
    if (type === 'insulin' && currentStatus === 'hyper') {
        setAnimation("happyidle");
        setCurrentStatus("perfect");
        setShowPopup(false);
        setGlucose(110);
    }
  };

  const statusInfo = {
    perfect: {
        title: t('kid.arEdu.perfectTitle'),
        desc: t('kid.arEdu.perfectDesc'),
        icon: <Sparkles className="text-green-400" />,
        color: "from-green-500/20 to-emerald-500/20"
    },
    hypo: {
        title: t('kid.arEdu.hypoTitle'),
        desc: t('kid.arEdu.hypoDesc'),
        icon: <Apple className="text-red-400" />,
        color: "from-red-500/20 to-orange-500/20",
        action: { label: t('kid.arEdu.hypoAction'), type: 'sugar' }
    },
    hyper: {
        title: t('kid.arEdu.hyperTitle'),
        desc: t('kid.arEdu.hyperDesc'),
        icon: <Syringe className="text-blue-400" />,
        color: "from-orange-500/20 to-red-500/20",
        action: { label: t('kid.arEdu.hyperAction'), type: 'insulin' }
    }
  };

  const current = statusInfo[currentStatus];

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden font-sans select-none z-[9999] bg-transparent">
      
      {/* Header / Navbar - Priorité absolue */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between z-[10000] bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
        <Link href="/kid/dashboard" className="pointer-events-auto p-4 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/30 active:scale-95 transition-all flex items-center gap-3 shadow-2xl">
          <ChevronLeft size={22} />
          <span className="font-black uppercase tracking-[0.1em] text-[11px]">{lang === 'ar' ? 'خروج' : 'Quitter'}</span>
        </Link>
        <div className="flex flex-col items-end pointer-events-auto">
            <h1 className="text-white font-black italic uppercase tracking-tighter text-2xl leading-none drop-shadow-lg">
                {lang === 'ar' ? 'حموش' : 'Hamouch'} <span className="text-[#FFB300]">AR</span>
            </h1>
        </div>
      </div>

      {/* Capteur de Glycémie */}
      <div className="px-6 py-2 z-[10000] pointer-events-none">
        <div className="flex items-center justify-between bg-black/50 backdrop-blur-2xl border border-white/20 p-4 rounded-[28px] shadow-2xl max-w-sm mx-auto w-full pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-40" />
            </div>
            <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Glycémie en Direct</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#FFB300] text-2xl font-black tracking-tight">{glucose}</span>
            <span className="text-white/40 text-[10px] font-black">mg/dL</span>
          </div>
        </div>
      </div>

      {/* Zone AR */}
      <div className="flex-1 relative">
        <ARScene animationName={animation} />
      </div>

      {/* Popups Éducatifs */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-40 left-6 right-6 z-[150]"
          >
            <div className={`bg-gradient-to-br ${current.color} backdrop-blur-2xl border border-white/20 p-6 rounded-[40px] shadow-2xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">{current.icon}</div>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                        {current.icon}
                    </div>
                    <h2 className="text-white font-black uppercase italic tracking-tight text-lg">
                        {isGreeting ? "Bienvenue !" : current.title}
                    </h2>
                </div>

                <p className={`text-white/80 leading-relaxed mb-6 font-medium ${lang === 'ar' ? 'text-right font-arabic' : 'text-sm'}`}>
                    {isGreeting ? t('kid.arEdu.greeting') : current.desc}
                </p>

                {current.action && !isGreeting && (
                    <button 
                        onClick={() => handleAction(current.action.type)}
                        className="w-full bg-white text-[#0b1b2b] py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl animate-bounce"
                    >
                        {current.action.label}
                    </button>
                )}

                {!current.action && !isGreeting && (
                     <button 
                        onClick={() => setShowPopup(false)}
                        className="w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm"
                     >
                        Compris !
                     </button>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre de contrôle manuelle - Adaptée */}
      <div className="absolute bottom-10 left-0 right-0 px-6 z-[9999] flex justify-center gap-4 pointer-events-none">
        <button 
          onClick={() => { setAnimation("sport"); handleSpeak(t('kid.arEdu.sportDesc')); }}
          className="pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-[24px] flex items-center gap-3 text-white hover:bg-[#FFB300] hover:text-[#0b1b2b] active:scale-95 transition-all group shadow-2xl"
        >
          <PlayCircle size={22} className="group-hover:rotate-90 transition-transform" />
          <span className="font-black uppercase tracking-[0.15em] text-[10px]">{t('kid.arEdu.sportTitle')}</span>
        </button>

        <button 
          onClick={() => setShowPopup(true)}
          className="pointer-events-auto w-16 h-16 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[24px] flex items-center justify-center text-white active:scale-90 shadow-2xl"
        >
          <MessageCircle size={24} />
        </button>
      </div>

      {/* PANNEAU DE TEST (Debug) */}
      <div className="absolute top-48 right-4 z-[9999] flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <button onClick={() => { setGlucose(50); setAnimation("basgl"); setCurrentStatus("hypo"); setIsGreeting(false); setShowPopup(true); }} className="w-10 h-10 bg-red-500/80 rounded-full text-white text-[8px] font-bold flex items-center justify-center">L</button>
        <button onClick={() => { setGlucose(100); setAnimation("happyidle"); setCurrentStatus("perfect"); setIsGreeting(false); setShowPopup(true); }} className="w-10 h-10 bg-green-500/80 rounded-full text-white text-[8px] font-bold flex items-center justify-center">OK</button>
        <button onClick={() => { setGlucose(250); setAnimation("hautegl"); setCurrentStatus("hyper"); setIsGreeting(false); setShowPopup(true); }} className="w-10 h-10 bg-orange-500/80 rounded-full text-white text-[8px] font-bold flex items-center justify-center">H</button>
      </div>

    </div>
  );
}
