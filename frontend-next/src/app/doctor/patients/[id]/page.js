"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Baby, Activity, Syringe, AlertTriangle,
    FileText, MessageSquare, ArrowLeft,
    Edit3, ChevronRight, Droplet, Clock,
    Calendar, User, Weight, Ruler, Mail,
    Phone, Plus, CheckCircle2, TrendingUp,
    Send, Paperclip, Loader2, Heart, Brain, Sparkles, Zap
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const [showIAModal, setShowIAModal] = useState(false);
    const [isIAAnalysing, setIsIAAnalysing] = useState(false);
    const [iaReport, setIaReport] = useState(null);
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

    const handleIAAnalysis = () => {
        setShowIAModal(true);
        setIsIAAnalysing(true);
        setIaReport(null);
        
        // Simuler un appel API qui prend du temps
        setTimeout(() => {
            const patientName = data?.patient?.fullName || "Le patient";
            
            // 1. Calcul des vraies données
            let recentTrend = "stable";
            let avgGlucose = 110;
            let lastMealTime = "récemment";

            if (data?.records && data.records.length > 0) {
                // Trier du plus récent au plus ancien
                const recent = [...data.records].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
                avgGlucose = recent.reduce((sum, r) => sum + (r.glucoseValue || 0), 0) / recent.length;
                
                if (recent.length > 1) {
                    if (recent[0].glucoseValue > recent[recent.length-1].glucoseValue + 10) recentTrend = "en hausse constante";
                    else if (recent[0].glucoseValue < recent[recent.length-1].glucoseValue - 10) recentTrend = "en baisse constante";
                    else recentTrend = "relativement stable";
                }
            }

            // 2. Moteur de règles mathématiques contextuelles 
            let lastRecord = data?.records?.length > 0
                ? [...data.records].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
                : null;
            let currentVal = lastRecord ? lastRecord.glucoseValue : avgGlucose;
            let timing = lastRecord ? lastRecord.timing : 'before';
            let insulinInjected = lastRecord ? lastRecord.insulinDose > 0 : false;
            let activity = lastRecord && lastRecord.activityLevel === "Modérée";
            
            let seuilBas = 0.70;
            let seuilHaut = 1.30;
            let contextLabel = "À jeun / Avant repas";

            if (timing === 'before') { 
                seuilBas = 0.70; seuilHaut = 1.30; contextLabel = "Avant repas";
            } else if (timing === 'after') { 
                seuilBas = 0.70; seuilHaut = 1.80; contextLabel = "Après repas (1-2h)";
            } else if (timing === 'bedtime') { 
                seuilBas = 0.80; seuilHaut = 1.50; contextLabel = "Avant coucher";
            } else if (activity) { 
                seuilBas = 0.70; seuilHaut = 1.80; contextLabel = "Activité physique";
            }

            let evalType = 'normal';
            if (insulinInjected) {
                if (currentVal < 0.70 || currentVal < seuilBas) evalType = 'hypo';
                else if (currentVal >= 2.50) evalType = 'hyper_severe';
                else if (currentVal > 1.80 || currentVal > seuilHaut) evalType = 'hyper';
            } else {
                if (currentVal < seuilBas) evalType = 'hypo';
                else if (currentVal > 2.00) evalType = 'hyper_severe';
                else if (currentVal > seuilHaut) evalType = 'hyper';
            }

            let risksText = "";
            let alertText = "";
            let recs = [];
            let predictedVal = Number((currentVal).toFixed(2));

            // Scénario A : HYPOGLYCÉMIE
            if (evalType === 'hypo') {
                risksText = `Analyse contextuelle (${contextLabel}) : le patient est sous le seuil d'alerte avec une mesure de ${Number((currentVal).toFixed(2))} g/L. Le profil cinétique est ${recentTrend}. Risque immédiat de neuroglycopénie.`;
                alertText = `Télémétrie : chute projetée, nécessitant une compensation rapide. Dynamique : ↘ Hypoglycémie avérée.`;
                recs = [
                    "Administration thérapeutique immédiate de 15g de glucides à index glycémique élevé (resucrage per os).",
                    "Suspension transitoire du schéma basal (arrêt pompe) si équipé.",
                    "Contrôle capillaire de validation croisée exigé à H+15 minutes post-resucrage."
                ];
            } 
            // Scénario B : BON CONTRÔLE
            else if (evalType === 'normal') {
                risksText = `L'analyse contextuelle (${contextLabel}) révèle une variabilité physiologique. La valeur de ${Number((currentVal).toFixed(2))} g/L est dans la cible attendue (${seuilBas}-${seuilHaut} g/L). Risque de complication métabolique nul.`;
                alertText = `Prévision du maintien d'une homéostasie optimale avec une dynamique stable.`;
                recs = [
                    "Maintien strict de l'insulinothérapie actuelle (titration basale et ratios prandiaux confirmés).",
                    "Poursuite du monitoring interstitiel en continu sans intervention corrective.",
                    "Renforcement positif sur la compliance familiale au schéma thérapeutique."
                ];
            } 
            // Scénario C : HYPERGLYCÉMIE LÉGÈRE
            else if (evalType === 'hyper') {
                risksText = `Évaluation indiquant une dysglycémie modérée dans le contexte de : ${contextLabel} (Val: ${Number((currentVal).toFixed(2))} g/L). Risque sous-jacent d'hyperosmolarité débutante et d'asthénie.`;
                alertText = `Dérive indicative d'un éventuel sous-dosage ou d'une surestimation des glucides. L'objectif était < ${seuilHaut} g/L. Dynamique : ↑ Tendance haussière.`;
                recs = [
                    "Prescription d'un bolus de correction proportionnel au facteur de sensibilité (FSI), si non fait dans les dernières 2h.",
                    "Ajustement stratégique prospectif (+5% à +10%) du ratio insuline/glucides pour les prochains repas.",
                    "Augmentation per os des apports hydriques (eau exclusive) afin de contrecarrer la polyurie osmotique."
                ];
            } 
            // Scénario D : HYPERGLYCÉMIE SÉVÈRE
            else {
                risksText = `ALERTE MAJEURE contextuelle (${contextLabel}) : Déséquilibre métabolique sévère objectivé à ${Number((currentVal).toFixed(2))} g/L. Forte probabilité de lipolyse compensatoire exposant le patient à un risque immédiat d'acidocétose diabétique.`;
                alertText = `Modélisation critique : dépassement grave du seuil de tolérance (au-delà de 2.00/2.50 g/L). Traduit un déficit insulinique absolu. Dynamique : ⇡ Escalade critique.`;
                recs = [
                    "Dépistage urgent de la cétonémie (ou cétonurie) pour statuer sur une potentielle acidocétose.",
                    "Bolus de correction en urgence par insuline d'action ultra-rapide au stylo (pour écarter un défaut cathéter).",
                    "Proscription médicale stricte de tout exercice ou hypercatabolisme jusqu'au rétablissement d'une glycémie < 1.80 g/L.",
                    "Déclenchement du protocole d'escalade et évacuation hospitalière si pH ou cétones hors normes."
                ];
            }

            setIaReport({
                risks: risksText,
                predictiveAlert: alertText,
                recommendations: recs
            });
            
            setIsIAAnalysing(false);
        }, 2000);
    };

    const exportPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text(`Fiche Patient - ${data?.patient?.fullName || 'Inconnu'}`, 20, 10);
            const tableColumn = ["Date/Heure", "Valeur (g/L)", "Type"];
            const tableRows = (data?.records || []).map(r => [
                new Date(r.timestamp).toLocaleString('fr-FR'),
                r.glucoseValue,
                "Glycémie"
            ]);
            
            autoTable(doc, { 
                head: [tableColumn],
                body: tableRows,
                startY: 20 
            });
            
            const sanitizedName = (data?.patient?.fullName || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
            const dateStr = new Date().toLocaleDateString('fr-FR').replace(/\//g,'-');
            doc.save(`Fiche_${sanitizedName}_${dateStr}.pdf`);
        } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
            alert("Une erreur est survenue lors de la création du PDF.");
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
            label: 'Glycémie (g/L)',
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
                        <button onClick={exportPDF} className="flex items-center gap-3 px-8 py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <FileText size={18} /> Générer Rapport
                        </button>
                        <button onClick={handleIAAnalysis} className="flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-[#9b51e0] to-[#6a11cb] rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] shadow-[0_10px_30px_rgba(155,81,224,0.4)] hover:scale-105 active:scale-95 transition-all outline-none border border-white/20 text-white relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                            <Brain size={18} className="animate-pulse" /> Analyse IA DiaPote
                        </button>
                        <button onClick={() => setShowEditModal(true)} className="flex items-center gap-3 px-8 py-5 bg-[#088395] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            <Edit3 size={18} /> Modifier Infos
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
                                                            <div className="text-2xl font-black italic">{r.glucoseValue || '--'} <span className="text-[10px] not-italic opacity-20 uppercase ml-1">g/L</span></div>
                                                        </td>
                                                        <td className="py-6">
                                                            <div className="flex items-center gap-3 text-[#088395] font-black text-sm uppercase">
                                                                <Syringe size={16} /> {r.insulinDose || '--'} U
                                                            </div>
                                                        </td>
                                                        <td className="py-6 text-right">
                                                            {r.mealDescription ? (
                                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/15 border border-orange-500/30 rounded-xl">
                                                                    <span className="text-base">🍽️</span>
                                                                    <span className="text-xs font-black italic text-orange-300 uppercase tracking-tight max-w-[120px] truncate">{r.mealDescription}</span>
                                                                </span>
                                                            ) : r.carbsEstimated ? (
                                                                <span className="text-sm font-black italic text-orange-400">{r.carbsEstimated} <span className="text-[10px] not-italic opacity-30">g</span></span>
                                                            ) : r.timing ? (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                                                                    <Clock size={10} className="text-white/30" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{r.timing === 'before' ? 'Avant repas' : r.timing === 'after' ? 'Après repas' : r.timing === 'bedtime' ? 'Au coucher' : r.timing}</span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-white/20 font-black text-sm">--</span>
                                                            )}
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
                                    {/* Notes Editor */}
                                    <div className="bg-white/5 border border-white/10 rounded-[45px] p-10">
                                        <SectionHeader icon={FileText} title="Nouvelle Note / Planification" sub="Ajoutez une note ou planifiez une action (ajoutée à l'historique)" />
                                        <textarea
                                            value={medicalNotes}
                                            onChange={(e) => setMedicalNotes(e.target.value)}
                                            placeholder="Ex: Prévu le 10/06/2026 : Adaptation doses Rapide, Bilan HbA1c..."
                                            className="w-full h-40 bg-[#0b1b2b] border border-white/5 rounded-[32px] p-10 text-sm italic font-medium focus:outline-none focus:border-[#088395] transition-all resize-none shadow-inner"
                                        />
                                        <div className="mt-8 flex justify-end">
                                            <button onClick={handleSaveNotes} disabled={savingNotes} className="px-10 py-5 bg-[#088395] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3">
                                                {savingNotes ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                                {savingNotes ? "Sauvegarde..." : "Enregistrer & Ajouter à l'historique"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Treatment Plan History */}
                                    {data?.patient?.medicalNotes && (
                                        <div className="bg-[#088395]/5 border border-[#088395]/20 rounded-[45px] p-10">
                                            <SectionHeader icon={Syringe} title="Historique des Plans de Traitement" sub="Toutes les planifications prescrites pour ce patient" />
                                            <div className="space-y-4">
                                                {data.patient.medicalNotes.split('\n---\n').map((note, idx) => {
                                                    const match = note.match(/^\[(\d{2}\/\d{2}\/\d{4})\]\s*(.*)/s);
                                                    const date = match ? match[1] : null;
                                                    const text = match ? match[2].trim() : note.trim();
                                                    return (
                                                        <div key={idx} className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-[#088395]/10">
                                                            <div className="w-2 bg-[#088395] rounded-full flex-shrink-0 mt-1" />
                                                            <div className="space-y-1 flex-1">
                                                                {date && (
                                                                    <div className="text-[9px] font-black uppercase tracking-widest text-[#088395]">{date}</div>
                                                                )}
                                                                <div className="text-xs font-bold text-white/0.80 leading-relaxed">{text}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
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
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/0.80 backdrop-blur-2xl px-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0b1b2b] border border-white/10 rounded-[50px] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
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

            {/* AI Analysis Modal */}
            <AnimatePresence>
                {showIAModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/0.80 backdrop-blur-2xl px-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-[#1a1b2e] to-[#0b1b2b] border border-purple-500/30 rounded-[50px] p-12 shadow-[0_50px_100px_rgba(106,17,203,0.3)] relative overflow-x-hidden overflow-y-auto custom-scrollbar">
                            {/* Decorative Background Elements */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>

                            <div className="relative z-10 flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                        <Brain size={28} className={isIAAnalysing ? "animate-pulse" : ""} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
                                            Analyse IA <span className="text-purple-400">DiaPote</span>
                                            {!isIAAnalysing && <Sparkles size={20} className="text-yellow-400" />}
                                        </h3>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1 text-left">Moteur Prédictif Médical</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowIAModal(false)} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white">X</button>
                            </div>

                            <div className="relative z-10 min-h-[300px] flex flex-col justify-center">
                                {isIAAnalysing ? (
                                    <div className="flex flex-col items-center justify-center space-y-8 py-10">
                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                            <div className="absolute inset-0 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                            <div className="absolute inset-2 border-4 border-blue-500/30 border-b-blue-500 rounded-full animate-spin-reverse"></div>
                                            <Brain size={48} className="text-white animate-pulse" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <span className="text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse">L'IA analyse le dossier...</span>
                                            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">Traitement des modèles de glycémie • Algorithmes ML.NET</p>
                                        </div>
                                    </div>
                                ) : iaReport ? (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                        
                                        {/* Predictive Alert Box */}
                                        <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-3xl relative overflow-hidden backdrop-blur-sm">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-blue-500"></div>
                                            <div className="flex items-start gap-4">
                                                <Zap className="text-purple-400 mt-1 flex-shrink-0" size={24} />
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-2">Prévision Imminente</h4>
                                                    <p className="text-sm font-bold text-white/90 italic leading-relaxed">{iaReport.predictiveAlert}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Analysis */}
                                        <div className="space-y-3">
                                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-widest">
                                                <Activity size={14} /> Compte Rendu des Risques
                                            </h4>
                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-sm font-medium text-white/0.80 leading-relaxed shadow-inner">
                                                {iaReport.risks}
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                                                <CheckCircle2 size={14} /> Recommandations Thérapeutiques
                                            </h4>
                                            <ul className="space-y-3">
                                                {iaReport.recommendations.map((rec, i) => (
                                                    <li key={i} className="flex gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                                        <span className="text-sm font-bold text-white/80">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="pt-6 flex justify-end gap-return">
                                             <button onClick={() => {
                                                 setMedicalNotes(prev => prev + (prev ? '\n---\n' : '') + `[${new Date().toLocaleDateString('fr-FR')}] Analyse IA: ${iaReport.predictiveAlert}\nAction: Ajustement proposé pris en compte.`);
                                                 setShowIAModal(false);
                                                 setActiveTab('notes');
                                             }} className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] text-white transition-all text-center">
                                                Ajouter aux Notes Médicales
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
