"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Heart, Zap, MessageCircle, PlayCircle, Apple, Syringe } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { store } from '@/components/AR/ARScene';

const ARScene = dynamic(() => import('@/components/AR/ARScene'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b1b2b]">
      <div className="w-16 h-16 border-4 border-white/10 border-t-[#FFB300] rounded-full animate-spin mb-4" />
      <p className="text-white/40 font-black uppercase tracking-widest text-xs">Magie en cours...</p>
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 bg-[#0b1b2b] flex flex-col overflow-hidden font-sans select-none">
      
      {/* 1. NAVBAR (HAUT) - Encore plus grande pour descendre le reste */}
      <div className="h-[120px] pt-16 px-6 flex items-center justify-center z-[100] bg-[#0b1b2b]">
        <div className="w-24 h-1.5 bg-white/5 rounded-full" />
      </div>

      {/* 2. BARRE D'INTERACTION (SOUS NAVBAR) - TOUT REGROUPÉ ICI */}
      <div className="h-[100px] px-4 flex items-center justify-between z-[100] bg-[#0b1b2b]/90 backdrop-blur-md border-b border-white/10 gap-2">
        {/* GROUPE GAUCHE : Quitter + Sport + Magie */}
        <div className="flex items-center gap-2 shrink-0">
            <Link href="/kid/dashboard" className="p-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 active:scale-95 transition-all">
                <ChevronLeft size={18} />
            </Link>
            <button 
                onClick={() => { setAnimation("sport"); handleSpeak(t('kid.arEdu.sportDesc')); }}
                className="bg-white/10 text-white p-3 rounded-xl flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all border border-white/10"
            >
                <PlayCircle size={18} />
                <span className="font-black uppercase tracking-widest text-[9px]">Sport</span>
            </button>
            <button 
                onClick={() => store.enterAR()}
                className="bg-[#FFB300] text-[#0b1b2b] p-3 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FFB300]/20"
            >
                <Sparkles size={18} />
                <span className="font-black uppercase tracking-widest text-[9px]">Magie</span>
            </button>
        </div>

        {/* GROUPE CENTRE : Glycémie */}
        <div className="flex-1 flex justify-center">
            <div className="flex items-center justify-between bg-black/40 border border-white/10 px-3 py-2 rounded-2xl shadow-2xl w-full max-w-[140px]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/60 text-[7px] font-black uppercase tracking-widest">Direct</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[#FFB300] text-lg font-black tracking-tighter">{glucose}</span>
                </div>
            </div>
        </div>

        {/* GROUPE DROIT : Message + Titre */}
        <div className="flex items-center gap-2 shrink-0 text-right">
            <button 
                onClick={() => setShowPopup(true)}
                className="p-3 bg-white/10 border border-white/10 rounded-xl text-white active:scale-90 shadow-lg"
            >
                <MessageCircle size={18} />
            </button>
            <h1 className="hidden xs:block text-white font-black italic uppercase tracking-tighter text-[10px] leading-none">
                HAMOUCH <span className="text-[#FFB300]">AR</span>
            </h1>
        </div>
      </div>

      {/* ZONE AVATAR (MILIEU) - PREND TOUT LE RESTE DE L'ÉCRAN JUSQU'EN BAS */}
      <div className="flex-1 relative z-0 overflow-hidden bg-black/20">
        <ARScene animationName={animation} />
        
        {/* Popups Éducatifs */}
        <AnimatePresence>
            {showPopup && (
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-10 left-6 right-6 z-[150]"
            >
                <div className={`bg-gradient-to-br ${current.color} backdrop-blur-3xl border border-white/20 p-6 rounded-[35px] shadow-2xl relative`}>
                    <p className={`text-white leading-relaxed font-black text-sm ${lang === 'ar' ? 'text-right font-arabic' : ''}`}>
                        {isGreeting ? t('kid.arEdu.greeting') : current.desc}
                    </p>
                    <button 
                        onClick={() => setShowPopup(false)}
                        className="mt-4 w-full bg-white/20 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px]"
                    >
                        Continuer
                    </button>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>

    </div>
  );
}
