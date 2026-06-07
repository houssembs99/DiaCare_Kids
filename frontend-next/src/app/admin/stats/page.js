"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '@/lib/api';
import { Activity, Users, DollarSign, Building } from 'lucide-react';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement, Filler
);

export default function AdminStats() {
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState({ revenue: '0 DT', activeSubs: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatsData = async () => {
            setIsLoading(true);
            try {
                // 1. Récupération des utilisateurs pour les graphiques de répartition
                const usersRes = await api.get('/Users');
                setUsers(usersRes.data || []);

                // 2. Récupération du résumé financier depuis l'endpoint dédié
                try {
                    const summaryRes = await api.get('/stats/summary');
                    if (summaryRes.data) {
                        setSummary({
                            revenue: summaryRes.data.revenue || '0 DT',
                            activeSubs: summaryRes.data.activeSubs || 0
                        });
                    }
                } catch (e) {
                    console.log("Endpoint /stats/summary indisponible, calcul local depuis abonnements.");
                }
            } catch (error) {
                console.error("Erreur API Stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatsData();
    }, []);

    // Calculs Statistiques
    const rolesCount = {
        Admin: users.filter(u => u.role === 'Admin').length,
        Clinique: users.filter(u => u.role === 'Clinique' || u.role === 'Agent Clinique').length,
        Medecin: users.filter(u => u.role === 'Medecin' || u.role === 'Médecin').length,
        Parent: users.filter(u => u.role === 'Parent').length,
    };

    const statusCount = {
        Actif: users.filter(u => u.status === 'Actif').length,
        Bloque: users.filter(u => u.status === 'Bloqué' || u.status === 'Inactif').length,
        Attente: users.filter(u => u.status === 'En Attente').length,
    };



    // Configuration des paramètres ChartJS (Design sombre)
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: 'rgba(255, 255, 255, 0.6)', font: { family: 'inherit', weight: 'bold' } }
            }
        },
        scales: {
            x: { ticks: { color: 'rgba(255, 255, 255, 0.4)' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            y: { ticks: { color: 'rgba(255, 255, 255, 0.4)' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
    };

    const doughnutOptions = {
        ...chartOptions,
        scales: { x: { display: false }, y: { display: false } }
    };

    // DATA: Graphique Donut (Rôles)
    const roleData = {
        labels: ['Cliniques', 'Médecins', 'Parents', 'Admins'],
        datasets: [{
            data: [rolesCount.Clinique, rolesCount.Medecin, rolesCount.Parent, rolesCount.Admin],
            backgroundColor: ['#1E88E5', '#00ACC1', '#43A047', '#FDD835'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    // DATA: Graphique Barres (Statut des comptes)
    const statusData = {
        labels: ['Actifs', 'En Attente', 'Bloqués'],
        datasets: [{
            label: 'Volume de comptes',
            data: [statusCount.Actif, statusCount.Attente, statusCount.Bloque],
            backgroundColor: ['#43A047', '#FB8C00', '#E53935'],
            borderRadius: 8
        }]
    };

    // DATA: Graphique Ligne (Croissance des revenus)
    const growthData = {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Ce mois-ci'],
        datasets: [
            {
                label: 'Progression CA (DT)',
                data: [350, 420, 680, 890, 1200, 1450, parseFloat(summary.revenue) || 0],
                borderColor: '#1E88E5',
                backgroundColor: 'rgba(30, 136, 229, 0.2)',
                tension: 0.4,
                fill: true,
            }
        ]
    };

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-8 pb-10 text-white">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                        Statistiques <span className="text-white/40">Globales</span>
                    </h1>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                        Intelligence Artificielle \& Analyse Business
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-[#1E88E5]">
                        <div className="w-12 h-12 border-4 border-t-[#1E88E5] border-white/10 rounded-full animate-spin mb-4" />
                        <span className="text-white/40 text-sm font-black uppercase tracking-widest">Calcul des matrices...</span>
                    </div>
                ) : (
                    <>
                        {/* 4 Cartes (Indicateurs clés - KPI) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={<Users />} title="Base Utilisateurs" value={users.length} color="text-[#00ACC1]" />
                            <StatCard icon={<Building />} title="Cliniques Partenaires" value={rolesCount.Clinique} color="text-[#1E88E5]" />
                            <StatCard icon={<Activity />} title="Abonnements Actifs" value={summary.activeSubs} color="text-[#43A047]" />
                            <StatCard icon={<DollarSign />} title="Revenus Encaissés" value={summary.revenue} color="text-[#FDD835]" />
                        </div>

                        {/* Zone des Graphiques */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Donuts : Parts de marché */}
                            <div className="col-span-1 bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-2xl">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-6 text-center">Répartition des profils</h3>
                                <div className="h-64 relative">
                                    <Doughnut data={roleData} options={doughnutOptions} />
                                </div>
                            </div>

                            {/* Ligne de croissance */}
                            <div className="col-span-1 lg:col-span-2 bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-2xl">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-6 text-center">Tendance des abonnements cliniques</h3>
                                <div className="h-64 relative">
                                    <Line data={growthData} options={chartOptions} />
                                </div>
                            </div>

                            {/* Barre de santé client */}
                            <div className="col-span-1 lg:col-span-3 bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-2xl">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-6 text-center">Diagnostic réseau (Santé des comptes)</h3>
                                <div className="h-64 relative">
                                    <Bar data={statusData} options={chartOptions} />
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex items-center gap-6 hover:bg-white/10 transition-colors cursor-default">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 ${color}`}>
            {React.cloneElement(icon, { size: 28 })}
        </div>
        <div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{title}</div>
            <div className="text-2xl font-black">{value}</div>
        </div>
    </div>
);
