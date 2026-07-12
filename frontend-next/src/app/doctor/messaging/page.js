"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    MessageSquare, Search, Send, Paperclip,
    MoreVertical, Video, Info,
    CheckCheck, Camera, Baby, X, FileText, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function DoctorMessaging() {
    const [currentUser, setCurrentUser] = useState(null);
    const currentUserRef = useRef(null);
    const [contacts, setContacts] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Attachment
    const [attachment, setAttachment] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const photoInputRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Notification toast
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
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return;
            const docId = JSON.parse(storedUser).id;

            // Use the same logic as DoctorManagementController:
            // 1. Find parents directly associated to this doctor (independent cabinet)
            // 2. Find children assigned to this doctor, then trace back to their parents
            const usersRes = await api.get('/Users');
            const allUsers = usersRes.data;

            // Parents directly linked to this doctor
            const directParents = allUsers.filter(u =>
                u.role === 'Parent' && (u.associatedDoctorId === docId || u.associatedClinicId === docId)
            );

            // Children assigned to this doctor -> find their parents
            const myChildren = allUsers.filter(u =>
                u.role === 'Enfant' && (u.associatedDoctorId === docId || u.associatedClinicId === docId)
            );
            const childParentIds = new Set(myChildren.map(c => c.associatedParentId).filter(Boolean));
            const indirectParents = allUsers.filter(u =>
                u.role === 'Parent' && childParentIds.has(u.id)
            );

            // Merge and deduplicate
            const parentMap = new Map();
            [...directParents, ...indirectParents].forEach(p => parentMap.set(p.id, p));
            const uniqueParents = Array.from(parentMap.values());

            // Enrich with last message and unread count
            const enrichedContacts = await Promise.all(uniqueParents.map(async (p) => {
                let lastMsg = "Cliquer pour discuter...";
                let time = "";
                let unread = 0;
                try {
                    const msgRes = await api.get(`/Messages/conversation/${docId}/${p.id}`);
                    const msgs = msgRes.data;
                    if (msgs.length > 0) {
                        const last = msgs[msgs.length - 1];
                        lastMsg = last.content || "📎 Pièce jointe";
                        time = new Date(last.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        unread = msgs.filter(m => !m.isRead && m.receiverId === docId).length;
                    }
                } catch (_) { /* ignore */ }

                // Find the child names for this parent
                const parentChildren = myChildren.filter(c => c.associatedParentId === p.id);
                const childNames = parentChildren.map(c => c.fullName).join(', ');

                return {
                    id: p.id,
                    name: p.fullName || p.email || "Parent Inconnu",
                    parentOf: childNames || "un enfant",
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
        } catch (e) {
            console.error("sendMessage error:", e);
        }
    };

    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <DashboardLayout role="Medecin">
            <div className="h-[calc(100vh-180px)] text-white">

                {/* Notification Toast */}
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
                                <div className="text-[11px] text-white/0.70 truncate">{newMsgToast.content || "📎 Pièce jointe"}</div>
                            </div>
                            <button onClick={() => setNewMsgToast(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex h-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">

                    {/* Contacts List */}
                    <div className="w-full lg:w-[400px] border-r border-white/10 flex flex-col">
                        <div className="p-8 border-b border-white/5 bg-white/2">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Messagerie</h2>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#088395] transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="RECHERCHER UN PARENT..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#088395] transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredContacts.map(contact => (
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
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-black uppercase tracking-tighter truncate">{contact.name}</div>
                                            {contact.time && <span className="text-[8px] font-bold text-white/30 shrink-0 ml-2">{contact.time}</span>}
                                        </div>
                                        <div className="text-[10px] font-bold text-white/40 mt-1 truncate">{contact.lastMsg}</div>
                                        {contact.parentOf && <div className="text-[8px] font-bold text-[#088395]/60 mt-1 truncate">👶 {contact.parentOf}</div>}
                                    </div>
                                    {contact.unread > 0 && (
                                        <div className="w-6 h-6 bg-[#088395] rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                                            {contact.unread}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="hidden lg:flex flex-1 flex-col relative overflow-hidden bg-white/2">
                        {selectedChat ? (
                            <>
                                {/* Chat Header — no phone icon */}
                                <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/3">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-[#088395] rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl">
                                            {selectedChat.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-xl font-black italic uppercase tracking-tighter">{selectedChat.name}</div>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                <Baby size={12} className="text-[#088395]" /> Parent rattaché
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="p-4 bg-white/5 hover:bg-white hover:text-black rounded-2xl transition-all"><Video size={20} /></button>
                                        <button className="p-4 bg-white/5 hover:bg-white hover:text-black rounded-2xl transition-all"><Info size={20} /></button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div ref={chatContainerRef} className="flex-1 p-10 overflow-y-auto space-y-6 scroll-smooth">
                                    <div className="flex justify-center">
                                        <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Aujourd'hui</span>
                                    </div>

                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white/10"><MessageSquare size={32} /></div>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Aucun message — commencez la conversation</p>
                                        </div>
                                    ) : messages.map((m, idx) => {
                                        const isMe = m.senderId === currentUser?.id;
                                        return (
                                            <div key={idx} className={cn("max-w-[70%] group", isMe ? "ml-auto" : "")}>
                                                <div className={cn("p-6 rounded-3xl text-sm font-medium leading-relaxed shadow-xl", isMe ? "bg-[#088395] rounded-tr-none" : "bg-white/5 border border-white/5 rounded-tl-none")}>
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
                                            className="mx-10 mb-2 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4"
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
                                <div className="p-10 bg-white/3 border-t border-white/10 backdrop-blur-3xl">
                                    <div className="relative group/input flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => photoInputRef.current?.click()}
                                                className="p-5 bg-white/5 hover:bg-[#088395] rounded-2xl transition-all text-white/20 hover:text-white hover:scale-105 active:scale-95"
                                                title="Joindre une photo"
                                            >
                                                <Camera size={22} />
                                            </button>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-5 bg-white/5 hover:bg-[#088395] rounded-2xl transition-all text-white/20 hover:text-white hover:scale-105 active:scale-95"
                                                title="Joindre un fichier"
                                            >
                                                <Paperclip size={22} />
                                            </button>
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={msg}
                                                onChange={(e) => setMsg(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                                placeholder="TAPEZ VOTRE MESSAGE MÉDICAL ICI..."
                                                className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-10 pr-24 text-xs font-bold focus:outline-none focus:border-[#088395] transition-all focus:bg-white/10"
                                            />
                                            <button
                                                onClick={sendMessage}
                                                disabled={uploading}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-4 bg-[#088395] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                <Send size={18} className="inline mr-2" /> Envoyer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
                                <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center text-white/10"><MessageSquare size={48} /></div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Votre Espace de Dialogue</h3>
                                    <p className="text-sm font-medium text-white/20 max-w-sm">Sélectionnez une conversation avec un parent pour commencer le suivi médical à distance.</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
