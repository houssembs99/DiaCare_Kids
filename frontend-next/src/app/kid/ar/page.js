"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Heart, Candy, MessageCircle, Dumbbell, Apple, Syringe, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
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
  const [showPopup, setShowPopup] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("perfect");
  const [isMounted, setIsMounted] = useState(false);
  const [candyClicks, setCandyClicks] = useState(0);
  const [gameMessage, setGameMessage] = useState("");
  const [modelScale, setModelScale] = useState(1.3);
  const [modelRotation, setModelRotation] = useState(0);
  const [isXR, setIsXR] = useState(false);
  const [isGreeting, setIsGreeting] = useState(true);

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
    try {
      setIsXR(true);
      await store.enterAR();
    } catch (error) {
      console.error("Failed to enter AR:", error);
      setIsXR(false);
    }
  };

  const handleExitAR = async () => {
    try {
      await store.exitAR();
      setIsXR(false);
    } catch (error) {
      console.error("Failed to exit AR:", error);
      setIsXR(false);
    }
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
    <div id="ar-game-container" className="fixed inset-0 flex flex-col overflow-hidden font-sans select-none z-[9999] bg-[#0b1b2b]">
      
      {/* 1. BARRE DE MENU (Fixe en haut) */}
      <div id="ui-layer" className="bg-[#0b1b2b] border-b border-white/10 pb-4 shrink-0 z-[1000] pointer-events-auto shadow-2xl">
        <div className="h-[80px] pt-10 px-6 flex items-center justify-center opacity-30">
            <div className="w-24 h-1.5 bg-white/10 rounded-full" />
        </div>

        <div className="px-4">
            <div className="h-[80px] px-4 flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-[25px] shadow-xl gap-2">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => isXR ? handleExitAR() : window.history.back()}
                        className="p-3 bg-white/10 border border-white/10 rounded-xl text-white pointer-events-auto"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <button 
                        onClick={() => { 
                            if (animation === "sport") { setAnimation("happyidle"); } 
                            else { setAnimation("sport"); handleSpeak(t('kid.arEdu.sportDesc')); }
                        }}
                        className={`p-3 rounded-xl border pointer-events-auto ${animation === "sport" ? "bg-[#FFB300] text-[#0b1b2b]" : "bg-white/5 text-white border-white/10"}`}
                    >
                        <Dumbbell size={18} className={animation === "sport" ? "animate-bounce" : ""} />
                    </button>

                    {!isXR && (
                        <button onClick={handleLaunchAR} title="Démarrer AR" className="bg-[#FFB300] text-[#0b1b2b] p-3 rounded-xl shadow-lg border border-[#FFB300] pointer-events-auto">
                            <Sparkles size={18} />
                        </button>
                    )}
                </div>

                <div className="flex-1 flex justify-center px-2">
                    <div className={`flex items-center justify-center border-2 px-4 py-2 rounded-2xl min-w-[70px] ${
                        currentStatus === 'perfect' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400'
                    }`}>
                        <span className="text-xl font-black">{glucose}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleItemClick('apple')} title="Pomme" className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 pointer-events-auto"><Apple size={16} /></button>
                    <button onClick={() => handleItemClick('insulin')} title="Insuline" className="p-2 bg-blue-500/10 border border-white/10 rounded-lg text-blue-400 pointer-events-auto"><Syringe size={16} /></button>
                    <button onClick={() => handleItemClick('candy')} title="Bonbon" className="p-2 bg-pink-500/10 border border-white/10 rounded-lg text-pink-400 pointer-events-auto"><Candy size={18} /></button>
                </div>
            </div>
        </div>
      </div>

      {/* 2. ZONE D'AFFICHAGE (Relative flex-1) */}
      <div className={`flex-1 relative overflow-hidden transition-colors duration-500 ${isXR ? 'bg-transparent' : 'bg-[#0b1b2b]'}`}>
        <ARScene animationName={animation} modelScale={modelScale} modelRotation={modelRotation} />
        
        {/* Contrôles de transformation (Superposés sur la scène) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[500] pointer-events-auto">
            <button onClick={() => setModelScale(prev => Math.min(prev + 0.2, 3))} className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white pointer-events-auto"><ZoomIn size={20} /></button>
            <button onClick={() => setModelScale(prev => Math.max(prev - 0.2, 0.5))} className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white pointer-events-auto"><ZoomOut size={20} /></button>
            <button onClick={() => setModelRotation(prev => prev + Math.PI / 4)} className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white pointer-events-auto"><RotateCcw size={20} /></button>
        </div>

        {/* Popups de Hamouch */}
        <AnimatePresence>
            {showPopup && (
            <div className="absolute bottom-10 left-6 right-6 z-[600] pointer-events-auto">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-[#0b1b2b] border-2 border-white/20 p-6 rounded-[35px] shadow-2xl relative overflow-hidden">
                    <p className={`text-white leading-relaxed font-black text-sm relative z-10 ${lang === 'ar' ? 'text-right font-arabic' : ''}`}>{gameMessage || (isGreeting ? t('kid.arEdu.greeting') : "")}</p>
                    <button onClick={() => setShowPopup(false)} className="mt-4 w-full bg-white/10 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Continuer</button>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
      </div>

    </div>
  );
}
