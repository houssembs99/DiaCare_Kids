"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Sparkles, Medal, Play, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// Expanded Emojis for more levels!
const ITEMS = [
    "🍎", "🍌", "🥕", "🥦", "🍇", "🍓", "🍉", "🍒", 
    "🍬", "🍫", "🍩", "🧁", "🍕", "🍔", "🥑", "🌽",
    "🧀", "🥩", "🥞", "🥝", "🍍", "🍆", "🍋", "🍊",
    "🍟", "🌭", "🥨", "🍿", "🥟", "🍣", "🍦", "🍧", 
    "🥜", "🌰", "🍯", "🥐", "🍝", "🍜", "🍞", "🧀"
];

// Difficulty levels based on pairs needed (15 levels)
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
    { level: 10, pairs: 18, xp: 1000 },
    { level: 11, pairs: 20, xp: 1200 },
    { level: 12, pairs: 22, xp: 1500 },
    { level: 13, pairs: 24, xp: 1800 },
    { level: 14, pairs: 28, xp: 2200 },
    { level: 15, pairs: 30, xp: 3000 }
];

export default function MemoryGame() {
    const router = useRouter();
    const [view, setView] = useState('levels'); // 'levels' | 'playing'
    const [currentLevel, setCurrentLevel] = useState(0); // 0-indexed mapped to LEVELS
    const [unlockedLevels, setUnlockedLevels] = useState(1); // Number of unlocked levels
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const [showLevelComplete, setShowLevelComplete] = useState(false);
    const [totalXP, setTotalXP] = useState(0);

    // Initialize progress from localStorage
    useEffect(() => {
        const savedProgress = localStorage.getItem('memoryGameProgress');
        if (savedProgress) {
            setUnlockedLevels(parseInt(savedProgress, 10));
        }
        
        const userStore = JSON.parse(localStorage.getItem('user') || '{}');
        if (userStore.xp) {
            setTotalXP(userStore.xp);
        }
    }, []);

    const startLevel = (levelIndex) => {
        setCurrentLevel(levelIndex);
        initLevel(levelIndex);
        setView('playing');
    };

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
        
        // Unlock next level logic
        const nextLevelNumber = currentLevel + 2; 
        if (nextLevelNumber > unlockedLevels && nextLevelNumber <= LEVELS.length) {
            setUnlockedLevels(nextLevelNumber);
            localStorage.setItem('memoryGameProgress', nextLevelNumber.toString());
        }

        // Add XP
        try {
            const userStore = JSON.parse(localStorage.getItem('user') || '{}');
            if (userStore.id) {
                userStore.xp = (userStore.xp || 0) + gainedXP;
                setTotalXP(userStore.xp);
                api.put(`/Users/${userStore.id}`, userStore); // Simulated XP update
                localStorage.setItem('user', JSON.stringify(userStore));
            } else {
                setTotalXP(prev => prev + gainedXP);
            }
        } catch (err) {
            console.error("Failed to update XP", err);
            setTotalXP(prev => prev + gainedXP);
        }

        setTimeout(() => setShowLevelComplete(true), 1000);
    };

    const nextLevel = () => {
        if (currentLevel < LEVELS.length - 1) {
            startLevel(currentLevel + 1);
        } else {
            // Player finished all levels !
            alert("Félicitations, tu as terminé tous les niveaux !!");
            setView('levels');
        }
    };

    // Calculate grid columns based on number of cards
    const getGridCols = (totalCards) => {
        if (totalCards <= 4) return 'grid-cols-2';
        if (totalCards <= 6) return 'grid-cols-3';
        if (totalCards <= 12) return 'grid-cols-4';
        if (totalCards <= 20) return 'grid-cols-5';
        if (totalCards <= 30) return 'grid-cols-6';
        return 'grid-cols-8';
    };

    const renderLevelSelection = () => (
        <div className="flex-1 overflow-y-auto px-6 py-10 no-scrollbar relative min-h-full">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="w-24 h-24 bg-[#9C27B0] rounded-[32px] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl rotate-3">
                        <Sparkles size={48} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">Sélection du <span className="text-[#FFB300]">Niveau</span></h1>
                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest">Choisis un niveau pour entraîner ta mémoire</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {LEVELS.map((col, idx) => {
                        const isUnlocked = idx < unlockedLevels;
                        return (
                            <motion.button
                                key={idx}
                                whileHover={isUnlocked ? { scale: 1.05 } : {}}
                                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                                onClick={() => isUnlocked && startLevel(idx)}
                                className={cn(
                                    "aspect-square rounded-3xl flex flex-col items-center justify-center p-4 relative group transition-all",
                                    isUnlocked 
                                        ? "bg-white/5 border border-white/20 hover:border-[#9C27B0] hover:bg-white/10 shadow-xl cursor-pointer" 
                                        : "bg-black/20 border border-white/5 opacity-50 cursor-not-allowed grayscale"
                                )}
                            >
                                <div className="text-3xl font-black italic mb-2 tracking-tighter">
                                    {isUnlocked ? idx + 1 : <Lock size={24} className="text-white/40" />}
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-center">
                                    {col.pairs * 2} Cartes
                                </div>
                                
                                {isUnlocked && (
                                    <div className="absolute -bottom-3 bg-[#FFB300] text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        Démarrer
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderGame = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 to-[#0b1b2b] relative">
            <div className={`grid gap-3 sm:gap-4 md:gap-5 max-w-5xl w-full mx-auto justify-center ${getGridCols(cards.length)}`}>
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
                                className="relative preserve-3d cursor-pointer aspect-square w-full min-w-[50px] max-w-[120px]"
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
                                        className="absolute backface-hidden inset-0 bg-white rounded-2xl border-4 border-white/10 flex items-center justify-center shadow-xl group hover:border-[#9C27B0]/50 transition-colors overflow-hidden"
                                    >
                                        <img 
                                            src="/logo.png" 
                                            alt="DiaCare Logo" 
                                            className="w-2/3 h-2/3 object-contain opacity-80 group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                // Fallback if logo.png is not found
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#9C27B0]"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
                                            }}
                                        />
                                    </div>

                                    {/* BACK OF CARD (Revealed State) */}
                                    <div 
                                        className="absolute backface-hidden inset-0 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#9C27B0]"
                                        style={{ transform: "rotateY(180deg)" }}
                                    >
                                        <motion.span 
                                            className={`text-3xl sm:text-4xl md:text-5xl ${isMatched ? "animate-bounce" : ""}`}
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
                            <div className="absolute -top-10 -left-10 text-[#9C27B0] opacity-20"><Star size={120} /></div>
                            <div className="absolute -bottom-10 -right-10 text-[#FFB300] opacity-20"><Medal size={120} /></div>

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
                                
                                <div className="flex gap-4 w-full">
                                    <button 
                                        onClick={() => setView('levels')}
                                        className="flex-1 py-5 bg-white/10 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-white/20 transition-all text-[10px]"
                                    >
                                        Menu
                                    </button>
                                    <button 
                                        onClick={nextLevel}
                                        className="flex-1 py-5 bg-[#9C27B0] text-white rounded-3xl font-black uppercase tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(156,39,176,0.4)] text-[10px]"
                                    >
                                        Suivant 🚀
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0b1b2b] text-white flex flex-col font-sans select-none overflow-x-hidden">
            
            {/* Header / HUD */}
            <div className="p-6 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/10 z-50">
                <button 
                    onClick={() => {
                        if (view === 'playing') setView('levels');
                        else router.push('/kid/games');
                    }} 
                    className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                
                <div className="flex flex-col items-center">
                    <h2 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2">
                        <Sparkles size={16} className="text-[#9C27B0]" />
                        Mémoire Gourmande
                    </h2>
                    {view === 'playing' && (
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#9C27B0] mt-1">
                            Niveau {currentLevel + 1} / {LEVELS.length}
                        </div>
                    )}
                </div>

                <div className="bg-[#FFB300] text-black px-4 py-2 rounded-xl font-black text-sm shadow-lg flex items-center gap-2">
                    <Trophy size={16} />
                    {totalXP} XP
                </div>
            </div>

            {/* Dynamic View */}
            {view === 'levels' ? renderLevelSelection() : renderGame()}
            
            {/* Global style to help with 3D Transforms */}
            <style jsx global>{`
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>
        </div>
    );
}
