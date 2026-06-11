"use client";

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Bell } from 'lucide-react';

export default function AdminNotifications() {
    return (
        <DashboardLayout role="Admin">
            <div className="space-y-12 pb-10 text-white">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic">
                        Centre de <span className="text-white/40">Notifications</span>
                    </h1>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                        Alertes système et messages importants
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                        <Bell size={40} className="text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-white/0.80 mb-4">Aucune nouvelle alerte</h2>
                    <p className="text-sm font-bold text-white/40 max-w-md leading-relaxed">
                        Cette interface affichera les demandes d'assistance, les alertes de paiements échoués et les alertes médicales critiques nécessitant votre attention en tant qu'administrateur.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
