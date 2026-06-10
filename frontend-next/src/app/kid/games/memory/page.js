"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Sparkles, Medal } from 'lucide-react';
import api from '@/lib/api';

// Emojis as our content!
const ITEMS = [
    "🍎", "🍌", "🥕", "🥦", "🍇", "🍓", "🍉", "🍒", 
    "🍬", "🍫", "🍩", "🧁", "🍕", "🍔", "🥑", "🌽",
    "🧀", "🥩", "🥞", "🥝", "🍍", "🍆", "🍋", "🍊"
];

// Difficulty levels based on pairs needed
const LEVELS = [
    { level: 1, pairs: 2, xp: 50 },
    { level: 2, pairs: 3, xp: 100 },
    { level: 3, pairs: 4, xp: 150 },
    { level: 4, pairs: 6, xp: 200 },
    { level: 5, pairs: 8, xp: 300 },
    { level: 6, pairs: 10, xp: 400 },
    { level: 7, pairs: 12, xp: 500 },
    { level: 8, pairs: 14, xp: 600 },
    { level: 9, pairs: 16, xp: 800 },
    { level: 10, pairs: 18, xp: 1000 }
];

export default function MemoryGame() {
    const router = useRouter();
    const [currentLevel, setCurrentLevel] = useState(0); // 0-indexed mapped to LEVELS
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const [showLevelComplete, setShowLevelComplete] = useState(false);
    const [totalXP, setTotalXP] = useState(0);

    const initLevel = (levelIndex) => {
        const levelConfig = LEVELS[levelIndex];
        const numPairs = levelConfig.pairs;
        
        // Select random distinct items for the pairs
        const shuffledItems = [...ITEMS].sort(() => 0.5 - Math.random());
        const selectedItems = shuffledItems.slice(0, numPairs);
        
        // Create duplicate pairs and shuffle them
        const levelCards = [...selectedItems, ...selectedItems]
            .sort(() => 0.5 - Math.random())
            .map((item, index) => ({ id: index, content: item }));
            
        setCards(levelCards);
        setFlippedIndices([]);
        setMatchedPairs([]);
        setIsChecking(false);
        setShowLevelComplete(false);
    };

    useEffect(() => {
        initLevel(currentLevel);
    }, [currentLevel]);

    const handleCardClick = (index) => {
        if (isChecking || flippedIndices.includes(index) || matchedPairs.includes(cards[index].content)) {
            return;
        }

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setIsChecking(true);
            const firstCard = cards[newFlipped[0]];
            const secondCard = cards[newFlipped[1]];

            if (firstCard.content === secondCard.content) {
                // Match found!
                setMatchedPairs(prev => [...prev, firstCard.content]);
                setFlippedIndices([]);
                setIsChecking(false);

                // Check if level is complete
                if (matchedPairs.length + 1 === LEVELS[currentLevel].pairs) {
                    handleLevelComplete();
                }
            } else {
                // No match, flip back after delay
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    };

    const handleLevelComplete = async () => {
        setIsChecking(true);
        const gainedXP = LEVELS[currentLevel].xp;
        setTotalXP(prev => prev + gainedXP);
        
        // Optionally update the backend with the new XP
        try {
            const userStore = JSON.parse(localStorage.getItem('user') || '{}');
            if (userStore.id) {
                userStore.xp = (userStore.xp || 0) + gainedXP;
                api.put(`/Users/${userStore.id}`, userStore); // Simulated XP update
                localStorage.setItem('user', JSON.stringify(userStore));
            }
        } catch (err) {
            console.error("Failed to update XP", err);
        }

        setTimeout(() => setShowLevelComplete(true), 1000);
    };

    const nextLevel = () => {
        if (currentLevel < LEVELS.length - 1) {
            setCurrentLevel(prev => prev + 1);
        } else {
            // Player finished all 10 levels !
            alert("Félicitations, tu as terminé tous les niveaux !!");
            router.push('/kid/games');
        }
    };

    // Calculate grid columns based on number of cards
    const getGridCols = (totalCards) => {
        if (totalCards <= 4) return 'grid-cols-2';
        if (totalCards <= 6) return 'grid-cols-3';
        if (totalCards <= 12) return 'grid-cols-4';
        if (totalCards <= 20) return 'grid-cols-5';
        return 'grid-cols-6';
    };

    return (
        <div className="min-h-screen bg-[#0b1b2b] text-white flex flex-col font-sans select-none overflow-x-hidden">
            
            {/* Header / HUD */}
            <div className="p-6 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/10 z-50">
                <button 
                    onClick={() => router.push('/kid/games')} 
                    className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                
                <div className="flex flex-col items-center">
                    <h2 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2">
                        <Sparkles size={16} className="text-[#9C27B0]" />
                        Mémoire Gourmande
                    </h2>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#9C27B0] mt-1">
                        Niveau {currentLevel + 1} / {LEVELS.length}
                    </div>
                </div>

                <div className="bg-[#FFB300] text-black px-4 py-2 rounded-xl font-black text-sm shadow-lg flex items-center gap-2">
                    <Trophy size={16} />
                    {totalXP} XP
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 to-[#0b1b2b] relative">
                
                <div className={`grid gap-3 sm:gap-4 md:gap-5 max-w-4xl w-full mx-auto justify-center ${getGridCols(cards.length)}`}>
                    <AnimatePresence>
                        {cards.map((card, index) => {
                            const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.content);
                            const isMatched = matchedPairs.includes(card.content);
                            
                            return (
                                <motion.div 
                                    key={index}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative preserve-3d cursor-pointer aspect-square w-full min-w-[70px] max-w-[120px]"
                                    onClick={() => handleCardClick(index)}
                                    style={{ perspective: 1000 }}
                                >
                                    <motion.div
                                        className="w-full h-full relative preserve-3d"
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                                    >
                                        {/* FRONT OF CARD (Hidden State) */}
                                        <div 
                                            className="absolute backface-hidden inset-0 bg-gradient-to-br from-[#1c3a5e] to-[#0b1b2b] rounded-2xl border-4 border-white/10 flex items-center justify-center shadow-xl group hover:border-[#9C27B0]/50 transition-colors"
                                        >
                                            {/* Using standard icon for the back to represent the DiaCare logo / theme */}
                                            <div className="opacity-40 group-hover:opacity-80 transition-opacity">
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9C27B0]">
                                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                                                </svg>
                                            </div>
                                        </div>

                                        {/* BACK OF CARD (Revealed State) */}
                                        <div 
                                            className="absolute backface-hidden inset-0 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#9C27B0]"
                                            style={{ transform: "rotateY(180deg)" }}
                                        >
                                            <motion.span 
                                                className={`text-4xl md:text-5xl ${isMatched ? "animate-bounce" : ""}`}
                                            >
                                                {card.content}
                                            </motion.span>
                                            
                                            {isMatched && (
                                                <div className="absolute inset-0 bg-green-500/20 rounded-xl" />
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Level Up Overlay */}
                <AnimatePresence>
                    {showLevelComplete && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.5, opacity: 0, y: -50 }}
                                className="bg-[#0b1b2b] border border-white/20 p-10 rounded-[40px] shadow-[0_0_50px_rgba(156,39,176,0.3)] text-center max-w-sm w-full relative overflow-hidden"
                            >
                                <div className="absolute -top-10 -left-10 text-[#9C27B0] opacity-20">
                                    <Star size={120} />
                                </div>
                                <div className="absolute -bottom-10 -right-10 text-[#FFB300] opacity-20">
                                    <Medal size={120} />
                                </div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-[#9C27B0] rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-12">
                                        <Trophy size={48} className="text-white" />
                                    </div>
                                    
                                    <h2 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Niveau {LEVELS[currentLevel].level} Terminé !</h2>
                                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-6">
                                        Super mémoire ! Continue comme ça.
                                    </p>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 mb-8 flex items-center gap-4">
                                        <span className="text-3xl">🎁</span>
                                        <div className="text-left">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Récompense</div>
                                            <div className="text-xl font-black text-[#FFB300]">+{LEVELS[currentLevel].xp} XP</div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={nextLevel}
                                        className="w-full py-5 bg-[#9C27B0] text-white rounded-3xl font-black uppercase tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(156,39,176,0.4)]"
                                    >
                                        Niveau Suivant 🚀
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
            
            {/* Global style to help with 3D Transforms */}
            <style jsx global>{`
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>
        </div>
    );
}
