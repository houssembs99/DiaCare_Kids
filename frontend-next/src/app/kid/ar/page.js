"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Heart, Candy, MessageCircle, PlayCircle, Apple, Syringe } from 'lucide-react';
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
  const [currentStatus, setCurrentStatus] = useState("perfect");
  const [isMounted, setIsMounted] = useState(false);
  const [candyClicks, setCandyClicks] = useState(0);
  const [gameMessage, setGameMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
        setIsGreeting(false);
        setAnimation("happyidle");
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval;
    if (animation === "sport") {
        interval = setInterval(() => {
            setGlucose(prev => {
                const newVal = prev - 5;
                if (newVal < 60) {
                    setAnimation("basgl");
                    setCurrentStatus("hypo");
                    setGameMessage(lang === 'ar' ? 'أنا أشعر بالتعب، أحتاج لمساعدة!' : 'Je me sens faible... Aide-moi Hamouch !');
                    setShowPopup(true);
                    handleSpeak(lang === 'ar' ? 'أنا أشعر بالتعب، أحتاج لمساعدة!' : 'Je me sens faible... Aide-moi !');
                    return 55;
                }
                return newVal;
            });
        }, 2000);
    } else {
        clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [animation, lang]);

  const handleItemClick = (item) => {
    if (currentStatus === "hypo") {
        if (item === 'candy') {
            setGlucose(100);
            setAnimation("happyidle");
            setCurrentStatus("perfect");
            setGameMessage(lang === 'ar' ? 
                'أحسنت! في حالة نقص السكر (<70)، نحتاج لسكر سريع مثل الحلوى لرفع الطاقة.' : 
                'Bravo ! En hypo (<70), il faut du sucre rapide (bonbon) pour remonter l’énergie vite.');
            setCandyClicks(0);
        } else if (item === 'insulin') {
            setGameMessage(lang === 'ar' ? 
                'خطر! الأنسولين يخفض السكر أكثر. في نقص السكر، نحتاج للحلوى وليس الأنسولين.' : 
                'DANGER ! L’insuline baisse encore plus le sucre. En hypo, il faut du sucre, pas d’insuline !');
        } else {
            setGameMessage(lang === 'ar' ? 
                'التفاح صحي، لكنه بطيء. في حالة الطوارئ (<70)، الحلوى أسرع!' : 
                'La pomme est saine mais lente. En urgence (<70), le bonbon est plus rapide !');
        }
    } else if (item === 'candy') {
        const newClicks = candyClicks + 1;
        setCandyClicks(newClicks);
        const newVal = glucose + 40;
        setGlucose(newVal);
        if (newVal > 180) {
            setAnimation("hautegl");
            setCurrentStatus("hyper");
            setGameMessage(lang === 'ar' ? 
                'لقد أكلت الكثير! سكري الآن مرتفع (>180). أشعر بالعطش وأحتاج لأنسولين.' : 
                'Trop de sucre ! Je suis en hyper (>180). J’ai très soif et besoin d’insuline.');
        } else {
            setGameMessage(lang === 'ar' ? 'مممم حلوى! لكن لا تكثر منها لتجنب الارتفاع.' : 'Miam ! Mais attention à ne pas en abuser pour rester en zone verte.');
        }
    } else if (item === 'insulin') {
        if (glucose > 180) {
            setGlucose(100);
            setAnimation("happyidle");
            setCurrentStatus("perfect");
            setCandyClicks(0);
            setGameMessage(lang === 'ar' ? 
                'أحسنت! الأنسولين يساعدني على العودة لمنطقة الأمان (70-130).' : 
                'Parfait ! L’insuline m’aide à revenir dans ma zone de confort (70-130).');
        } else {
            setGameMessage(lang === 'ar' ? 
                'حذار! سكري طبيعي، الأنسولين الآن قد يسبب لي نقصاً في السكر.' : 
                'Attention ! Ma glycémie est bonne, l’insuline risque de me faire tomber en hypo.');
        }
    } else if (item === 'apple') {
        setAnimation("happyidle");
        setGameMessage(lang === 'ar' ? 
            'التفاح رائع! يساعدني على الدراسة واللعب بنشاط.' : 
            'Vive les pommes ! C’est idéal pour étudier et jouer en restant en forme.');
    }
    setShowPopup(true);
  };

  const handleSpeak = (text) => {
    try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
            utterance.onerror = (e) => console.warn("Speech error:", e);
            window.speechSynthesis.speak(utterance);
        }
    } catch (err) {
        console.error("Speech synthesis failed:", err);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 bg-[#0b1b2b] overflow-hidden font-sans select-none">
      
      {/* SCÈNE AR (EN ARRIÈRE-PLAN) */}
      <div className="absolute inset-0 z-0">
        <ARScene animationName={animation} />
      </div>

      {/* INTERFACE DE CONTRÔLE (L'OVERLAY) */}
      <div id="ar-ui-overlay" className="absolute inset-0 z-[100] flex flex-col pointer-events-none">
        
        {/* 1. NAVBAR IDENTITY */}
        <div className="h-[100px] pt-12 px-6 flex items-center justify-center bg-gradient-to-b from-[#0b1b2b] to-transparent">
            <div className="w-24 h-1.5 bg-white/10 rounded-full" />
        </div>

        {/* 2. BARRE D'INTERACTION */}
        <div className="px-4 pointer-events-auto">
            <div className="h-[90px] px-4 flex items-center justify-between bg-[#0b1b2b]/80 backdrop-blur-md border border-white/10 rounded-[30px] shadow-2xl gap-2">
                {/* GAUCHE : Quitter + Sport + Magie */}
                <div className="flex items-center gap-2">
                    <Link href="/kid/dashboard" className="p-3 bg-white/10 border border-white/10 rounded-xl text-white">
                        <ChevronLeft size={18} />
                    </Link>
                    <button 
                        onClick={() => { 
                            if (animation === "sport") {
                                setAnimation("happyidle");
                                handleSpeak(lang === 'ar' ? 'توقفنا عن الرياضة' : 'On arrête le sport !');
                            } else {
                                if (glucose > 250) {
                                    setGameMessage(lang === 'ar' ? 'خطر! سكري مرتفع جداً (>250). يجب أخذ الأنسولين وتجنب الرياضة الآن.' : 'STOP ! Mon sucre est trop haut (>250). Je dois prendre de l’insuline et éviter le sport.');
                                    setShowPopup(true);
                                    handleSpeak(lang === 'ar' ? 'سكري مرتفع جداً' : 'Mon sucre est trop haut !');
                                } else {
                                    setAnimation("sport"); 
                                    if (glucose > 180) {
                                        setGameMessage(lang === 'ar' ? 'سكري مرتفع قليلاً، سأمارس الرياضة بحذر.' : 'Mon sucre est un peu haut, je vais faire du sport prudemment.');
                                        setShowPopup(true);
                                    }
                                    handleSpeak(t('kid.arEdu.sportDesc')); 
                                }
                            }
                        }}
                        className={`p-3 rounded-xl flex items-center gap-2 transition-all border ${
                            animation === "sport" ? "bg-[#FFB300] text-[#0b1b2b] border-[#FFB300]" : "bg-white/5 text-white border-white/10"
                        }`}
                    >
                        <PlayCircle size={18} className={animation === "sport" ? "animate-spin" : ""} />
                    </button>
                    <button onClick={() => store.enterAR()} className="bg-[#FFB300] text-[#0b1b2b] p-3 rounded-xl shadow-lg">
                        <Sparkles size={18} />
                    </button>
                </div>

                {/* CENTRE : Glycémie */}
                <div className="flex-1 flex justify-center">
                    <div className={`flex items-center justify-center border-2 px-4 py-2 rounded-2xl shadow-xl min-w-[80px] ${
                        currentStatus === 'perfect' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 
                        currentStatus === 'hypo' ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                    }`}>
                        <span className="text-xl font-black">{glucose}</span>
                    </div>
                </div>

                {/* DROITE : Objets */}
                <div className="flex items-center gap-2">
                    <button onClick={() => handleItemClick('apple')} className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400">
                        <Apple size={18} />
                    </button>
                    <button onClick={() => handleItemClick('insulin')} className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400">
                        <Syringe size={18} />
                    </button>
                    <button onClick={() => handleItemClick('candy')} className="p-3 bg-pink-500/20 border border-pink-500/30 rounded-xl text-pink-400">
                        <Candy size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* POPUPS (FLOATING) */}
        <div className="flex-1 relative">
            <AnimatePresence>
                {showPopup && (
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="absolute bottom-10 left-6 right-6 z-[200] pointer-events-auto"
                >
                    <div className="bg-gradient-to-br from-[#0b1b2b] to-[#1a2a3a] border-2 border-white/10 p-6 rounded-[35px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            {currentStatus === 'hypo' ? <Candy size={80} /> : <Apple size={80} />}
                        </div>
                        <p className={`text-white leading-relaxed font-black text-sm relative z-10 ${lang === 'ar' ? 'text-right font-arabic' : ''}`}>
                            {gameMessage || (isGreeting ? t('kid.arEdu.greeting') : "")}
                        </p>
                        <button 
                            onClick={() => setShowPopup(false)}
                            className="mt-4 w-full bg-white/10 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                            Continuer
                        </button>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
  );
}
