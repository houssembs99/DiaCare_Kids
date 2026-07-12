"use client";

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    MessageSquare, Search, Send, Paperclip,
    MoreVertical, Video, Info, ArrowLeft,
    CheckCheck, Camera, Stethoscope, X, FileText, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function ParentMessaging() {
    const [currentUser, setCurrentUser] = useState(null);
    const currentUserRef = useRef(null);
    const [contacts, setContacts] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [attachment, setAttachment] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const photoInputRef = useRef(null);
    const chatContainerRef = useRef(null);

    const [newMsgToast, setNewMsgToast] = useState(null);
    const prevMsgCountRef = useRef(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const user = { id: parsed.id, name: parsed.fullName };
            setCurrentUser(user);
            currentUserRef.current = user;
            fetchContacts();
        }
    }, []);

    // Auto-refresh chat every 5 seconds and detect new messages
    useEffect(() => {
        if (!selectedChat) return;
        const interval = setInterval(async () => {
            const userId = currentUserRef.current?.id;
            if (!userId || !selectedChat?.id) return;
            const res = await api.get(`/Messages/conversation/${userId}/${selectedChat.id}`);
            const newMsgs = res.data;

            // If new messages arrived from the other person, show toast
            const incomingUnread = newMsgs.filter(m => !m.isRead && m.receiverId === userId);
            if (incomingUnread.length > prevMsgCountRef.current) {
                const last = incomingUnread[incomingUnread.length - 1];
                setNewMsgToast({ senderName: last.senderName, content: last.content });
                setTimeout(() => setNewMsgToast(null), 4000);
            }
            prevMsgCountRef.current = incomingUnread.length;

            setMessages(newMsgs);

            // Mark as read
            if (incomingUnread.length > 0) {
                await Promise.all(incomingUnread.map(m => api.put(`/Messages/read/${m.id}`)));
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedChat]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchContacts = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userFull = await api.get(`/users/${storedUser.id}`);
            const parentUser = userFull.data;
            const sumRes = await api.get('/parent/dashboard-summary');
            
            let doctorIdsToFetch = new Set();
            
            // 1. Parent's direct doctor
            if (parentUser.associatedDoctorId) {
                doctorIdsToFetch.add(parentUser.associatedDoctorId);
            }
            
            // 2. Children's doctors
            if (sumRes.data.children) {
                sumRes.data.children.forEach(c => {
                    if (c.associatedDoctorId) doctorIdsToFetch.add(c.associatedDoctorId);
                });
                
                // If they have associatedClinicId but no doctorId, might be independent doctor
                for (const c of sumRes.data.children) {
                    if (!c.associatedDoctorId && c.associatedClinicId) {
                        try {
                            const clinicUser = await api.get(`/users/${c.associatedClinicId}`);
                            if (clinicUser.data.role === 'Medecin') {
                                doctorIdsToFetch.add(clinicUser.data.id);
                            }
                        } catch (_) {}
                    }
                }
            }
            
            // Parent's clinic if it's a Medecin
            if (parentUser.associatedClinicId) {
                try {
                    const clinicUser = await api.get(`/users/${parentUser.associatedClinicId}`);
                    if (clinicUser.data.role === 'Medecin') {
                        doctorIdsToFetch.add(clinicUser.data.id);
                    }
                } catch (_) {}
            }
            
            const doctorsMap = new Map();
            
            for (const dId of doctorIdsToFetch) {
                try {
                    const docInfo = await api.get(`/users/${dId}`);
                    doctorsMap.set(dId, docInfo.data);
                } catch (_) {}
            }
            
            // Fallback: Get clinic doctors
            try {
                const docRes = await api.get('/parent/my-clinic-doctors');
                if (docRes.data && docRes.data.length > 0) {
                    docRes.data.forEach(d => doctorsMap.set(d.id, d));
                }
            } catch (_) {}

            const uniqueDoctors = Array.from(doctorsMap.values());
            
            const enrichedContacts = await Promise.all(uniqueDoctors.map(async (doc) => {
                let lastMsg = "Cliquer pour discuter...";
                let time = "";
                let unread = 0;
                let specialty = "Médecin Traitant";

                try {
                    const msgRes = await api.get(`/Messages/conversation/${parentUser.id}/${doc.id}`);
                    const msgs = msgRes.data;
                    if (msgs.length > 0) {
                        const last = msgs[msgs.length - 1];
                        lastMsg = last.content || "📎 Pièce jointe";
                        time = new Date(last.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        unread = msgs.filter(m => !m.isRead && m.receiverId === parentUser.id).length;
                    }
                } catch (_) { /* ignore */ }

                // Find out which children this doctor treats
                const treatingFor = [];
                if (sumRes.data.children) {
                     sumRes.data.children.forEach(c => {
                         if (c.associatedDoctorId === doc.id) treatingFor.push(c.fullName.split(' ')[0]);
                         else if (!c.associatedDoctorId && c.associatedClinicId === doc.id) treatingFor.push(c.fullName.split(' ')[0]);
                     });
                }
                if (treatingFor.length > 0) {
                     specialty = "Suivi de " + treatingFor.join(', ');
                }

                return {
                    id: doc.id,
                    name: doc.fullName?.startsWith("Dr.") ? doc.fullName : `Dr. ${doc.fullName}`,
                    email: doc.email,
                    specialty,
                    lastMsg,
                    time,
                    online: false,
                    unread
                };
            }));
            
            setContacts(enrichedContacts);
        } catch (e) {
            console.error("fetchContacts error:", e);
        }
    };

    const loadMessages = async (contactId) => {
        const userId = currentUserRef.current?.id;
        if (!userId || !contactId) return;
        try {
            const res = await api.get(`/Messages/conversation/${userId}/${contactId}`);
            setMessages(res.data);
            const unread = res.data.filter(m => !m.isRead && m.receiverId === userId);
            prevMsgCountRef.current = unread.length;
            if (unread.length > 0) {
                await Promise.all(unread.map(m => api.put(`/Messages/read/${m.id}`)));
            }
            // Update unread count in contacts list
            setContacts(prev => prev.map(c => 
                c.id === contactId ? { ...c, unread: 0 } : c
            ));
        } catch (e) {
            console.error("loadMessages error:", e);
        }
    };

    const handleSelectChat = (contact) => {
        setSelectedChat(contact);
        loadMessages(contact.id);
        clearAttachment();
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await api.post('/Messages/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAttachment({ url: res.data.url, type: res.data.type, fileName: res.data.fileName });
        } catch (e) {
            console.error("Upload error:", e);
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const clearAttachment = () => {
        setAttachment(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    const sendMessage = async () => {
        const user = currentUserRef.current;
        if ((!msg.trim() && !attachment) || !selectedChat || !user) return;
        try {
            const payload = {
                senderId: user.id,
                senderName: user.name,
                receiverId: selectedChat.id,
                receiverName: selectedChat.name,
                content: msg,
                attachmentUrl: attachment?.url || null,
                attachmentType: attachment?.type || null,
            };
            await api.post('/Messages', payload);
            setMsg("");
            clearAttachment();
            loadMessages(selectedChat.id);
            fetchContacts(); // Update "last message" in sidebar
        } catch (e) {
            console.error("sendMessage error:", e);
        }
    };

    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <DashboardLayout role="Parent">
            <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-160px)] text-white max-w-5xl mx-auto">

                <AnimatePresence>
                    {newMsgToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -60 }}
                            className="fixed top-6 right-6 z-[300] bg-[#088395] shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 max-w-sm"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Bell size={20} /></div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Nouveau message</div>
                                <div className="text-sm font-black text-white truncate">{newMsgToast.senderName}</div>
                                <div className="text-[11px] text-white/70 truncate">{newMsgToast.content || "📎 Pièce jointe"}</div>
                            </div>
                            <button onClick={() => setNewMsgToast(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex h-full bg-white/5 backdrop-blur-3xl border border-white/10 lg:rounded-[40px] overflow-hidden shadow-2xl">

                    {/* Contacts List */}
                    <div className={cn(
                        "w-full lg:w-[400px] border-r border-white/10 flex-col",
                        selectedChat ? "hidden lg:flex" : "flex"
                    )}>
                        <div className="p-8 border-b border-white/5 bg-white/5">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Équipe Médicale</h2>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#088395] transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="RECHERCHER UN MÉDECIN..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredContacts.length === 0 ? (
                                <div className="text-center p-8 text-white/40 text-xs font-bold">Aucun médecin trouvé</div>
                            ) : (
                                filteredContacts.map(contact => (
                                    <motion.div
                                        whileHover={{ x: 5 }} key={contact.id}
                                        onClick={() => handleSelectChat(contact)}
                                        className={cn(
                                            "p-6 rounded-3xl cursor-pointer transition-all flex items-center gap-4 group",
                                            selectedChat?.id === contact.id ? "bg-[#088395] shadow-xl" : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 transition-all",
                                            selectedChat?.id === contact.id ? "bg-white/20 border-white/40" : "bg-white/10 border-white/5"
                                        )}>
                                            <Stethoscope size={24} className={selectedChat?.id === contact.id ? "text-white" : "text-white/40 group-hover:text-white transition-colors"} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-black uppercase tracking-tighter truncate">{contact.name}</div>
                                                {contact.time && <span className="text-[8px] font-bold text-white/30 shrink-0 ml-2">{contact.time}</span>}
                                            </div>
                                            <div className="text-[10px] font-bold text-white/40 mt-1 truncate">{contact.lastMsg}</div>
                                            <div className="text-[8px] font-bold text-[#088395]/60 mt-1 truncate">🩺 {contact.specialty}</div>
                                        </div>
                                        {contact.unread > 0 && (
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                                                {contact.unread}
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className={cn(
                        "flex-1 flex-col relative overflow-hidden bg-white/2",
                        selectedChat ? "flex" : "hidden lg:flex"
                    )}>
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-6 lg:p-8 border-b border-white/10 flex items-center justify-between bg-white/3">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setSelectedChat(null)} 
                                            className="lg:hidden p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all mr-2"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <div className="relative">
                                            <div className="w-12 lg:w-16 h-12 lg:h-16 bg-[#088395] rounded-2xl lg:rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl border border-white/20">
                                                <Stethoscope size={24} />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-[#1E88E5] rounded-full" />
                                        </div>
                                        <div>
                                            <div className="text-lg lg:text-xl font-black italic uppercase tracking-tighter">{selectedChat.name}</div>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-success uppercase tracking-widest mt-1">
                                                En ligne
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="p-3 lg:p-4 bg-white/5 hover:bg-[#088395] hover:text-white rounded-2xl transition-all hidden sm:block"><Video size={20} /></button>
                                        <button className="p-3 lg:p-4 bg-white/5 hover:bg-white hover:text-black rounded-2xl transition-all"><Info size={20} /></button>
                                        <button className="p-3 lg:p-4 bg-white/5 hover:bg-white hover:text-black rounded-2xl transition-all hidden lg:block"><MoreVertical size={20} /></button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div ref={chatContainerRef} className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-6 scroll-smooth bg-black/10">
                                    <div className="flex justify-center">
                                        <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Aujourd'hui</span>
                                    </div>

                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
                                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white/10"><MessageSquare size={32} /></div>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest max-w-[200px]">Aucun message — écrivez à votre médecin pour toute question</p>
                                        </div>
                                    ) : messages.map((m, idx) => {
                                        const isMe = m.senderId === currentUser?.id;
                                        return (
                                            <div key={idx} className={cn("max-w-[85%] lg:max-w-[70%] group", isMe ? "ml-auto" : "")}>
                                                <div className={cn("p-5 lg:p-6 rounded-3xl text-sm font-medium leading-relaxed shadow-xl", isMe ? "bg-[#088395] rounded-tr-none text-white" : "bg-white/10 border border-white/5 rounded-tl-none")}>
                                                    {m.attachmentUrl && m.attachmentType === 'image' && (
                                                        <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                            <img src={m.attachmentUrl} alt="photo" className="rounded-2xl mb-3 max-w-full max-h-64 object-cover border border-white/10" />
                                                        </a>
                                                    )}
                                                    {m.attachmentUrl && m.attachmentType === 'file' && (
                                                        <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl mb-3 hover:bg-white/20 transition-all">
                                                            <FileText size={16} />
                                                            <span className="text-[11px] font-bold truncate">Fichier joint</span>
                                                        </a>
                                                    )}
                                                    {m.content && <span>{m.content}</span>}
                                                    <div className={cn("text-[8px] font-bold mt-3 flex items-center justify-end gap-2 uppercase tracking-widest", isMe ? "text-white/60" : "text-white/20")}>
                                                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        <CheckCheck size={12} className={cn(!isMe && "text-[#088395]")} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Attachment preview */}
                                <AnimatePresence>
                                    {preview && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                            className="mx-6 lg:mx-10 mb-2 p-4 bg-white/10 border border-white/10 rounded-2xl flex items-center gap-4 backdrop-blur-xl"
                                        >
                                            {attachment?.type === 'image' ? (
                                                <img src={preview} className="w-16 h-16 rounded-xl object-cover" />
                                            ) : (
                                                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center"><FileText size={24} /></div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-black text-white truncate">{attachment?.fileName || "Fichier"}</div>
                                                <div className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{uploading ? "Envoi en cours..." : "Prêt à envoyer"}</div>
                                            </div>
                                            <button onClick={clearAttachment} className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/40 transition-all"><X size={16} /></button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Hidden file inputs */}
                                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

                                {/* Chat Input */}
                                <div className="p-4 lg:p-8 bg-white/5 border-t border-white/10 backdrop-blur-3xl">
                                    <div className="relative group/input flex items-center gap-2 lg:gap-4">
                                        <div className="flex items-center gap-1 lg:gap-2">
                                            <button
                                                onClick={() => photoInputRef.current?.click()}
                                                className="p-3 lg:p-4 bg-white/5 hover:bg-[#088395] rounded-2xl transition-all text-white/40 hover:text-white hover:scale-105 active:scale-95"
                                                title="Joindre une photo"
                                            >
                                                <Camera size={20} />
                                            </button>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-3 lg:p-4 bg-white/5 hover:bg-[#088395] rounded-2xl transition-all text-white/40 hover:text-white hover:scale-105 active:scale-95 hidden sm:block"
                                                title="Joindre un fichier"
                                            >
                                                <Paperclip size={20} />
                                            </button>
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={msg}
                                                onChange={(e) => setMsg(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                                placeholder="TAPEZ ICI..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl py-4 lg:py-5 pl-6 lg:pl-8 pr-20 lg:pr-24 text-[10px] lg:text-xs font-bold focus:outline-none focus:border-[#088395] transition-all focus:bg-white/10"
                                            />
                                            <button
                                                onClick={sendMessage}
                                                disabled={uploading || (!msg.trim() && !attachment)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-auto lg:h-auto lg:px-6 lg:py-3 bg-[#088395] text-white rounded-xl lg:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                                            >
                                                <Send size={16} className="lg:mr-2" /> 
                                                <span className="hidden lg:inline">Envoyer</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-6">
                                <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center text-white/10"><MessageSquare size={48} /></div>
                                <div className="space-y-2">
                                    <h3 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter">Votre Espace Santé</h3>
                                    <p className="text-[10px] lg:text-sm font-medium text-white/20 max-w-sm">Sélectionnez un médecin dans la liste pour commencer la conversation concernant vos enfants.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
