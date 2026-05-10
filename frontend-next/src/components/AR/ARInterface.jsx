"use client";

import React, { useRef } from 'react';
import { X, Apple, Syringe, Candy, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ARInterface = ({ 
  glucose, 
  currentStatus, 
  animation, 
  setAnimation, 
  onItemClick, 
  onExit,
  onZoomIn,
  onZoomOut,
  onRotate,
  onMove,
  onMoveDelta,
  onScaleRotateAbsolute,
  currentScale,
  currentRotation,
  showPopup,
  setShowPopup,
  gameMessage,
  t,
  lang,
  handleSpeak
}) => {
  const touchRef = useRef({
    fingers: 0,
    lastPanX: 0,
    lastPanY: 0,
    startDist: 0,
    startAngle: 0,
    baseScale: 1,
    baseRotation: 0,
  });

  const handleTouchStart = (e) => {
    if (e.target.closest('button')) return; // Ne pas bloquer les boutons
    if (e.touches.length === 1) {
      touchRef.current.fingers = 1;
      touchRef.current.lastPanX = e.touches[0].clientX;
      touchRef.current.lastPanY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      touchRef.current.fingers = 2;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current.startDist = Math.sqrt(dx * dx + dy * dy);
      touchRef.current.startAngle = Math.atan2(dy, dx);
      touchRef.current.baseScale = currentScale || 1.3;
      touchRef.current.baseRotation = currentRotation || 0;
    }
  };

  const handleTouchMove = (e) => {
    if (e.target.closest('button')) return;
    
    if (e.touches.length === 1 && touchRef.current.fingers === 1) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      
      // 1 doigt: rotation horizontale, déplacement vertical
      const deltaX = (clientX - touchRef.current.lastPanX) * 0.01;
      const deltaY = (clientY - touchRef.current.lastPanY) * 0.01;
      
      if (onScaleRotateAbsolute) {
         onScaleRotateAbsolute(currentScale, currentRotation + deltaX);
      }
      if (onMoveDelta) {
         // Déplacer d'avant en arrière
         onMoveDelta(0, deltaY * 2);
      }
      
      touchRef.current.lastPanX = clientX;
      touchRef.current.lastPanY = clientY;
    } else if (e.touches.length === 2 && touchRef.current.fingers === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const scaleFactor = dist / (touchRef.current.startDist || 1);
      
      if (onScaleRotateAbsolute) {
        onScaleRotateAbsolute(
          touchRef.current.baseScale * scaleFactor,
          touchRef.current.baseRotation
        );
      }
    }
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col pointer-events-auto p-6 z-[1000]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Top Bar - Responsive with Avatar */}
      <div className="flex flex-wrap items-center justify-between pointer-events-auto mt-4 sm:mt-8 gap-3">
        <button 
          onClick={onExit}
          className="p-3 sm:p-4 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white active:scale-95 transition-all"
        >
          <X className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Bloc Avatar Hamouch - Taille adaptable */}
        <div className="flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md p-2 sm:p-3 pr-4 sm:pr-8 rounded-full border border-white/10 shadow-2xl">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center overflow-hidden bg-gradient-to-br ${
                currentStatus === 'perfect' ? 'border-green-500 from-green-500/20 to-green-900/40' : 'border-red-500 from-red-500/20 to-red-900/40'
            }`}>
                <span className="text-xl sm:text-2xl">👦</span>
            </div>
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-black text-white/50 uppercase tracking-widest">Hamouch</span>
                    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse ${currentStatus === 'perfect' ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
                <div className="flex items-baseline gap-1">
                    <span className={`text-xl sm:text-3xl font-black leading-none ${currentStatus === 'perfect' ? 'text-green-400' : 'text-red-400'}`}>
                        {glucose.toFixed(2)}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-white/30 tracking-tighter ml-1">g/L</span>
                </div>
            </div>
        </div>

        <button 
          onClick={() => { 
            if (animation === "sport") { setAnimation("happyidle"); } 
            else { setAnimation("sport"); handleSpeak(lang === 'ar' ? 'قبل ممارسة الرياضة، تحقق من نسبة السكر في دمك!' : 'Avant de faire du sport, vérifie ta glycémie !'); }
          }}
          className={`p-3 sm:p-4 rounded-full border backdrop-blur-md transition-all active:scale-95 ${animation === "sport" ? "bg-[#FFB300] text-[#0b1b2b] border-[#FFB300] shadow-[0_0_20px_rgba(255,179,0,0.6)]" : "bg-black/40 text-white border-white/20"}`}
        >
          <Dumbbell className={`w-6 h-6 sm:w-7 sm:h-7 ${animation === "sport" ? "animate-bounce" : ""}`} />
        </button>
      </div>

      {/* Floating Actions (Right Side) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 pointer-events-auto z-10">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onItemClick('apple')} className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-green-400 shadow-2xl"><Apple size={32} /></motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onItemClick('insulin')} className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-blue-400 shadow-2xl"><Syringe size={32} /></motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onItemClick('candy')} className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-pink-400 shadow-2xl"><Candy size={32} /></motion.button>
      </div>

      {/* Les contrôles manuels par boutons sont retirés car remplacés par les gestes tactiles sur l'écran */}

      {/* Bubble Message (Bottom) */}
      <AnimatePresence>
        {showPopup && (
          <div className="mt-auto mb-12 pointer-events-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black/60 backdrop-blur-xl border border-white/20 p-6 rounded-[30px] relative"
            >
                {/* Arrow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/60 rotate-45 border-r border-b border-white/20" />
                
                <p className={`text-white text-center font-bold ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {gameMessage}
                </p>
                <button 
                    onClick={() => setShowPopup(false)}
                    className="mt-4 w-full py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/20 transition-colors"
                >
                    Fermer
                </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ARInterface;
