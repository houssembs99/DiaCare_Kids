"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Baby, Activity, Syringe, AlertTriangle,
    FileText, MessageSquare, ArrowLeft,
    Edit3, ChevronRight, Droplet, Clock,
    Calendar, User, Weight, Ruler, Mail,
    Phone, Plus, CheckCircle2, TrendingUp,
    Send, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
);

const SectionHeader = ({ icon: Icon, title, sub }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#088395]/10 rounded-2xl flex items-center justify-center text-[#088395] border border-[#088395]/20">
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">{title}</h3>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{sub}</p>
        </div>
    </div>
);

export default function PatientDetail() {
    const params = useParams();
    const id = params.id;
    const [activeTab, setActiveTab] = useState('overview');
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        weight: '', height: '', allergies: '', diabetesType: '', diagnosisDate: ''
    });
    const [medicalNotes, setMedicalNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/doctor-management/patients/${id}`);
            setData(res.data);
            if (res.data.patient) {
                setEditForm({
                    weight: res.data.patient.weight || '',
                    height: res.data.patient.height || '',
                    allergies: res.data.patient.allergies || '',
                    diabetesType: res.data.patient.diabetesType || 'Type 1',
                    diagnosisDate: res.data.patient.diagnosisDate ? res.data.patient.diagnosisDate.split('T')[0] : ''
                });
                setMedicalNotes(res.data.patient.medicalNotes || '');
                if (res.data.parent) {
                    const u = JSON.parse(localStorage.getItem('user') || '{}');
                    fetchMessages(res.data.parent.id, u.id);
                }
            }
        } catch (err) {
            console.error("Error fetching detail:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/doctor-management/update-patient-profile/${id}`, editForm);
            setShowEditModal(false);
            fetchDetail(); // Refresh data
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await api.put(`/doctor-management/update-medical-notes/${id}`, { notes: medicalNotes });
            fetchDetail(); // Rafraîchir
        } catch (err) {
            console.error("Error saving notes:", err);
        } finally {
            setSavingNotes(false);
        }
    };

    const fetchMessages = async (parentId, userId) => {
        if (!userId || !parentId) return;
        try {
            const res = await api.get(`/Messages/conversation/${userId}/${parentId}`);
            setMessages(res.data);
            const unread = res.data.filter(m => !m.isRead && m.receiverId === userId);
            if (unread.length > 0) {
                await Promise.all(unread.map(m => api.put(`/Messages/read/${m.id}`)));
            }
        } catch (err) {
            console.error("Error fetching messages", err);
        }
    };

    const handleSendMessage = async () => {
        if (!msg.trim() || !data?.parent || !currentUser?.id) return;
        try {
            const newMsg = {
                senderId: currentUser.id,
                senderName: currentUser.fullName || 'Docteur',
                receiverId: data.parent.id,
                receiverName: data.parent.fullName || 'Parent',
                content: msg
            };
            await api.post('/Messages', newMsg);
            setMsg("");
            fetchMessages(data.parent.id, currentUser.id);
        } catch (err) {
            console.error("Erreur envoi message:", err);
        }
    };

    React.useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(u);
        if (id) fetchDetail();
    }, [id]);



    if (loading) {
        return (
            <DashboardLayout role="Medecin">
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <div className="w-12 h-12 border-4 border-t-[#088395] border-white/10 rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Chargement du profil...</span>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout role="Medecin">
                <div className="text-center py-20">Patient non trouvé.</div>
            </DashboardLayout>
        );
    }

    const { patient, parent, records = [] } = data;
    const age = patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A';

    // Chart logic
    const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).slice(-10);
    const chartLabels = sortedRecords.length > 0
        ? sortedRecords.map(r => new Date(r.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
        : ['08:00', '10:00', '12:00', '14:00', '16:00'];
    const chartDataValues = sortedRecords.length > 0
        ? sortedRecords.map(r => r.glucoseValue || 0)
        : [110, 145, 185, 130, 95];

    const chartData = {
        labels: chartLabels,
        datasets: [{
            label: 'Glycémie (mg/dL)',
            data: chartDataValues,
            borderColor: '#088395',
            backgroundColor: 'rgba(8, 131, 149, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 4,
            pointRadius: 6,
            pointBackgroundColor: '#fff'
        }]
    };

    return (
        <DashboardLayout role="Medecin">
            <div className="space-y-10 pb-10 text-white">

                {/* Back & Title */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <Link href="/doctor/patients" className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                            <ArrowLeft size={24} />
                        </Link>
                        <div className="space-y-1">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                {patient.fullName.split(' ')[0]} <span className="text-white/40">{patient.fullName.split(' ').slice(1).join(' ')}</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    patient.status === 'Stable' || patient.status === 'Actif' ? "bg-success/20 text-success" : "bg-accent/20 text-accent"
                                )}>
                                    {patient.status === 'Actif' ? 'Stable' : patient.status || 'Stable'}
                                </span>
                                <span className="text-[10px] font-bold text-[#088395] uppercase tracking-widest">{patient.fileNumber || 'PAS DE FICHE'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                            <Edit3 size={20} />
                        </button>
                        <button className="flex items-center gap-3 px-8 py-5 bg-[#088395] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl">
                            Modifier Profil
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Sidebar: General Info (SECTION 1) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl space-y-10 relative group">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/20 rounded-xl text-white/40 hover:text-white transition-all"
                            >
                                <Edit3 size={16} />
                            </button>
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-40 h-40 bg-[#088395]/20 rounded-[50px] flex items-center justify-center text-[#088395] font-black text-6xl border-4 border-[#088395]/30 uppercase">
                                    {(patient.fullName || "P").charAt(0)}
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black italic uppercase tracking-tighter">{age} ans</div>
                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Diagnostic: {patient.diagnosisDate ? new Date(patient.diagnosisDate).toLocaleDateString('fr-FR') : 'Non renseigné'}</div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-10 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                        <Weight size={18} className="text-[#088395]" />
                                        <div className="text-xl font-black italic">{patient.weight || '--'} Kg</div>
                                        <div className="text-[8px] font-bold text-white/20 uppercase">Poids</div>
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                        <Ruler size={18} className="text-[#088395]" />
                                        <div className="text-xl font-black italic">{patient.height || '--'} m</div>
                                        <div className="text-[8px] font-bold text-white/20 uppercase">Taille</div>
                                    </div>
                                </div>
                                <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 space-y-2">
                                    <AlertTriangle size={18} className="text-accent" />
                                    <div className="text-sm font-black uppercase tracking-tighter text-accent">Allergies: {patient.allergies || 'Aucune connue'}</div>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-4 p-4 bg-white/2 rounded-2xl">
                                        <User size={16} className="text-white/20" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Parent: {parent?.fullName || 'N/A'}</span>
                                            <span className="text-[9px] font-bold text-white/20 uppercase">{patient.gender === 'F' ? 'Mère' : 'Père / Tuteur'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-white/2 rounded-2xl">
                                        <Mail size={16} className="text-white/20" />
                                        <span className="text-[10px] font-black tracking-widest text-white/60">{parent?.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Treatment Section (SECTION 3) */}
                        <div className="bg-[#088395] rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                                <Syringe size={180} />
                            </div>
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Traitement</h3>
                                    <div className="p-3 bg-white/20 rounded-xl"><Syringe size={20} /></div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Type Diabète</div>
                                        <div className="text-3xl font-black italic">{patient.diabetesType || 'Type 1'}</div>
                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white text-[#088395] rounded-full text-[9px] font-black">ACTIF</div>
                                            <div className="text-[9px] font-black uppercase text-white/40">Suivi en cours</div>
                                        </div>
                                    </div>
                                    <button className="w-full py-5 bg-white text-[#088395] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl">
                                        Modifier Traitement
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Tabs (SECTIONS 2, 4, 5, 6) */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Tabs Navigation */}
                        <div className="flex gap-2 p-2 bg-white/5 rounded-[28px] border border-white/10 backdrop-blur-xl">
                            {['overview', 'history', 'alerts', 'notes', 'messages'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab ? "bg-white text-[#088395] shadow-xl" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {tab === 'overview' ? 'Aperçu' : tab === 'history' ? 'Historique' : tab === 'alerts' ? 'Alertes' : tab === 'notes' ? 'Notes' : 'Messages'}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="space-y-10"
                                >
                                    {/* Glucose Chart (SECTION 2) */}
                                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden">
                                        <SectionHeader icon={Activity} title="Historique Glycémique" sub="Suivi des dernières 24 heures" />
                                        <div className="h-[350px]">
                                            <Line data={chartData} options={{
                                                responsive: true, maintainAspectRatio: false,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.2)' } },
                                                    x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.2)' } }
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'notes' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl"
                                >
                                    <SectionHeader icon={FileText} title="Notes Médicales" sub="Observations & Recommandations" />
                                    <textarea
                                        value={medicalNotes}
                                        onChange={(e) => setMedicalNotes(e.target.value)}
                                        placeholder="Ajoutez vos observations cliniques ici..."
                                        className="w-full h-80 bg-white/2 border border-white/5 rounded-[32px] p-8 text-sm focus:outline-none focus:border-[#088395] transition-all"
                                    />
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleSaveNotes}
                                            disabled={savingNotes}
                                            className="px-10 py-5 bg-[#088395] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center min-w-[200px]"
                                        >
                                            {savingNotes ? "Enregistrement..." : "Enregistrer la note"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'alerts' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="bg-white/5 border border-white/10 rounded-[40px] p-10"
                                >
                                    <SectionHeader icon={AlertTriangle} title="Journal des Alertes" sub="Incidents récents enregistrés" />
                                    <div className="space-y-4">
                                        {[
                                            { type: "Hypoglycémie Sévère", val: "58 mg/dL", time: "Hier, 09:12", status: "Critique" },
                                            { type: "Oubli Dose", val: "--", time: "10 feb, 21:00", status: "Moyenne" }
                                        ].map((alert, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl">
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                                                        alert.status === 'Critique' ? "bg-accent/20 text-accent" : "bg-orange-500/20 text-orange-500"
                                                    )}>
                                                        <AlertTriangle size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black uppercase tracking-tighter leading-none mb-1">{alert.type}</div>
                                                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{alert.time}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="text-2xl font-black italic text-accent">{alert.val}</div>
                                                    <button className="flex items-center gap-2 px-6 py-3 bg-success/10 text-success rounded-xl text-[9px] font-black uppercase tracking-widest border border-success/20">
                                                        <CheckCircle2 size={12} /> Traitée
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'messages' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="bg-white/5 border border-white/10 rounded-[40px] h-[700px] flex flex-col shadow-2xl overflow-hidden"
                                >
                                    {/* Chat Header */}
                                    <div className="p-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#088395] rounded-2xl flex items-center justify-center font-black uppercase">{(parent?.fullName || "P").charAt(0)}</div>
                                            <div>
                                                <div className="text-sm font-black uppercase tracking-tighter">{parent?.fullName || 'Parent'}</div>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-success uppercase tracking-widest">
                                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" /> Parent rattaché
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-4 bg-white/5 rounded-xl hover:bg-white/10"><Clock size={16} /></button>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 p-8 overflow-y-auto space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center text-white/40 italic text-sm mt-10">
                                                Aucun message pour l'instant. Commencez la discussion avec le parent.
                                            </div>
                                        ) : (
                                            messages.map(m => {
                                                const isMine = m.senderId === currentUser?.id;
                                                return (
                                                    <div key={m.id} className={cn("max-w-[80%] p-6 text-sm font-medium", isMine ? "bg-[#088395] ml-auto rounded-b-[32px] rounded-l-[32px]" : "bg-white/5 border border-white/5 rounded-b-[32px] rounded-r-[32px]")}>
                                                        {m.content}
                                                        <div className={cn("text-[8px] font-black opacity-40 mt-3 uppercase tracking-widest", isMine ? "text-right" : "")}>
                                                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-8 bg-white/2 border-t border-white/5">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={msg}
                                                onChange={(e) => setMsg(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                                                placeholder="ÉCRIVEZ VOTRE MESSAGE AU PARENT..."
                                                className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 pl-8 pr-32 text-xs font-bold focus:outline-none focus:border-[#088395] transition-all"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <button className="p-4 text-white/20 hover:text-white transition-colors"><Paperclip size={18} /></button>
                                                <button onClick={handleSendMessage} className="p-4 bg-[#088395] rounded-2xl text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl px-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-[#0b1b2b] border border-white/10 rounded-[40px] p-10 relative shadow-2xl"
                        >
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-6 right-6 p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all hover:rotate-90"
                            >
                                x
                            </button>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 bg-gradient-to-r from-[#088395] to-white bg-clip-text text-transparent">
                                Mettre à jour le profil
                            </h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Poids (Kg)</label>
                                        <input type="number" step="0.1" value={editForm.weight} onChange={e => setEditForm({ ...editForm, weight: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Taille (m)</label>
                                        <input type="number" step="0.01" value={editForm.height} onChange={e => setEditForm({ ...editForm, height: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Date de Diagnostic</label>
                                    <input type="date" value={editForm.diagnosisDate} onChange={e => setEditForm({ ...editForm, diagnosisDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Type de Diabète</label>
                                    <select value={editForm.diabetesType} onChange={e => setEditForm({ ...editForm, diabetesType: e.target.value })} className="w-full bg-[#0b1b2b] border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all">
                                        <option value="Type 1">Type 1</option>
                                        <option value="Type 2">Type 2</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#088395] ml-4">Allergies</label>
                                    <input type="text" value={editForm.allergies} onChange={e => setEditForm({ ...editForm, allergies: e.target.value })} placeholder="Ex: Pénicilline, Arachides..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#088395] outline-none transition-all" />
                                </div>

                                <button type="submit" className="w-full py-5 bg-gradient-to-r from-[#088395] to-[#066a7a] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                    Sauvegarder les modifications
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
