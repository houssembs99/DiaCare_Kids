"use client";

import React from 'react';
import { ChevronLeft, Apple, Syringe, Candy, Dumbbell, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MagieInterface = ({ 
  glucose, 
  currentStatus, 
  animation, 
  setAnimation, 
  onItemClick, 
  onBack, 
  onZoomIn, 
  onZoomOut, 
  onRotate,
  showPopup,
  setShowPopup,
  gameMessage,
  t,
  lang,
  handleSpeak
}) => {
  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none">
      {/* Barre de Status - Design Magie (Fond bleu nuit) */}
      <div className="p-6 pt-12 bg-gradient-to-b from-[#0b1b2b] to-transparent pointer-events-auto">
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[30px] shadow-2xl">
          <button 
            onClick={onBack}
            className="p-4 bg-white/10 rounded-2xl text-white"
          >
            <ChevronLeft size={24} />
          </button>

          <div className={`flex flex-col items-center px-8 py-3 rounded-2xl border-2 ${
            currentStatus === 'perfect' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400'
          }`}>
            <span className="text-[10px] uppercase font-black tracking-widest opacity-50">Glycémie (g/L)</span>
            <span className="text-3xl font-black">{glucose.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => onItemClick('apple')} title="Pomme" className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 hover:bg-green-500/20 transition-colors"><Apple size={22} /></button>
            <button onClick={() => onItemClick('insulin')} title="Insuline" className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-colors"><Syringe size={22} /></button>
            <button onClick={() => onItemClick('candy')} title="Bonbon" className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400 hover:bg-pink-500/20 transition-colors"><Candy size={22} /></button>
            
            <div className="w-px h-10 bg-white/10 mx-1" /> {/* Séparateur */}

            <button 
                onClick={() => { 
                    if (animation === "sport") { setAnimation("happyidle"); } 
                    else { setAnimation("sport"); handleSpeak(t('kid.arEdu.sportDesc')); }
                }}
                className={`p-4 rounded-xl border transition-all ${animation === "sport" ? "bg-[#FFB300] text-[#0b1b2b] border-[#FFB300] shadow-[0_0_20px_rgba(255,179,0,0.4)]" : "bg-white/5 text-white border-white/10"}`}
            >
                <Dumbbell size={22} className={animation === "sport" ? "animate-bounce" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Contrôles 3D (À droite) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-5 pointer-events-auto">
        <button onClick={onZoomIn} className="p-5 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-2xl text-white shadow-xl"><ZoomIn size={26} /></button>
        <button onClick={onZoomOut} className="p-5 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-2xl text-white shadow-xl"><ZoomOut size={26} /></button>
        <button onClick={onRotate} className="p-5 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-2xl text-white shadow-xl"><RotateCcw size={26} /></button>
      </div>

      {/* Popups */}
      <AnimatePresence>
        {showPopup && (
          <div className="absolute inset-0 bg-[#0b1b2b]/60 backdrop-blur-sm flex items-end p-6 pointer-events-auto z-[1001]">
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }} 
              className="w-full bg-[#162a3d] border-t-4 border-blue-500 p-8 rounded-[40px] shadow-2xl"
            >
              <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full shrink-0 flex items-center justify-center font-black text-white">H</div>
                <p className={`text-white leading-relaxed font-bold text-lg ${lang === 'ar' ? 'text-right font-arabic' : ''}`}>
                    {gameMessage}
                </p>
              </div>
              <button 
                onClick={() => setShowPopup(false)} 
                className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/40"
              >
                J'ai compris !
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MagieInterface;
