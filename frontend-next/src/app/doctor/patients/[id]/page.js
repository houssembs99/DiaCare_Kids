"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Baby, Activity, Syringe, AlertTriangle,
    FileText, MessageSquare, ArrowLeft,
    Edit3, ChevronRight, Droplet, Clock,
    Calendar, User, Weight, Ruler, Mail,
    Phone, Plus, CheckCircle2, TrendingUp,
    Send, Paperclip, Loader2, Heart
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
            fetchDetail();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await api.put(`/doctor-management/update-medical-notes/${id}`, { notes: medicalNotes });
            fetchDetail();
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

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(u);
        if (id) fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout role="Medecin">
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <Loader2 className="animate-spin text-[#088395]" size={40} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Chargement du dossier patient...</span>
                </div>
            </DashboardLayout>
        );
    }

    if (!data || !data.patient) {
        return (
            <DashboardLayout role="Medecin">
                <div className="text-center py-20 bg-white/5 rounded-[40px] border border-white/10">
                    <AlertTriangle size={48} className="mx-auto text-accent mb-6" />
                    <h2 className="text-2xl font-black uppercase italic italic text-white mb-2">Patient non trouvé</h2>
                    <p className="text-sm text-white/40 mb-10 italic font-bold">Le dossier que vous tentez de consulter n'existe pas ou ne vous est pas rattaché.</p>
                    <Link href="/doctor/patients" className="px-10 py-5 bg-[#088395] rounded-2xl font-black uppercase text-[10px] tracking-widest">Retour à la liste</Link>
                </div>
            </DashboardLayout>
        );
    }

    const { patient, parent, records = [] } = data;
    const age = patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A';

    // Chart logic
    const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).slice(-15);
    const chartLabels = sortedRecords.length > 0
        ? sortedRecords.map(r => new Date(r.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
        : ['--:--', '--:--', '--:--', '--:--', '--:--'];
    const chartDataValues = sortedRecords.length > 0
        ? sortedRecords.map(r => r.glucoseValue || 0)
        : [0, 0, 0, 0, 0];

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

                {/* Header SECTION 4.1 */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <Link href="/doctor/patients" className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all shadow-xl group">
                            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                                    {patient.fullName}
                                </h1>
                                <div className="p-2 bg-success/20 rounded-xl text-success"><CheckCircle2 size={16} /></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#088395]">Dossier Patient:</span>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">{patient.fileNumber || 'PAS DE FICHE'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setShowEditModal(true)} className="flex items-center gap-3 px-8 py-5 bg-[#088395] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            <Edit3 size={18} /> Modifier Infos Médicales
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left: Patient ID Card */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl space-y-10">
                            <div className="flex flex-col items-center gap-8">
                                <div className="group relative">
                                    <div className="w-44 h-44 bg-[#088395]/20 rounded-[55px] flex items-center justify-center text-[#088395] font-black text-6xl border-4 border-[#088395]/30 uppercase transition-all group-hover:scale-105 group-hover:rotate-3 shadow-2xl">
                                        {(patient.fullName || "P").charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-success p-3 rounded-2xl border-4 border-[#1E1E2D] shadow-xl">
                                        <Heart size={20} className="text-white fill-white" />
                                    </div>
                                </div>
                                
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Profil du Champion</h2>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Date Naissance: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('fr-FR') : '--'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-10">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-2">
                                    <Weight size={20} className="text-[#088395]" />
                                    <div className="text-xl font-black italic">{patient.weight || '--'} <span className="text-[10px] not-italic opacity-20">Kg</span></div>
                                    <div className="text-[8px] font-black uppercase text-white/20 tracking-widest">Poids Actuel</div>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-2">
                                    <Ruler size={20} className="text-[#088395]" />
                                    <div className="text-xl font-black italic">{patient.height || '--'} <span className="text-[10px] not-italic opacity-20">m</span></div>
                                    <div className="text-[8px] font-black uppercase text-white/20 tracking-widest">Taille</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 space-y-2">
                                    <div className="flex items-center gap-3 text-accent mb-2">
                                        <AlertTriangle size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Allergies Signalées</span>
                                    </div>
                                    <div className="text-sm font-bold text-white/60 italic">{patient.allergies || 'Aucune contre-indication renseignée'}</div>
                                </div>

                                <div className="p-6 bg-[#088395]/5 rounded-3xl border border-[#088395]/10 space-y-4">
                                    <div className="flex items-center gap-3 text-[#088395]">
                                        <User size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Rattachement Parental</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase text-white">{parent?.fullName || 'Non assigné'}</span>
                                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{parent?.email || 'Pas d\'email'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Disease Info Box */}
                        <div className="bg-[#0b1b2b] border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                           <div className="absolute -right-10 -top-10 opacity-5 rotate-12"><Activity size={180} /></div>
                           <div className="relative z-10 space-y-6">
                               <SectionHeader icon={Activity} title="Pathologie" sub="Détails du diagnostic" />
                               <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Type</span>
                                        <span className="text-sm font-black italic">{patient.diabetesType || 'Type 1'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Depuis le</span>
                                        <span className="text-sm font-black italic">{patient.diagnosisDate ? new Date(patient.diagnosisDate).toLocaleDateString('fr-FR') : '--'}</span>
                                    </div>
                               </div>
                           </div>
                        </div>
                    </div>

                    {/* Right: Interactive Tabs */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Tab Switcher */}
                        <div className="flex gap-2 p-2 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-xl sticky top-20 z-50">
                            {['overview', 'history', 'notes', 'messages'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab ? "bg-white text-[#088395] shadow-xl translate-y-[-2px]" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {tab === 'overview' ? 'Aperçu' : tab === 'history' ? 'Tout l\'Historique' : tab === 'notes' ? 'Notes Médicales' : 'Contacter Parent'}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[45px] p-10 shadow-2xl relative overflow-hidden">
                                        <SectionHeader icon={Activity} title="Courbe Glycémique" sub="Tendances des derniers relevés" />
                                        {records.length > 0 ? (
                                            <div className="h-[350px]">
                                                <Line data={chartData} options={{
                                                    responsive: true, maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                    scales: {
                                                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10, weight: 'bold' } } },
                                                        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10, weight: 'bold' } } }
                                                    }
                                                }} />
                                            </div>
                                        ) : (
                                            <div className="h-[350px] flex flex-col items-center justify-center text-center space-y-4 opacity-30 italic">
                                                <Activity size={48} />
                                                <p className="text-sm font-bold uppercase tracking-widest">Aucune donnée glycémique enregistrée pour le moment.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'history' && (
                                <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="bg-white/5 border border-white/10 rounded-[45px] p-10"
                                >
                                    <SectionHeader icon={Clock} title="Journal Complet" sub="Héritage médical chronologique" />
                                    <div className="overflow-x-auto min-h-[400px]">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5">
                                                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-[#088395]">Date & Heure</th>
                                                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Glycémie</th>
                                                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Insuline</th>
                                                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Glucides</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-white">
                                                {records.length === 0 ? (
                                                    <tr><td colSpan="4" className="py-24 text-center text-white/20 italic font-bold uppercase tracking-widest">Historique vide pour cet enfant.</td></tr>
                                                ) : records.map((r, idx) => (
                                                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-6 text-sm font-black italic uppercase tracking-tighter">
                                                            {new Date(r.timestamp).toLocaleDateString('fr-FR')} <span className="text-[10px] not-italic text-white/20 ml-2">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </td>
                                                        <td className="py-6">
                                                            <div className="text-2xl font-black italic">{r.glucoseValue || '--'} <span className="text-[10px] not-italic opacity-20 uppercase ml-1">mg/dL</span></div>
                                                        </td>
                                                        <td className="py-6">
                                                            <div className="flex items-center gap-3 text-[#088395] font-black text-sm uppercase">
                                                                <Syringe size={16} /> {r.insulinDose || '--'} U
                                                            </div>
                                                        </td>
                                                        <td className="py-6 text-right">
                                                            <span className="text-sm font-black italic text-orange-400">{r.carbsEstimated || '--'} <span className="text-[10px] not-italic opacity-30">g</span></span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'notes' && (
                                <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="bg-white/5 border border-white/10 rounded-[45px] p-10">
                                        <SectionHeader icon={FileText} title="Observations Cliniques" sub="Vos notes privées sur ce patient" />
                                        <textarea
                                            value={medicalNotes}
                                            onChange={(e) => setMedicalNotes(e.target.value)}
                                            placeholder="Notez ici les particularités cliniques, les conseils donnés lors de la consultation ou les ajustements de protocole..."
                                            className="w-full h-80 bg-[#0b1b2b] border border-white/5 rounded-[32px] p-10 text-sm italic font-medium focus:outline-none focus:border-[#088395] transition-all resize-none shadow-inner"
                                        />
                                        <div className="mt-8 flex justify-end">
                                            <button onClick={handleSaveNotes} disabled={savingNotes} className="px-10 py-5 bg-[#088395] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3">
                                                {savingNotes ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                                {savingNotes ? "Sauvegarde..." : "Enregistrer mes notes"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'messages' && (
                                <motion.div key="messages" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-black/20 border border-white/10 rounded-[45px] h-[750px] flex flex-col shadow-2xl overflow-hidden backdrop-blur-3xl">
                                    <div className="p-10 border-b border-white/5 bg-white/2 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-[#088395] rounded-2xl flex items-center justify-center font-black text-xl uppercase italic">{(parent?.fullName || "P").charAt(0)}</div>
                                            <div>
                                                <div className="text-xl font-black uppercase italic tracking-tighter">{parent?.fullName || 'Parent'}</div>
                                                <div className="text-[10px] font-black text-success uppercase tracking-widest flex items-center gap-2 mt-1">
                                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" /> Messagerie Parent rattaché
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-10 overflow-y-auto space-y-6">
                                        {messages.length === 0 ? (
                                            <div className="text-center py-20 text-white/20 italic font-bold uppercase tracking-widest text-xs">Démarrez la discussion avec le parent ici.</div>
                                        ) : messages.map(m => (
                                            <div key={m.id} className={cn("max-w-[75%] p-6 rounded-3xl text-sm font-medium leading-relaxed shadow-xl", m.senderId === currentUser?.id ? "bg-[#088395] ml-auto rounded-tr-none text-white" : "bg-white/5 border border-white/5 rounded-tl-none text-white/80")}>
                                                {m.content}
                                                <div className="text-[8px] font-black opacity-30 mt-3 uppercase text-right tracking-widest">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-8 bg-white/2 border-t border-white/5">
                                        <div className="relative">
                                            <input
                                                type="text" value={msg} onChange={(e) => setMsg(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="VOTRE MESSAGE..."
                                                className="w-full bg-[#0b1b2b] border border-white/10 rounded-full py-6 pl-10 pr-24 text-xs font-black uppercase tracking-widest focus:border-[#088395] outline-none"
                                            />
                                            <button onClick={handleSendMessage} className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-[#088395] rounded-full text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Profile Update Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-2xl px-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl bg-[#0b1b2b] border border-white/10 rounded-[50px] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Mettre à jour <span className="text-[#088395]">Champions</span></h3>
                                <button onClick={() => setShowEditModal(false)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-white/20">X</button>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Poids (Kg)</label>
                                        <input type="number" step="0.1" value={editForm.weight} onChange={e => setEditForm({ ...editForm, weight: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold focus:border-[#088395] transition-all outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Taille (m)</label>
                                        <input type="number" step="0.01" value={editForm.height} onChange={e => setEditForm({ ...editForm, height: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold focus:border-[#088395] transition-all outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Date de Diagnostic</label>
                                    <input type="date" value={editForm.diagnosisDate} onChange={e => setEditForm({ ...editForm, diagnosisDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white/60 focus:border-[#088395] transition-all outline-none" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Allergies</label>
                                    <input type="text" value={editForm.allergies} onChange={e => setEditForm({ ...editForm, allergies: e.target.value })} placeholder="Ex: Aucune" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold focus:border-[#088395] transition-all outline-none uppercase tracking-widest placeholder:opacity-10" />
                                </div>
                                <button type="submit" className="w-full py-6 bg-[#088395] rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-6 shadow-[0_20px_50px_rgba(8,131,149,0.3)]">
                                    Valider les Changements
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
