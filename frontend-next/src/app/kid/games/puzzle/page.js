"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutGrid, ChevronLeft, Lock, Trophy, 
    Star, Lightbulb, Play, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const LEVELS = [
    { id: 1, rows: 2, cols: 2, xp: 100, image: "https://loremflickr.com/600/600/balanced,diet,kids?lock=1", tip: "Une bonne alimentation est la base de ta force !" },
    { id: 2, rows: 2, cols: 2, xp: 150, image: "https://loremflickr.com/600/600/fruit,apple,banana,orange?lock=2", tip: "Les fruits comme les pommes et les bananes sont tes amis." },
    { id: 3, rows: 2, cols: 3, xp: 200, image: "https://loremflickr.com/600/600/vegetables,carrot,broccoli?lock=3", tip: "Les carottes et le brocoli te donnent des super-pouvoirs." },
    { id: 4, rows: 2, cols: 3, xp: 250, image: "https://loremflickr.com/600/600/healthy,plate,meal?lock=4", tip: "Une assiette équilibrée, c'est un peu de tout pour être en forme !" },
    { id: 5, rows: 3, cols: 3, xp: 300, image: "https://loremflickr.com/600/600/vegetables,organic?lock=5", tip: "Les légumes sont essentiels pour ta croissance !" },
    { id: 6, rows: 3, cols: 3, xp: 350, image: "https://loremflickr.com/600/600/candy,sweets?lock=6", tip: "Les bonbons ? Oui, mais seulement avec l'accord de tes parents !" },
    { id: 7, rows: 3, cols: 4, xp: 400, image: "https://loremflickr.com/600/600/fruit,platter,table?lock=7", tip: "Manger des fruits variés t'apporte plein de vitamines !" },
    { id: 8, rows: 3, cols: 4, xp: 450, image: "/images/level8.png", tip: "Tu es courageux ! Prendre ton insuline te permet d'être un super-champion." },
    { id: 9, rows: 4, cols: 4, xp: 500, image: "https://loremflickr.com/600/600/running,park?lock=9", tip: "Courir dans le parc est excellent pour ton cœur." },
    { id: 10, rows: 4, cols: 4, xp: 550, image: "https://loremflickr.com/600/600/soccer,football?lock=10", tip: "Le football t'aide à brûler le sucre comme un vrai pro." },
    { id: 11, rows: 4, cols: 5, xp: 600, image: "https://loremflickr.com/600/600/bicycle?lock=11", tip: "Le vélo est une aventure géniale pour rester en santé !" },
    { id: 12, rows: 5, cols: 5, xp: 1000, image: "https://loremflickr.com/600/600/celebration,kids?lock=12", tip: "Bravo ! Tu es maintenant un véritable expert DiaCare !" },
];

