"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/LanguageContext';
import { createXRStore } from '@react-three/xr';

// Nouveaux composants découplés
import ModeSelection from '@/components/AR/ModeSelection';
import MagieInterface from '@/components/AR/MagieInterface';
import ARInterface from '@/components/AR/ARInterface';

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
  
  // États Partagés
  const [viewMode, setViewMode] = useState('selection'); // 'selection', 'magie', 'ar'
  const [animation, setAnimation] = useState("greeting");
  const [glucose, setGlucose] = useState(1.00);
  const [showPopup, setShowPopup] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("perfect");
  const [isMounted, setIsMounted] = useState(false);
  const [store, setStore] = useState(null);
  const [candyClicks, setCandyClicks] = useState(0);
  const [gameMessage, setGameMessage] = useState("");
  const [modelScale, setModelScale] = useState(1.3);
  const [modelRotation, setModelRotation] = useState(0);
  const [modelPositionOffset, setModelPositionOffset] = useState({ x: 0, z: 0 });
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

  useEffect(() => {
    if (isMounted && !store) {
      setStore(createXRStore({
        domOverlay: document.getElementById('ar-game-container')
      }));
    }
  }, [isMounted, store]);

  const handleLaunchAR = async () => {
    if (!store) return;
    try {
      setViewMode('ar');
      await store.enterAR();
    } catch (error) {
      console.error("Failed to enter AR:", error);
      setViewMode('selection');
      alert(
        "Impossible de lancer la Réalité Augmentée.\n\n" +
        "Raison probable :\n" +
        "1. Vous n'êtes pas en HTTPS (obligatoire pour WebXR). Utilisez un tunnel (ex: ngrok).\n" +
        "2. Votre navigateur ne supporte pas l'AR (Utilisez Chrome sur Android, WebXR Viewer sur iOS).\n\n" +
        "Détail de l'erreur : " + error.message
      );
    }
  };

  const handleExitAR = async () => {
    if (!store) return;
    try {
      await store.exitAR();
      setViewMode('selection');
    } catch (error) {
      console.error("Failed to exit AR:", error);
      setViewMode('selection');
    }
  };

  // Logique du jeu (Partagée)
  useEffect(() => {
    let interval;
    if (animation === "sport") {
        interval = setInterval(() => {
            setGlucose(prev => {
                const newVal = Number((prev - 0.05).toFixed(2));
                if (newVal < 0.70) {
                    setAnimation("basgl");
                    setCurrentStatus("hypo");
                    setGameMessage(lang === 'ar' ? 'أنا أشعر بالتعب، أحتاج لمساعدة!' : 'Je me sens faible... Aide-moi Hamouch !');
                    setShowPopup(true);
                    handleSpeak(lang === 'ar' ? 'أنا أشعر بالتعب، أحتاج لمساعدة!' : 'Je me sens faible... Aide-moi !');
                    return 0.65;
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
            setGlucose(1.00);
            setAnimation("happyidle");
            setCurrentStatus("perfect");
            setGameMessage(lang === 'ar' ? 
                'أحسنت! في حالة نقص السكر (<0.70)، نحتاج لسكر سريع مثل الحلوى لرفع الطاقة.' : 
                'Bravo ! En hypo (<0.70), il faut du sucre rapide (bonbon) pour remonter l’énergie vite.');
            setCandyClicks(0);
        } else if (item === 'insulin') {
            setGameMessage(lang === 'ar' ? 
                'خطر! الأنسولين يخفض السكر أكثر. في نقص السكر، نحتاج للحلوى وليس الأنسولين.' : 
                'DANGER ! L’insuline baisse encore plus le sucre. En hypo, il faut du sucre, pas d’insuline !');
        } else {
            setGameMessage(lang === 'ar' ? 
                'التفاح صحي، لكنه بطيء. في حالة الطوارئ (<0.70)، الحلوى أسرع!' : 
                'La pomme est saine mais lente. En urgence (<0.70), le bonbon est plus rapide !');
        }
    } else if (item === 'candy') {
        const newClicks = candyClicks + 1;
        setCandyClicks(newClicks);
        const newVal = Number((glucose + 0.40).toFixed(2));
        setGlucose(newVal);
        if (newVal > 1.80) {
            setAnimation("hautegl");
            setCurrentStatus("hyper");
            setGameMessage(lang === 'ar' ? 
                'لقد أكلت الكثير! سكري الآن مرتفع (>1.80). أشعر بالعطش وأحتاج لأنسولين.' : 
                'Trop de sucre ! Je suis en hyper (>1.80). J’ai très soif et besoin d’insuline.');
        } else {
            setGameMessage(lang === 'ar' ? 'مممم حلوى! لكن لا تكثر منها لتجنv الارتفاع.' : 'Miam ! Mais attention à ne pas en abuser pour rester en zone verte.');
        }
    } else if (item === 'insulin') {
        if (glucose > 1.80) {
            setGlucose(1.00);
            setAnimation("happyidle");
            setCurrentStatus("perfect");
            setCandyClicks(0);
            setGameMessage(lang === 'ar' ? 
                'أحسنت! الأنسولين يساعدني على العودة لمنطقة الأمان (0.70-1.30).' : 
                'Parfait ! L’insuline m’aide à revenir dans ma zone de confort (0.70-1.30).');
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

  const handleMove = (direction) => {
    const step = 0.2; // Déplacement de 20cm par clic
    setModelPositionOffset(prev => {
      switch(direction) {
        case 'up': return { ...prev, z: prev.z - step };
        case 'down': return { ...prev, z: prev.z + step };
        case 'left': return { ...prev, x: prev.x - step };
        case 'right': return { ...prev, x: prev.x + step };
        default: return prev;
      }
    });
  };

  useEffect(() => {
    // Vérifier si la session WebXR a été fermée nativement (ex: bouton retour Android)
    let interval;
    if (viewMode === 'ar') {
        interval = setInterval(() => {
            try {
                if (store && store.getState && !store.getState().session) {
                    setViewMode('selection');
                }
            } catch (e) {}
        }, 500);
    }
    return () => clearInterval(interval);
  }, [viewMode]);

  if (!isMounted) return null;

  return (
    <div id="ar-game-container" className={`fixed inset-0 overflow-hidden font-sans select-none z-[9999] transition-colors duration-1000 ${viewMode === 'ar' ? 'bg-transparent pointer-events-none' : 'bg-[#0b1b2b]'}`}>
      
      {/* 1. Écran de Sélection */}
      {viewMode === 'selection' && (
        <div className="pointer-events-auto">
          <ModeSelection 
            onSelect={(mode) => mode === 'ar' ? handleLaunchAR() : setViewMode('magie')} 
            onBack={() => window.history.back()} 
          />
        </div>
      )}

      {/* 2. Scène 3D (Toujours montée en arrière-plan pour éviter la perte de contexte WebGL) */}
      <div className="fixed inset-0 pointer-events-none">
        {store && <ARScene store={store} animationName={animation} modelScale={modelScale} modelRotation={modelRotation} modelPositionOffset={modelPositionOffset} isARMode={viewMode === 'ar'} />}
        
        {/* Interface MAGIE */}
        {viewMode === 'magie' && (
          <div className="absolute inset-0 z-[100] pointer-events-auto">
          <MagieInterface 
            glucose={glucose}
            currentStatus={currentStatus}
            animation={animation}
            setAnimation={setAnimation}
            onItemClick={handleItemClick}
            onBack={() => setViewMode('selection')}
            onZoomIn={() => setModelScale(prev => Math.min(prev + 0.2, 3))}
            onZoomOut={() => setModelScale(prev => Math.max(prev - 0.2, 0.5))}
            onRotate={() => setModelRotation(prev => prev + Math.PI / 4)}
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            gameMessage={gameMessage || (isGreeting ? t('kid.arEdu.greeting') : "")}
            t={t}
            lang={lang}
            handleSpeak={handleSpeak}
          />
        </div>
        )}

        {/* Interface AR */}
        {viewMode === 'ar' && (
          <div className="absolute inset-0 z-[1000] pointer-events-auto">
            <ARInterface 
              glucose={glucose}
              currentStatus={currentStatus}
              animation={animation}
              setAnimation={setAnimation}
              onItemClick={handleItemClick}
              onExit={handleExitAR}
              onZoomIn={() => setModelScale(prev => Math.min(prev + 0.2, 3))}
              onZoomOut={() => setModelScale(prev => Math.max(prev - 0.2, 0.5))}
              onRotate={() => setModelRotation(prev => prev + Math.PI / 4)}
              onMove={handleMove}
              showPopup={showPopup}
              setShowPopup={setShowPopup}
              gameMessage={gameMessage || (isGreeting ? t('kid.arEdu.greeting') : "")}
              t={t}
              lang={lang}
              handleSpeak={handleSpeak}
            />
          </div>
        )}
      </div>

    </div>
  );
}
