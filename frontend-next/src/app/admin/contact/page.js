"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Mail, MailOpen, Clock, User, Search } from 'lucide-react';
import api from '@/lib/api';

export default function AdminContactMessagesPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Messages/contact');
            setMessages(res.data || []);
        } catch (err) {
            console.error('Erreur chargement messages de contact', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (msg) => {
        if (msg.isRead) return;
        try {
            await api.put(`/Messages/read/${msg.id}`);
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
        } catch {}
    };

    const handleSelect = (msg) => {
        setSelected(msg);
        markAsRead(msg);
    };

    const filtered = messages.filter(m =>
        m.senderName?.toLowerCase().includes(search.toLowerCase()) ||
        m.content?.toLowerCase().includes(search.toLowerCase())
    );

    const unreadCount = messages.filter(m => !m.isRead).length;

    const formatDate = (ts) => {
        return new Date(ts).toLocaleString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <DashboardLayout role="Admin">
            <div className="p-6 lg:p-10 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Messages de Contact</h1>
                        <p className="text-white/40 text-sm font-medium mt-1">
                            {unreadCount > 0
                                ? <span className="text-[#088395] font-bold">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</span>
                                : 'Tous les messages sont lus'
                            }
                            {' '}&bull;{' '}{messages.length} message{messages.length > 1 ? 's' : ''} au total
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-[#088395] transition-colors"
                    />
                </div>

                {/* Layout: list + detail */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
                    {/* List */}
                    <div className="lg:col-span-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16 text-white/30">
                                <Mail size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="font-bold uppercase tracking-widest text-sm">Aucun message</p>
                            </div>
                        ) : (
                            filtered.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => handleSelect(msg)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                        selected?.id === msg.id
                                            ? 'bg-[#088395]/15 border-[#088395]/40'
                                            : msg.isRead
                                                ? 'bg-white/3 border-white/5 hover:bg-white/8'
                                                : 'bg-white/8 border-white/15 hover:border-[#088395]/30'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {msg.isRead
                                                ? <MailOpen size={14} className="text-white/30 flex-shrink-0" />
                                                : <Mail size={14} className="text-[#088395] flex-shrink-0" />
                                            }
                                            <p className={`text-sm font-bold truncate ${msg.isRead ? 'text-white/50' : 'text-white'}`}>
                                                {msg.senderName}
                                            </p>
                                        </div>
                                        {!msg.isRead && (
                                            <span className="w-2 h-2 bg-[#088395] rounded-full flex-shrink-0 mt-1" />
                                        )}
                                    </div>
                                    <p className="text-xs text-white/30 mt-2 line-clamp-2 ml-5">{msg.content}</p>
                                    <div className="flex items-center gap-1 mt-2 ml-5">
                                        <Clock size={10} className="text-white/20" />
                                        <span className="text-[10px] text-white/20">{formatDate(msg.timestamp)}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Detail panel */}
                    <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-[32px] p-8 flex flex-col">
                        {selected ? (
                            <>
                                <div className="flex items-start justify-between mb-8 pb-8 border-b border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#088395]/10 border border-[#088395]/20 rounded-2xl flex items-center justify-center text-[#088395]">
                                            <User size={22} />
                                        </div>
                                        <div>
                                            <p className="font-black text-white">{selected.senderName}</p>
                                            <p className="text-xs text-white/30 mt-1 flex items-center gap-1">
                                                <Clock size={11} /> {formatDate(selected.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selected.isRead ? 'bg-white/5 text-white/30' : 'bg-[#088395]/15 text-[#088395]'}`}>
                                        {selected.isRead ? 'Lu' : 'Non lu'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white/70 leading-relaxed whitespace-pre-wrap text-sm">{selected.content}</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
                                <MailOpen size={64} />
                                <p className="font-bold uppercase tracking-widest text-sm">Sélectionnez un message</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
