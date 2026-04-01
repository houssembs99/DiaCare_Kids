"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Activity, ArrowLeft, Trophy } from 'lucide-react';

const GAME_SPEED = 2.5;
const PLAYER_SPEED = 20;
const OBSTACLE_SPAWN_RATE = 2000; // ms
const ITEM_SPAWN_RATE = 2800; // ms

export default function RunnerGame() {
    const router = useRouter();
    const gameAreaRef = useRef(null);
    const requestRef = useRef();
    
    // Game State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(3);
    
    // Entities
    const [playerX, setPlayerX] = useState(50); // percentage
    const [obstacles, setObstacles] = useState([]);
    const [items, setItems] = useState([]);
    
    // Start Game
    const startGame = () => {
        setIsPlaying(true);
        setIsGameOver(false);
        setScore(0);
        setHealth(3);
        setPlayerX(50);
        setObstacles([]);
        setItems([]);
    };

    // Quit Game
    const quitGame = () => {
        router.push('/kid/games');
    };

    // Handle Input
    const handleKeyDown = useCallback((e) => {
        if (!isPlaying || isGameOver) return;
        if (e.key === 'ArrowLeft') {
            setPlayerX(prev => Math.max(10, prev - PLAYER_SPEED));
        } else if (e.key === 'ArrowRight') {
            setPlayerX(prev => Math.min(90, prev + PLAYER_SPEED));
        }
    }, [isPlaying, isGameOver]);

    // Touch Controls
    const handleTouchMove = (e) => {
        if (!isPlaying || isGameOver || !gameAreaRef.current) return;
        const touch = e.touches[0];
        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        setPlayerX(Math.max(10, Math.min(90, x)));
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Game Loop
    const updateGame = useCallback(() => {
        if (!isPlaying || isGameOver) return;

        // Move Obstacles
        setObstacles(prev => prev.map(obs => ({ ...obs, y: obs.y + GAME_SPEED })).filter(obs => obs.y < 110));
        
        // Move Items
        setItems(prev => prev.map(item => ({ ...item, y: item.y + GAME_SPEED })).filter(item => item.y < 110));

        // Check Collisions (simplified based on percentage positions)
        // Player is around bottom 10%, size is roughly 10% x 10%
        const playerRect = { x: playerX, y: 85, width: 10, height: 10 };

        // Check Obstacles
        setObstacles(prev => {
            const newObstacles = [];
            let hit = false;
            for (let obs of prev) {
                if (
                    Math.abs(obs.x - playerRect.x) < 8 && 
                    Math.abs(obs.y - playerRect.y) < 10 &&
                    !obs.hit
                ) {
                    hit = true;
                    obs.hit = true; // Mark as hit so it doesn't trigger multiple times
                } else {
                    newObstacles.push(obs);
                }
            }
            if (hit) {
                setHealth(h => {
                    if (h <= 1) {
                        setIsGameOver(true);
                        setIsPlaying(false);
                    }
                    return h - 1;
                });
            }
            return newObstacles;
        });

        // Check Items
        setItems(prev => {
            const newItems = [];
            let collected = false;
            for (let item of prev) {
                if (
                    Math.abs(item.x - playerRect.x) < 8 && 
                    Math.abs(item.y - playerRect.y) < 10
                ) {
                    collected = true;
                } else {
                    newItems.push(item);
                }
            }
            if (collected) {
                setScore(s => s + 10);
            }
            return newItems;
        });

        setScore(s => s + 1); // Passive score gain

        requestRef.current = requestAnimationFrame(updateGame);
    }, [isPlaying, isGameOver, playerX]);

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(updateGame);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, updateGame]);

    // Spawners
    useEffect(() => {
        if (!isPlaying || isGameOver) return;

        const obstacleEmojis = ["🍭", "🍬", "🍫", "🍰"];
        const itemEmojis = ["🍎", "🥦", "🥑", "💧"];

        const obsInterval = setInterval(() => {
            const icon = obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)];
            setObstacles(prev => [...prev, { id: Math.random(), x: Math.random() * 80 + 10, y: -10, icon }]);
        }, OBSTACLE_SPAWN_RATE);

        const itemInterval = setInterval(() => {
            const icon = itemEmojis[Math.floor(Math.random() * itemEmojis.length)];
            setItems(prev => [...prev, { id: Math.random(), x: Math.random() * 80 + 10, y: -10, icon }]);
        }, ITEM_SPAWN_RATE);

        return () => {
            clearInterval(obsInterval);
            clearInterval(itemInterval);
        };
    }, [isPlaying, isGameOver]);


    return (
        <div className="h-screen pt-28 bg-[#0b1b2b] text-white flex flex-col font-sans overflow-hidden select-none">
            {/* Header HUD */}
            <div className="p-6 flex items-center justify-between z-10 bg-black/20 backdrop-blur-md">
                <button onClick={quitGame} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <Heart 
                            key={i} 
                            size={24} 
                            fill={i < health ? "#ef4444" : "transparent"} 
                            className={i < health ? "text-red-500" : "text-white/20"} 
                        />
                    ))}
                </div>
                <div className="bg-[#FFB300] text-black px-4 py-2 rounded-xl font-black flex items-center gap-2">
                    <Trophy size={16} />
                    {score}
                </div>
            </div>

            {/* Game Area */}
            <div 
                ref={gameAreaRef}
                className="flex-1 relative overflow-hidden touch-none"
                onTouchMove={handleTouchMove}
            >
                {/* Background stars/particles */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 to-[#0b1b2b]" />

                {!isPlaying && !isGameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#0b1b2b]/95 border border-white/20 p-8 rounded-[40px] max-w-md w-full shadow-2xl text-center flex flex-col items-center"
                        >
                            <h1 className="text-4xl font-black uppercase italic mb-2 text-[#FFB300] drop-shadow-md">Dia Runner</h1>
                            <p className="text-xs font-bold opacity-60 uppercase mb-6 tracking-widest text-[#FFB300]">Comment Jouer ?</p>
                            
                            <div className="flex flex-col gap-5 mb-8 w-full text-left bg-white/5 p-6 rounded-3xl border border-white/10">
                                {/* Player & Controls */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(255,255,255,0.5)] shrink-0 border border-blue-500">🦸‍♂️</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black uppercase text-blue-400">Toi, le héros !</div>
                                        <div className="text-[10px] font-bold text-white/60 leading-tight mt-1">
                                            Esquive de gauche à droite avec les flèches ou au toucher. Tu as <Heart size={10} className="inline text-red-500 fill-current"/> 3 vies.
                                        </div>
                                    </div>
                                </div>

                                {/* Enemies */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-500/80 rounded-2xl flex items-center justify-center text-3xl border-2 border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)] shrink-0">🍭</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black uppercase text-red-400">Les Sucreries (Ennemis)</div>
                                        <div className="text-[10px] font-bold text-white/60 leading-tight mt-1">
                                            Évite-les à tout prix ! S'ils te touchent, tu perds une <Heart size={10} className="inline text-red-500 fill-current"/> vie.
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-400/90 rounded-full flex items-center justify-center text-3xl border-2 border-green-200 shadow-[0_0_15px_rgba(74,222,128,0.8)] shrink-0">🍎</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black uppercase text-green-400">Aliments Sains (Bonus)</div>
                                        <div className="text-[10px] font-bold text-white/60 leading-tight mt-1">
                                            Attrape-les pour gagner <Trophy size={10} className="inline text-[#FFB300]"/> +10 points supplémentaires.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={startGame}
                                className="w-full py-5 bg-[#FFB300] text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(255,179,0,0.5)] hover:scale-[1.03] active:scale-95 transition-all"
                            >
                                Commencer l'aventure  🚀
                            </button>
                        </motion.div>
                    </div>
                )}

                {isGameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center bg-white/10 p-8 rounded-3xl border border-white/20"
                        >
                            <h2 className="text-4xl font-black uppercase text-red-500 mb-2">Game Over</h2>
                            <p className="text-xl mb-6">Score: <span className="text-[#FFB300] font-black">{score}</span></p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={startGame}
                                    className="px-6 py-3 bg-[#FFB300] text-black rounded-xl font-black uppercase text-sm"
                                >
                                    Rejouer
                                </button>
                                <button 
                                    onClick={quitGame}
                                    className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold uppercase text-sm"
                                >
                                    Quitter
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Player */}
                <div 
                    className="absolute bottom-[10%] w-14 h-14 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] border-4 border-blue-500 flex items-center justify-center z-10 transition-transform text-3xl"
                    style={{ left: `calc(${playerX}% - 28px)` }}
                >
                    🦸‍♂️
                </div>

                {/* Obstacles (Enemies) */}
                {obstacles.map(obs => (
                    <div 
                        key={obs.id}
                        className="absolute w-12 h-12 bg-red-500/80 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(239,68,68,0.5)] border-2 border-red-300"
                        style={{ left: `calc(${obs.x}% - 24px)`, top: `${obs.y}%` }}
                    >
                        {obs.icon || "🍩"}
                    </div>
                ))}

                {/* Items */}
                {items.map(item => (
                    <div 
                        key={item.id}
                        className="absolute w-12 h-12 bg-green-400/90 rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(74,222,128,0.8)] border-2 border-green-200"
                        style={{ left: `calc(${item.x}% - 24px)`, top: `${item.y}%` }}
                    >
                        {item.icon || "💉"}
                    </div>
                ))}
            </div>

            {/* Mobile Controls Hint */}
            <div className="p-4 text-center text-xs opacity-40 font-bold uppercase pb-8">
                Utilisez les flèches ou glissez sur l'écran pour bouger
            </div>
        </div>
    );
}
