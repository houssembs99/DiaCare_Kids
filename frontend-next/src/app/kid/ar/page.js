"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Heart, Candy, MessageCircle, Dumbbell, Apple, Syringe, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
  const [modelScale, setModelScale] = useState(1.3);
  const [modelRotation, setModelRotation] = useState(0);
  const [isXR, setIsXR] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
        setIsGreeting(false);
        setAnimation("happyidle");
    }, 6000);
    return () => {
        clearTimeout(timer);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };
  }, []);

  const handleLaunchAR = async () => {
    setIsXR(true);
    await store.enterAR();
  };

  const handleExitAR = async () => {
    await store.exitAR();
    setTimeout(() => {
        setIsXR(false);
    }, 150);
  };

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
            setGameMessage(lang === 'ar' ? 'مممم حلوى! لكن لا تكثر منها لتجنv الارتفاع.' : 'Miam ! Mais attention à ne pas en abuser pour rester en zone verte.');
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
    <div id="ar-game-container" className="fixed inset-0 flex flex-col overflow-hidden font-sans select-none z-[9999]">
      
      {/* 1. INTERFACE "MAGIE AR" (LE MENU DE DÉPART) */}
      {!isXR && (
        <div className="absolute inset-0 z-[1000] bg-gradient-to-b from-[#0b1b2b] via-[#0b1b2b] to-[#1a2a3a] flex flex-col">
            <div className="h-[100px] pt-12 px-6 flex items-center justify-between">
                <Link href="/kid/dashboard" className="p-3 bg-white/10 border border-white/20 rounded-xl text-white">
                    <ChevronLeft size={20} />
                </Link>
                <div className="text-right">
                    <h1 className="text-white font-black italic uppercase tracking-tighter text-xl">
                        MAGIE <span className="text-[#FFB300]">AR</span>
                    </h1>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-12"
                >
                    <div className="bg-white/5 border-2 border-white/10 p-8 rounded-[50px] backdrop-blur-3xl shadow-2xl">
                        <p className="text-white/40 font-bold mb-2 uppercase tracking-widest text-[10px]">Découvre la magie avec</p>
                        <h2 className="text-white text-5xl font-black italic uppercase tracking-tighter mb-4">HAMOUCH</h2>
                        <div className="flex justify-center gap-2">
                             <div className="w-2 h-2 bg-[#FFB300] rounded-full animate-ping" />
                             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                             <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col gap-4 w-full max-w-[280px]">
                    <button 
                        onClick={handleLaunchAR}
                        className="group relative py-6 bg-[#FFB300] rounded-[30px] shadow-[0_20px_50px_rgba(255,179,0,0.3)] active:scale-95 transition-all overflow-hidden"
                    >
                        <div className="flex items-center justify-center gap-4 relative z-10">
                            <Sparkles className="text-[#0b1b2b]" size={28} />
                            <span className="text-[#0b1b2b] text-xl font-black italic uppercase tracking-tighter">Lancer l'Aventure</span>
                        </div>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </button>
                    
                    <div className="flex gap-2">
                        <button onClick={() => setModelScale(prev => Math.min(prev + 0.2, 3))} className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-white flex justify-center"><ZoomIn size={20} /></button>
                        <button onClick={() => setModelScale(prev => Math.max(prev - 0.2, 0.5))} className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-white flex justify-center"><ZoomOut size={20} /></button>
                        <button onClick={() => setModelRotation(prev => prev + Math.PI / 4)} className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-white flex justify-center"><RotateCcw size={20} /></button>
                    </div>
                </div>

                <p className="text-white/20 mt-8 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Vise une surface plane !</p>
            </div>
        </div>
      )}

      {/* 2. INTERFACE "MODE AR" (LE HUD DE JEU - OVERLAY) */}
      <div id="xr-ui-controls" className={`absolute inset-0 flex flex-col pointer-events-none z-[2000] transition-opacity duration-500 ${isXR ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* BARRE DE CONTRÔLE (HUD) */}
        <div className="bg-[#0b1b2b]/80 backdrop-blur-xl border-b border-white/10 pb-4 shrink-0 pointer-events-auto">
            <div className="h-[60px] pt-6 flex items-center justify-center opacity-20">
                <div className="w-16 h-1 bg-white rounded-full" />
            </div>

            <div className="px-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <button onClick={handleExitAR} className="p-3 bg-red-500/20 border border-red-500/20 rounded-xl text-red-400">
                        <ChevronLeft size={18} />
                    </button>
                    <button 
                        onClick={() => { 
                            if (animation === "sport") { setAnimation("happyidle"); } 
                            else { setAnimation("sport"); handleSpeak(t('kid.arEdu.sportDesc')); }
                        }}
                        className={`p-3 rounded-xl border ${animation === "sport" ? "bg-[#FFB300] text-[#0b1b2b]" : "bg-white/5 text-white border-white/10"}`}
                    >
                        <Dumbbell size={18} className={animation === "sport" ? "animate-bounce" : ""} />
                    </button>
                </div>

                <div className={`flex items-center justify-center border-2 px-4 py-2 rounded-2xl min-w-[70px] ${
                    currentStatus === 'perfect' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400'
                }`}>
                    <span className="text-xl font-black">{glucose}</span>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={() => handleItemClick('apple')} className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400"><Apple size={16} /></button>
                    <button onClick={() => handleItemClick('insulin')} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400"><Syringe size={16} /></button>
                    <button onClick={() => handleItemClick('candy')} className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-400"><Candy size={16} /></button>
                </div>
            </div>
        </div>

        {/* POPUPS PENDANT LE JEU */}
        <div className="flex-1 relative">
            <AnimatePresence>
                {showPopup && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-10 left-6 right-6 pointer-events-auto">
                    <div className="bg-[#0b1b2b] border-2 border-white/20 p-6 rounded-[35px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">{currentStatus === 'hypo' ? <Candy size={80} /> : <Apple size={80} />}</div>
                        <p className={`text-white leading-relaxed font-black text-sm ${lang === 'ar' ? 'text-right font-arabic' : ''}`}>{gameMessage || (isGreeting ? t('kid.arEdu.greeting') : "")}</p>
                        <button onClick={() => setShowPopup(false)} className="mt-4 w-full bg-white/10 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">C'est compris !</button>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* 3. ZONE RENDU 3D (FOND) */}
      <div className="flex-1 relative z-0">
        <ARScene animationName={animation} modelScale={modelScale} modelRotation={modelRotation} />
      </div>

    </div>
  );
}
