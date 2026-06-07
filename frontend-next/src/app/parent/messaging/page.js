"use client";

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Send, Paperclip, Camera, Stethoscope, CheckCheck,
    MoreVertical, FileText, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ParentMessaging() {
    const [currentUser, setCurrentUser] = useState(null);
    const currentUserRef = useRef(null);
    const [doctor, setDoctor] = useState(null);
    const doctorRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const photoInputRef = useRef(null);
    // Ref on the messages scroll container (NOT scrollIntoView on whole page)
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const user = { id: parsed.id, name: parsed.fullName };
            setCurrentUser(user);
            currentUserRef.current = user;
            fetchDoctor(user.id);
        }
    }, []);

    useEffect(() => {
        if (!doctor) return;
        const interval = setInterval(() => loadMessages(doctor.id), 5000);
        return () => clearInterval(interval);
    }, [doctor]);

    // Scroll only the messages container, not the whole page
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchDoctor = async (parentId) => {
        try {
            const sumRes = await api.get('/parent/dashboard-summary');
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userFull = await api.get(`/users/${storedUser.id}`);
            const parentUser = userFull.data;

            let docId = null;
            let docName = "Docteur";

            // 1. Priority: Direct association on parent (Independent Cabinet)
            if (parentUser.associatedDoctorId) {
                const docInfo = await api.get(`/users/${parentUser.associatedDoctorId}`);
                docId = docInfo.data.id;
                docName = docInfo.data.fullName;
            } 
            // 2. Secondary: Associated doctor from a child
            else if (sumRes.data.children) {
                const childWithDoc = sumRes.data.children.find(c => c.associatedDoctorId);
                if (childWithDoc) {
                    docId = childWithDoc.associatedDoctorId;
                    docName = childWithDoc.doctorName;
                }
            }

            if (!docId) {
                const docRes = await api.get('/parent/my-clinic-doctors');
                if (docRes.data && docRes.data.length > 0) {
                    docId = docRes.data[0].id;
                    docName = docRes.data[0].fullName;
                }
            }

            if (docId) {
                const myDoctor = { id: docId, name: docName };
                setDoctor(myDoctor);
                doctorRef.current = myDoctor;
                loadMessages(myDoctor.id, parentId);
            }
        } catch (e) {
            console.error("fetchDoctor error:", e);
        }
    };

    const loadMessages = async (contactId, userId) => {
        const currentId = userId || currentUserRef.current?.id;
        if (!currentId || !contactId) return;
        try {
            const res = await api.get(`/Messages/conversation/${currentId}/${contactId}`);
            setMessages(res.data);
            const unread = res.data.filter(m => !m.isRead && m.receiverId === currentId);
            if (unread.length > 0) {
                await Promise.all(unread.map(m => api.put(`/Messages/read/${m.id}`)));
            }
        } catch (e) {
            console.error("loadMessages error:", e);
        }
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
        const doc = doctorRef.current;
        if ((!msg.trim() && !attachment) || !doc || !user) return;
        try {
            const payload = {
                senderId: user.id,
                senderName: user.name,
                receiverId: doc.id,
                receiverName: doc.name,
                content: msg,
                attachmentUrl: attachment?.url || null,
                attachmentType: attachment?.type || null,
            };
            await api.post('/Messages', payload);
            setMsg("");
            clearAttachment();
            loadMessages(doc.id);
        } catch (e) {
            console.error("sendMessage error:", e);
        }
    };

    return (
        <DashboardLayout role="Parent">
            <div className="h-[calc(100vh-160px)] flex flex-col max-w-lg mx-auto pb-20">

                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-3xl border-b border-white/10 rounded-t-[40px]">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-[#088395] rounded-2xl flex items-center justify-center text-white border-2 border-white/20 shadow-xl">
                                <Stethoscope size={28} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-[#1E88E5] rounded-full" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                                {doctor ? (doctor.name?.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`) : "Chargement..."}
                            </h2>
                            <p className="text-[9px] font-black text-success uppercase tracking-widest">En ligne</p>
                        </div>
                    </div>
                    <button className="p-3 bg-white/5 rounded-xl text-white/40"><MoreVertical size={18} /></button>
                </div>

                {/* Messages — scrollable container with ref */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/10">
                    <div className="flex justify-center">
                        <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white/20">Aujourd'hui</span>
                    </div>

                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                            <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center text-white/10">
                                <Stethoscope size={28} />
                            </div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Aucun message — écrivez à votre médecin</p>
                        </div>
                    ) : messages.map((m, idx) => {
                        const isMe = m.senderId === currentUser?.id;
                        return (
                            <div key={idx} className={cn("max-w-[85%]", isMe && "ml-auto")}>
                                <div className={cn("p-5 rounded-3xl text-sm font-medium leading-relaxed shadow-xl", isMe ? "bg-[#088395] rounded-tr-none text-white" : "bg-white/5 border border-white/10 rounded-tl-none text-white/80")}>
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
                                    <div className={cn("text-[8px] font-bold mt-3 flex items-center justify-end gap-1 uppercase tracking-widest", isMe ? "text-white/40" : "text-white/20")}>
                                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <CheckCheck size={12} className={cn(!isMe && "text-[#088395]")} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Attachment Preview */}
                <AnimatePresence>
                    {preview && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className="mx-6 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4"
                        >
                            {attachment?.type === 'image' ? (
                                <img src={preview} className="w-16 h-16 rounded-xl object-cover" alt="preview" />
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

                {/* Input */}
                <div className="p-6 bg-white/5 backdrop-blur-3xl border-t border-white/10 rounded-b-[40px] mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-[28px] flex items-center px-6 py-2 transition-all focus-within:border-[#088395] focus-within:bg-white/10">
                            <input
                                type="text"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="TAPEZ ICI..."
                                className="flex-1 bg-transparent border-none py-4 text-xs font-bold text-white focus:outline-none placeholder:text-white/10 uppercase tracking-widest"
                            />
                            <button onClick={() => photoInputRef.current?.click()} className="p-3 text-white/20 hover:text-[#088395] transition-colors" title="Photo">
                                <Camera size={20} />
                            </button>
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-white/20 hover:text-[#088395] transition-colors" title="Fichier">
                                <Paperclip size={20} />
                            </button>
                        </div>
                        <button
                            onClick={sendMessage}
                            disabled={uploading}
                            className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95",
                                (msg.trim() || attachment) ? "bg-[#088395] text-white" : "bg-white/5 text-white/10"
                            )}
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
