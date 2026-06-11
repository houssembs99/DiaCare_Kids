"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { useLanguage } from '@/lib/LanguageContext';
import { Volume2, X } from 'lucide-react';

// Import animations directly from src/animations
import stableAnimData from '@/animations/diapotstable.json';
import talkingAnimData from '@/animations/diapoteparlle.json';

const DiaPoteMascot = ({ userName = "Ami", onClose }) => {
    const { t, lang } = useLanguage();
    const [isVisible, setIsVisible] = useState(true);
    const [message, setMessage] = useState('');
    const [step, setStep] = useState(0);
    const [isTalking, setIsTalking] = useState(false);

    const lottieRef = useRef();

    const greetings = {
        fr: [
            `Salut ${userName} ! Je suis DiaPote, ton meilleur ami technologique !`,
            "Je suis là pour t'aider à devenir un super-héros de la santé.",
            "Découvrons ensemble tes exploits du jour !"
        ],
        en: [
            `Hi ${userName}! I'm DiaPote, your tech best friend!`,
            "I'm here to help you become a health superhero.",
            "Let's check your achievements for today!"
        ],
        ar: [
            `أهلاً ${userName}! أنا ديا-بوت، صديقك المفضل!`,
            "أنا هنا لمساعدتك لتصبح بطلاً خارقاً في الصحة.",
            "لنكتشف معاً إنجازاتك اليوم!"
        ]
    };

    const currentGreetings = greetings[lang] || greetings.fr;

    const handleSpeak = (text) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'ar' ? 'ar-SA' : (lang === 'en' ? 'en-US' : 'fr-FR');

            utterance.onstart = () => {
                setIsTalking(true);
            };

            utterance.onend = () => {
                setIsTalking(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        const msg = currentGreetings[step];
        setMessage(msg);
        handleSpeak(msg);
    }, [step, lang]);

    const handleClose = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsVisible(false);
        if (onClose) onClose();
    };

    if (!isVisible) return null;

    // Determine which animation to show
    const activeAnimation = isTalking ? talkingAnimData : stableAnimData;

    return (
        <div className="fixed inset-0 z-[2.50] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-gradient-to-br from-[#088395] to-[#0b1b2b] w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-white/20"
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all z-[300]"
                    aria-label="Fermer"
                >
                    <X size={28} className="text-white" />
                </button>

                {/* Mascot Illustration with Lottie */}
                <div className="flex flex-col items-center">
                    <div className="relative w-72 h-72 mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />

                        {activeAnimation ? (
                            <Lottie
                                key={isTalking ? 'talking' : 'stable'}
                                lottieRef={lottieRef}
                                animationData={activeAnimation}
                                loop={true}
                                style={{ width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div className="w-20 h-20 border-4 border-white/20 border-t-[#FFB300] rounded-full animate-spin" />
                        )}
                    </div>

                    {/* Speech Bubble */}
                    <div className="bg-white rounded-[32px] p-6 text-black relative mb-8 w-full shadow-xl">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45" />
                        <p className={`text-center font-bold text-lg leading-snug ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
                            {message}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 w-full">
                        {step < currentGreetings.length - 1 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="flex-1 bg-white text-[#088395] py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg"
                            >
                                {t('kid.next')}
                            </button>
                        ) : (
                            <button
                                onClick={handleClose}
                                className="flex-1 bg-[#FFB300] text-[#0b1b2b] py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg"
                            >
                                {t('kid.letsGo')}
                            </button>
                        )}
                        <button
                            className="p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all"
                            onClick={() => setIsTalking(!isTalking)}
                        >
                            <Volume2 size={24} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DiaPoteMascot;


