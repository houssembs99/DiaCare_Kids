"use client";

import React from 'react';
import { Sparkles, Box, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ModeSelection = ({ onSelect, onBack }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-[#0b1b2b] flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12 mt-8">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tight">Espace AR</h1>
          <p className="text-white/40 text-sm font-medium">Choisis ton aventure avec Hamouch</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 justify-center max-w-md mx-auto w-full">
        {/* Card Magie 3D */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('magie')}
          className="relative group overflow-hidden bg-gradient-to-br from-blue-600/20 to-indigo-900/40 border-2 border-blue-500/30 rounded-[40px] p-8 text-left transition-all hover:border-blue-400/60 shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Box size={120} className="text-blue-400" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40">
              <Box size={28} className="text-white" />
            </div>
            <h2 className="text-white text-2xl font-black mb-2 uppercase italic">Magie 3D</h2>
            <p className="text-blue-100/60 text-sm leading-relaxed">
              Interagis avec Hamouch dans son monde virtuel. Idéal pour s'entraîner !
            </p>
          </div>
          <div className="mt-8 flex items-center text-blue-400 font-black text-xs uppercase tracking-widest">
            Entrer dans la chambre →
          </div>
        </motion.button>

        {/* Card Mode AR */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('ar')}
          className="relative group overflow-hidden bg-gradient-to-br from-[#FFB300]/20 to-[#FF8F00]/40 border-2 border-[#FFB300]/30 rounded-[40px] p-8 text-left transition-all hover:border-[#FFB300]/60 shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={120} className="text-[#FFB300]" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-[#FFB300] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#FFB300]/40">
              <Sparkles size={28} className="text-[#0b1b2b]" />
            </div>
            <h2 className="text-white text-2xl font-black mb-2 uppercase italic">Réalité Augmentée</h2>
            <p className="text-[#FFB300]/60 text-sm leading-relaxed">
              Fais apparaître Hamouch dans ta chambre avec ta caméra !
            </p>
          </div>
          <div className="mt-8 flex items-center text-[#FFB300] font-black text-xs uppercase tracking-widest">
            Lancer la caméra →
          </div>
        </motion.button>
      </div>

      <div className="mt-auto py-8 text-center">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">DiaCare Kids • Module AR Premium</p>
      </div>
    </div>
  );
};

export default ModeSelection;
