"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { useLanguage } from '@/lib/LanguageContext';
import { Volume2, X, MessageCircle, Lightbulb, HelpCircle, ChevronRight, Play, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import animations directly from src/animations
import stableAnimData from '@/animations/diapotstable.json';
import talkingAnimData from '@/animations/diapoteparlle.json';

const DiaPoteInteraction = ({ energy, onClose, userName }) => {
    const { t, lang } = useLanguage();
    const [currentText, setCurrentText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const lottieRef = useRef();

    const qaData = {
        fr: {
            questions: [
                { id: 'q1', text: "C'est quoi le diabète ?", response: "C'est comme si ton corps avait oublié comment transformer le sucre en énergie tout seul. Mais avec notre équipe (Toi, Moi et tes parents), on va l'aider !" },
                { id: 'q2', text: "Pourquoi je dois me piquer ?", response: "C'est pour donner à ton corps sa petite potion magique (l'insuline) qui l'aide à rester fort et en pleine forme !" },
                { id: 'q3', text: "Puis-je manger des bonbons ?", response: "Bien sûr, mais avec modération et au bon moment ! On doit juste bien s'organiser avec ton insuline." },
                { id: 'q4', text: "Pourquoi vérifier mon sucre avant le sport ?", response: "Pour être sûr que tu as assez de carburant pour courir partout ! Comme une voiture qui vérifie son essence avant un long voyage." },
                { id: 'q5', text: "C'est quoi une hypoglycémie ?", response: "C'est quand ton énergie est un peu trop basse. Pas de panique, un petit sucre et tu redeviens un éclair !" }
            ],
            advice: [
                { id: 'a1', text: "Conseil Sport", response: "Bouger est super pour ton coeur ! Pense juste à vérifier ton énergie avant de courir comme un champion." },
                { id: 'a2', text: "Conseil Repas", response: "Mange tes légumes, ce sont les meilleurs boucliers pour ton corps !" },
                { id: 'a3', text: "Conseil Eau", response: "Boire de l'eau est ton super-pouvoir caché. Ça aide ton corps à bien fonctionner toute la journée !" },
                { id: 'a4', text: "Conseil Patience", response: "Après avoir mangé du sucre pour remonter ton énergie, attends 15 petites minutes pour que la magie opère !" }
            ],
            intro: `Bonjour ${userName} ! Je suis prêt pour tes questions. Qu'est-ce qui te tracasse aujourd'hui ?`
        },
        en: {
            questions: [
                { id: 'q1', text: "What is diabetes?", response: "It's as if your body forgot how to turn sugar into energy by itself. But with our team, we will help it!" },
                { id: 'q2', text: "Why do I need shots?", response: "It's to give your body its magic potion (insulin) that helps it stay strong and healthy!" },
                { id: 'q3', text: "Can I eat candy?", response: "Sure, but in moderation and at the right time! We just need to plan it with your insulin." },
                { id: 'q4', text: "Why check sugar before sports?", response: "To make sure you have enough fuel to run around! Like a car checking its gas before a long trip." },
                { id: 'q5', text: "What is a 'hypo'?", response: "It's when your energy is a bit too low. No panic, a little sugar and you become a lightning bolt again!" }
            ],
            advice: [
                { id: 'a1', text: "Sport Advice", response: "Moving is great for your heart! Just remember to check your energy before running like a champion." },
                { id: 'a2', text: "Meal Advice", response: "Eat your veggies, they are the best shields for your body!" },
                { id: 'a3', text: "Water Advice", response: "Drinking water is your hidden superpower. It helps your body work well all day long!" },
                { id: 'a4', text: "Patience Advice", response: "After eating sugar to boost your energy, wait 15 little minutes for the magic to happen!" }
            ],
            intro: `Hello ${userName}! I'm ready for your questions. What's on your mind today?`
        },
        ar: {
            questions: [
                { id: 'q1', text: "ما هو السكري؟", response: "الأمر وكأن جسدك نسي كيف يحول السكر إلى طاقة بمفرده. لكن مع فريقنا، سنساعده!" },
                { id: 'q2', text: "لماذا يجب أن آخذ الحقن؟", response: "هذا لتعطي جسدك جرعته السحرية (الأنسولين) التي تساعده ليبقى قوياً وفي صحة جيدة!" },
                { id: 'q3', text: "هل يمكنني أكل الحلوى؟", response: "بالتأكيد، لكن باعتدال وفي الوقت المناسب! نحتاج فقط لتنسيق ذلك مع الأنسولين." },
                { id: 'q4', text: "لماذا أفحص السكر قبل الرياضة؟", response: "لتتأكد أن لديك وقوداً كافياً للجري في كل مكان! مثل السيارة التي تتفقد البنزين قبل رحلة طويلة." },
                { id: 'q5', text: "ما هو هبوط السكر؟", response: "هذا عندما تكون طاقتك منخفضة قليلاً. لا داعي للقلق، قطعة سكر صغيرة وسوف تعود نشيطاً كالبرق!" }
            ],
            advice: [
                { id: 'a1', text: "نصيحة الرياضة", response: "الحركة رائعة لقلبك! فقط تذكر فحص طاقتك قبل الجري مثل الأبطال." },
                { id: 'a2', text: "نصيحة الأكل", response: "كل خضرواتك، فهي أفضل الدروع لجسدك!" },
                { id: 'a3', text: "نصيحة الماء", response: "شرب الماء هو قوتك الخفية. إنه يساعد جسدك على العمل بشكل جيد طوال اليوم!" },
                { id: 'a4', text: "نصيحة الصبر", response: "بعد أكل السكر لرفع طاقتك، انتظر 15 دقيقة صغيرة حتى يبدأ المفعول السحري!" }
            ],
            intro: `أهلاً ${userName}! أنا مستعد لأسئلتك. ماذا يدور في ذهنك اليوم؟`
        }
    };

    const currentContent = qaData[lang] || qaData.fr;

    useEffect(() => {
        handleSpeak(currentContent.intro);

        // Cleanup: Stop speaking when component unmounts
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [lang]);

    const handleSpeak = (text) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'ar' ? 'ar-SA' : (lang === 'en' ? 'en-US' : 'fr-FR');
            
            utterance.onstart = () => {
                setIsSpeaking(true);
            };
            
            utterance.onend = () => {
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
            setCurrentText(text);
        }
    };

    // Determine active animation
    const activeAnimation = isSpeaking ? talkingAnimData : stableAnimData;

    return (
        <div className="fixed inset-0 z-[999] bg-[#0b1b2b] flex flex-col items-center overflow-y-auto custom-scrollbar pb-20">
            
            {/* Header */}
            <div className="w-full flex justify-between items-center p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFB300] rounded-xl flex items-center justify-center text-black">
                        <Brain size={20} />
                    </div>
                    <div>
                        <h2 className="text-white font-black uppercase text-sm tracking-widest">{t('kid.jApprends')}</h2>
                        <p className="text-white/40 text-[10px] uppercase font-bold">{t('kid.avecDiaPote')}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all z-[300]" aria-label="Fermer">
                    <X size={32} />
                </button>
            </div>

            <div className="w-full max-w-5xl px-6 pt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                <div className="flex flex-col items-center justify-center lg:sticky lg:top-32 h-fit">
                    
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentText}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full bg-white rounded-[32px] p-6 shadow-2xl z-30 mb-8 relative order-1 min-h-[100px] flex items-center justify-center"
                        >
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45" />
                            <p className={cn(
                                "text-black font-bold text-center",
                                lang === 'ar' ? 'font-arabic text-right' : 'text-lg text-blue-900'
                            )}>
                                {currentText}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="relative w-0.80 h-0.80 md:w-[450px] md:h-[450px] mb-10 order-2 flex items-center justify-center">
                        <div className="absolute inset-0 blur-[100px] opacity-20 rounded-full bg-blue-400" />
                        
                        <Lottie 
                            key={isSpeaking ? 'talking' : 'stable'}
                            lottieRef={lottieRef}
                            animationData={activeAnimation} 
                            loop={true}
                            autoplay={true}
                            className="w-full h-full"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                             <div className={cn("w-3 h-3 rounded-full animate-pulse", isSpeaking ? 'bg-green-400' : 'bg-white/20')} />
                             <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                                {isSpeaking ? t('kid.diaPoteSpeaking') : t('kid.diaPoteListening')}
                             </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                             <HelpCircle className="text-[#0071E3]" />
                            <h3 className="text-white font-black uppercase tracking-widest text-xs">{t('kid.questionsFreq')}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {currentContent.questions.map((q) => (
                                <button 
                                    key={q.id}
                                    onClick={() => handleSpeak(q.response)}
                                    className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl transition-all group text-left"
                                >
                                    <span className={cn("text-white font-bold", lang === 'ar' && 'text-right flex-1 font-arabic')}>
                                        {q.text}
                                    </span>
                                    <div className="w-10 h-10 bg-[#0071E3]/20 rounded-xl flex items-center justify-center text-[#0071E3] group-hover:scale-110 transition-transform">
                                        <Play size={18} fill="currentColor" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 px-2">
                            <Lightbulb className="text-[#FF9500]" />
                            <h3 className="text-white font-black uppercase tracking-widest text-xs">{t('kid.conseilsChampion')}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {currentContent.advice.map((a) => (
                                <button 
                                    key={a.id}
                                    onClick={() => handleSpeak(a.response)}
                                    className="flex items-center justify-between p-6 bg-[#FF9500]/10 hover:bg-[#FF9500]/20 border border-[#FF9500]/20 rounded-3xl transition-all group text-left"
                                >
                                    <span className={cn("text-white font-bold", lang === 'ar' && 'text-right flex-1 font-arabic')}>
                                        {a.text}
                                    </span>
                                    <div className="w-10 h-10 bg-[#FF9500] rounded-xl flex items-center justify-center text-black group-hover:rotate-12 transition-transform">
                                        <ChevronRight size={18} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiaPoteInteraction;