export default function PuzzleGame() {
    const { t, lang } = useLanguage();
    const router = useRouter();
    
    // Game State
    const [currentLevel, setCurrentLevel] = useState(null);
    const [unlockedLevels, setUnlockedLevels] = useState([1]);
    const [completedLevels, setCompletedLevels] = useState([]);
    const [totalScore, setTotalScore] = useState(0);
    
    // Puzzle Logic
    const [pieces, setPieces] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isWon, setIsWon] = useState(false);

    // Load progress
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('puzzleProgress') || '{"unlocked":[1], "completed":[], "score":0}');
        setUnlockedLevels(saved.unlocked);
        setCompletedLevels(saved.completed);
        setTotalScore(saved.score);
    }, []);

    // Save progress
    const saveProgress = (newUnlocked, newCompleted, newScore) => {
        localStorage.setItem('puzzleProgress', JSON.stringify({
            unlocked: newUnlocked,
            completed: newCompleted,
            score: newScore
        }));
    };

    const shuffle = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    const initPuzzle = (level) => {
        const total = level.rows * level.cols;
        const newPieces = [];
        for (let i = 0; i < total; i++) {
            newPieces.push({
                id: i,
                correctPos: i,
                currentPos: i
            });
        }
        
        let shuffled;
        // Ensure it's not solved from the start
        do {
            shuffled = shuffle(newPieces.map(p => p.id));
        } while (shuffled.every((id, idx) => id === idx));

        setPieces(newPieces.map((p, idx) => ({ ...p, currentPos: shuffled.indexOf(p.id) })));
        setIsWon(false);
        setSelectedId(null);
        setCurrentLevel(level);
    };

    const handlePieceClick = (id) => {
        if (isWon) return;

        if (selectedId === null) {
            setSelectedId(id);
        } else {
            if (selectedId === id) {
                setSelectedId(null);
                return;
            }

            // Swap positions with immutable update
            setPieces(prev => {
                const p1 = prev.find(p => p.id === selectedId);
                const p2 = prev.find(p => p.id === id);
                
                const nextPieces = prev.map(p => {
                    if (p.id === selectedId) return { ...p, currentPos: p2.currentPos };
                    if (p.id === id) return { ...p, currentPos: p1.currentPos };
                    return p;
                });

                // Check win condition on the new array
                const won = nextPieces.every(p => p.id === p.currentPos);
                if (won) {
                    handleWin();
                }

                return nextPieces;
            });
            setSelectedId(null);
        }
    };

    const handleWin = () => {
        setIsWon(true);
        
        const isNewCompletion = !completedLevels.includes(currentLevel.id);
        let newScore = totalScore;
        let newCompleted = [...completedLevels];
        let newUnlocked = [...unlockedLevels];

        if (isNewCompletion) {
            newScore += currentLevel.xp;
            newCompleted.push(currentLevel.id);
            if (currentLevel.id < 12 && !unlockedLevels.includes(currentLevel.id + 1)) {
                newUnlocked.push(currentLevel.id + 1);
            }
            
            setTotalScore(newScore);
            setCompletedLevels(newCompleted);
            setUnlockedLevels(newUnlocked);
            saveProgress(newUnlocked, newCompleted, newScore);
        }
    };

    return (
        <DashboardLayout role="Enfant">
            <div className="min-h-screen pb-32 max-w-5xl mx-auto px-6 pt-10 text-white">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
                    <button 
                        onClick={() => currentLevel ? setCurrentLevel(null) : router.push('/kid/games')}
                        className="p-3 md:p-4 bg-white/5 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all self-start md:self-auto"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-black uppercase tracking-widest text-[9px] md:text-[10px]">Retour</span>
                    </button>
                    
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-center">
                            Puzzle <span className="text-[#FFB300]">Champion</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Star size={14} className="text-[#FFB300] fill-[#FFB300]" />
                            <span className="text-[10px] font-black uppercase text-white/40">{completedLevels.length} / 12 Niveaux</span>
                        </div>
                    </div>

                    <div className="bg-[#FF9500] text-black px-4 md:px-6 py-2 md:py-3 rounded-2xl font-black shadow-xl flex items-center gap-3">
                        <Trophy size={18} md:size={20} />
                        <span className="text-lg md:text-xl">{totalScore}</span>
                    </div>
                </div>

                {!currentLevel ? (
                    /* Level Selection */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {LEVELS.map((level) => {
                            const isUnlocked = unlockedLevels.includes(level.id);
                            const isCompleted = completedLevels.includes(level.id);

                            return (
                                <motion.button
                                    key={level.id}
                                    whileHover={isUnlocked ? { scale: 1.05, rotate: 2 } : {}}
                                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                                    disabled={!isUnlocked}
                                    onClick={() => initPuzzle(level)}
                                    className={cn(
                                        "relative h-48 rounded-[40px] overflow-hidden border-4 transition-all flex flex-col items-center justify-center gap-3 shadow-2xl group",
                                        isUnlocked 
                                            ? "bg-white/5 border-white/10 cursor-pointer" 
                                            : "bg-black/40 border-white/5 cursor-not-allowed grayscale",
                                        isCompleted && "border-[#34C759]"
                                    )}
                                >
                                    <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${level.image})` }} />
                                    
                                    <div className={cn(
                                        "relative z-10 w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black",
                                        isUnlocked ? "bg-[#FFB300] text-black" : "bg-white/10 text-white/20"
                                    )}>
                                        {isUnlocked ? level.id : <Lock size={24} />}
                                    </div>
                                    
                                    <div className="relative z-10 text-center">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[#FFB300]">
                                            {level.rows}x{level.cols} Pieces
                                        </div>
                                        {isCompleted && (
                                            <div className="flex items-center justify-center gap-1 text-[#34C759] mt-1">
                                                <CheckCircle2 size={12} />
                                                <span className="text-[10px] font-bold uppercase">Terminé</span>
                                            </div>
                                        )}
                                    </div>

                                    {!isUnlocked && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                            <Lock size={32} className="text-white/20" />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                ) : (
                    /* Game Interaction */
                    <div className="flex flex-col items-center">
                        <div className="mb-8 text-center flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                             <LayoutGrid size={18} className="text-[#FFB300]" />
                             <span className="text-sm font-black uppercase tracking-widest">Niveau {currentLevel.id} • {currentLevel.rows * currentLevel.cols} Pièces</span>
                        </div>

                        <div 
                            className="bg-white/5 p-4 rounded-[40px] shadow-2xl border-4 border-white/10 relative"
                            style={{ 
                                display: 'grid', 
                                gridTemplateColumns: `repeat(${currentLevel.cols}, 1fr)`,
                                gridTemplateRows: `repeat(${currentLevel.rows}, 1fr)`,
                                gap: '8px',
                                width: 'min(90vw, 500px)',
                                aspectRatio: `${currentLevel.cols} / ${currentLevel.rows}`
                            }}
                        >
                            {/* The pieces will be positioned according to their currentPos */}
                            {Array.from({ length: currentLevel.rows * currentLevel.cols }).map((_, slotIdx) => {
                                const piece = pieces.find(p => p.currentPos === slotIdx);
                                if (!piece) return null;

                                // Calculate background position for each piece
                                const row = Math.floor(piece.id / currentLevel.cols);
                                const col = piece.id % currentLevel.cols;
                                const bgPosX = (col / (currentLevel.cols - 1)) * 100;
                                const bgPosY = (row / (currentLevel.rows - 1)) * 100;

                                return (
                                    <motion.div
                                        key={piece.id}
                                        layout
                                        onClick={() => handlePieceClick(piece.id)}
                                        className={cn(
                                            "relative rounded-xl cursor-pointer overflow-hidden border-2 transition-all h-full min-h-[80px] bg-white/5",
                                            selectedId === piece.id ? "border-[#FFB300] scale-95 shadow-[0_0_20px_rgba(255,179,0,0.5)] z-20" : "border-white/20 hover:border-white/40",
                                            isWon && "border-transparent"
                                        )}
                                        style={{
                                            backgroundImage: `url(${currentLevel.image})`,
                                            backgroundSize: `${currentLevel.cols * 100}% ${currentLevel.rows * 100}%`,
                                            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                                        }}
                                    >
                                        {!isWon && (
                                            <div className="absolute bottom-1 right-2 text-[8px] font-black text-white/20">
                                                {piece.id + 1}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="mt-12 flex gap-4">
                            <button 
                                onClick={() => initPuzzle(currentLevel)}
                                className="px-8 py-4 bg-white/5 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[11px]"
                            >
                                <RefreshCw size={18} /> Recommencer
                            </button>
                        </div>
                    </div>
                )}

                {/* Win Modal */}
                <AnimatePresence>
                    {(isWon && currentLevel) && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                            <motion.div 
                                initial={{ scale: 0.8, y: 20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                className="bg-[#0b1b2b] border-2 border-[#34C759]/30 p-10 rounded-[60px] shadow-3xl text-center max-w-md w-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-[#34C759]" />
                                
                                <div className="w-24 h-24 bg-[#34C759] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(52,199,89,0.4)]">
                                    <CheckCircle2 size={50} className="text-white" />
                                </div>
                                
                                <h2 className="text-4xl font-black italic uppercase italic tracking-tighter mb-2">Gagné !</h2>
                                <p className="text-xs font-black uppercase tracking-widest text-[#34C759] mb-8">Niveau {currentLevel.id} Complété</p>
                                
                                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 mb-10 text-left relative overflow-hidden">
                                     <div className="absolute top-2 right-4 opacity-10">
                                        <Lightbulb size={60} />
                                     </div>
                                     <h4 className="flex items-center gap-2 text-[#FFB300] font-black uppercase text-[10px] tracking-widest mb-3">
                                        <Star size={12} fill="currentColor" /> Le Conseil de DiaPote
                                     </h4>
                                     <p className="text-sm font-bold leading-relaxed">{currentLevel.tip}</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {currentLevel.id < 12 && (
                                        <button 
                                            onClick={() => initPuzzle(LEVELS[currentLevel.id])}
                                            className="w-full py-5 bg-[#34C759] text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 transition-all"
                                        >
                                            Niveau Suivant <ChevronLeft size={18} className="rotate-180 inline ml-2" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setCurrentLevel(null)}
                                        className="w-full py-5 bg-white/5 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
                                    >
                                        Retour aux Niveaux
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
}
