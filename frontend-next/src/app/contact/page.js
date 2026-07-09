"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ContactPage() {
    const { t } = useLanguage();

    const [form, setForm] = useState({ name: '', email: '', content: '' });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.content.trim()) {
            setErrorMsg('Veuillez remplir tous les champs.');
            setStatus('error');
            return;
        }
        setStatus('loading');
        setErrorMsg('');
        try {
            await api.post('/Messages/contact', form);
            setStatus('success');
            setForm({ name: '', email: '', content: '' });
        } catch (err) {
            setErrorMsg(err?.response?.data || 'Une erreur s\'est produite. Veuillez réessayer.');
            setStatus('error');
        }
    };

    return (
        <div className="flex flex-col min-h-screen pt-40 px-6 pb-20">
            <section id="contact" className="py-20 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-[#088395]/10 rounded-full blur-[150px] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center space-y-16 relative z-10">
                    <div className="space-y-4">
                        <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase">{t('nav.contact')}</h1>
                        <p className="text-white/40 font-bold uppercase tracking-[0.3em]">Nous sommes à votre écoute</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-[40px] p-12 text-left space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Votre Nom</label>
                                <input
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-[#088395] transition-colors"
                                    placeholder="Votre nom complet"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-[#088395] transition-colors"
                                    placeholder="contact@example.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Message</label>
                            <textarea
                                name="content"
                                rows="5"
                                value={form.content}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-[#088395] transition-colors resize-none"
                                placeholder="Comment pouvons-nous vous aider ?"
                            />
                        </div>

                        {/* Status messages */}
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400"
                            >
                                <CheckCircle2 size={20} />
                                <span className="text-sm font-bold">Votre message a bien été envoyé ! Nous vous répondrons rapidement.</span>
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400"
                            >
                                <AlertCircle size={20} />
                                <span className="text-sm font-bold">{errorMsg}</span>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-[#088395] text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(8,131,149,0.3)]"
                        >
                            {status === 'loading' ? (
                                <><Loader2 size={20} className="animate-spin" /> Envoi en cours...</>
                            ) : (
                                <><Send size={20} /> Envoyer le Message</>
                            )}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
