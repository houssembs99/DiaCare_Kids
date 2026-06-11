"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, X, Trophy, Heart, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGAR_TYPES = ["🍭", "🍬", "🍫", "🍩", "🧁", "🍰"];

export default function InsulinCombatGame() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(3);
    const [isStarted, setIsStarted] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [sugars, setSugars] = useState([]);
    const [zaps, setZaps] = useState([]);
    const gameAreaRef = useRef(null);

    const spawnSugar = useCallback(() => {
        if (!isStarted || isGameOver) return;
        const newSugar = {
            id: Math.random(),
            x: Math.random() * 0.80 + 10, // 10% to 90%
            y: -10,
            type: SUGAR_TYPES[Math.floor(Math.random() * SUGAR_TYPES.length)],
            speed: 0.5 + Math.random() * 1.5 + (score / 200) // Increase speed with score
        };
        setSugars(prev => [...prev, newSugar]);
    }, [isStarted, isGameOver, score]);

    useEffect(() => {
        let timer;
        if (isStarted && !isGameOver) {
            timer = setInterval(spawnSugar, 1500 - Math.min(1000, score * 5));
        }
        return () => clearInterval(timer);
    }, [isStarted, isGameOver, spawnSugar, score]);

    const updateGame = useCallback(() => {
        if (!isStarted || isGameOver) return;

        setSugars(prev => {
            const next = [];
            for (let s of prev) {
                const newY = s.y + s.speed;
                if (newY > 100) {
                    setHealth(h => {
                        if (h <= 1) setIsGameOver(true);
                        return h - 1;
                    });
                } else {
                    next.push({ ...s, y: newY });
                }
            }
            return next;
        });

        // Clean up zaps
        setZaps(prev => prev.filter(z => Date.now() - z.time < 500));

        requestAnimationFrame(updateGame);
    }, [isStarted, isGameOver]);

    useEffect(() => {
        if (isStarted && !isGameOver) {
            const anim = requestAnimationFrame(updateGame);
            return () => cancelAnimationFrame(anim);
        }
    }, [isStarted, isGameOver, updateGame]);

    const handleSugarClick = (id, x, y) => {
        if (!isStarted || isGameOver) return;
        
        // Add zap animation
        setZaps(prev => [...prev, { id: Math.random(), x, y, time: Date.now() }]);
        
        // Remove sugar
        setSugars(prev => prev.filter(s => s.id !== id));
        setScore(prev => prev + 10);
    };

    const startGame = () => {
        setScore(0);
        setHealth(3);
        setSugars([]);
        setZaps([]);
        setIsGameOver(false);
        setIsStarted(true);
    };

    return (
        <div className="h-screen bg-[#0b1b2b] text-white flex flex-col overflow-hidden select-none font-sans">
            
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
                        <Zap size={16} className="text-[#FFB300]" />
                        Combat du Sucre
                    </h2>
                    <div className="flex gap-2 mt-1">
                        {[...Array(3)].map((_, i) => (
                            <Heart 
                                key={i} 
                                size={18} 
                                fill={i < health ? "#FF3B30" : "transparent"} 
                                className={i < health ? "text-[#FF3B30]" : "text-white/20"} 
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-[#FFB300] text-black px-4 py-2 rounded-xl font-black text-lg shadow-lg flex items-center gap-2 min-w-[80px] justify-center">
                    <Trophy size={18} />
                    {score}
                </div>
            </div>

            {/* Game Area */}
            <div ref={gameAreaRef} className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 to-[#0b1b2b]">
                
                {/* Visual Feedback: Radar/Shield effect */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 border-[40px] border-blue-500 rounded-full scale-1.50 animate-pulse" />
                </div>

                {!isStarted && !isGameOver && (
                    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#0b1b2b] border border-white/20 p-10 rounded-[40px] shadow-3xl text-center max-w-sm w-full"
                        >
                            <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <Shield size={40} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black uppercase italic mb-4">Le Combat <br/> <span className="text-[#FFB300]">du Sucre</span></h1>
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-8 leading-relaxed">
                                Les sucreries tombent ! <br/>
                                Touche-les pour les détruire avant qu'elles n'atteignent le bas.
                            </p>
                            <button 
                                onClick={startGame}
                                className="w-full py-5 bg-[#FFB300] text-black rounded-3xl font-black uppercase tracking-[0.2em] transform active:scale-95 transition-all shadow-[0_0_30px_rgba(255,179,0,0.4)]"
                            >
                                Commencer ⚡
                            </button>
                        </motion.div>
                    </div>
                )}

                {isGameOver && (
                    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-8 bg-black/0.80 backdrop-blur-xl">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-center"
                        >
                            <div className="text-6xl mb-4">😵</div>
                            <h2 className="text-5xl font-black italic uppercase text-[#FF3B30] mb-2 tracking-tighter">Fini !</h2>
                            <p className="text-xl font-bold mb-10 text-white/60">Ton score final : <span className="text-[#FFB300] text-3xl">{score}</span></p>
                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={startGame}
                                    className="px-10 py-5 bg-[#FFB300] text-black rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                                >
                                    Rejouer 🔄
                                </button>
                                <button 
                                    onClick={() => router.push('/kid/games')}
                                    className="px-10 py-5 bg-white/10 text-white border border-white/10 rounded-3xl font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                                >
                                    Quitter
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Sugars */}
                {sugars.map(sugar => (
                    <motion.button
                        key={sugar.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute w-16 h-16 flex items-center justify-center text-4xl cursor-pointer pointer-events-auto touch-none"
                        style={{ left: `${sugar.x}%`, top: `${sugar.y}%` }}
                        onClick={() => handleSugarClick(sugar.id, sugar.x, sugar.y)}
                        onMouseDown={() => handleSugarClick(sugar.id, sugar.x, sugar.y)}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                            <span className="relative z-10">{sugar.type}</span>
                        </div>
                    </motion.button>
                ))}

                {/* Zap Effects */}
                {zaps.map(zap => (
                    <motion.div
                        key={zap.id}
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        className="absolute w-20 h-20 pointer-events-none z-30"
                        style={{ left: `${zap.x}%`, top: `${zap.y}%` }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap size={40} className="text-[#FFB300] fill-[#FFB300]" />
                        </div>
                    </motion.div>
                ))}

                {/* Ground Line Tooltip */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="h-1 w-full bg-red-500/20 shadow-[0_0_10px_rgba(239,59,48,0.3)] mb-2" />
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">Ligne de défense DiaCare</p>
                </div>
            </div>

            {/* Hint */}
            <div className="p-8 text-center bg-black/40">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FFB300] animate-pulse">
                    Touche les sucreries pour les faire exploser !
                </p>
            </div>
        </div>
    );
}
