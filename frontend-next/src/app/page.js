"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, MapPin, Phone, Mail, X, Building2,
  Stethoscope, Users, Gamepad2, ShieldCheck, Heart,
  Smartphone, Laptop, Brain, CheckCircle2, Quote
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// Infinite marquee component for clinics
function ClinicsMarquee({ clinics }) {
  const trackRef = useRef(null);
  // Duplicate the list for seamless loop
  const items = [...clinics, ...clinics];

  return (
    <div className="overflow-hidden w-full relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
      <div
        ref={trackRef}
        className="flex gap-6 w-max"
        style={{
          animation: `marquee ${Math.max(clinics.length * 4, 20)}s linear infinite`,
        }}
      >
        {items.map((clinic, idx) => (
          <div
            key={`${clinic.id ?? idx}-${idx}`}
            className="flex-shrink-0 w-56 bg-white/5 border border-white/10 rounded-[28px] p-6 flex flex-col items-center gap-4 hover:border-[#088395]/40 hover:bg-white/10 transition-all"
          >
            {clinic.avatarUrl ? (
              <img
                src={clinic.avatarUrl}
                alt={clinic.fullName}
                className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className={`w-20 h-20 rounded-2xl bg-[#088395]/10 border border-[#088395]/20 flex items-center justify-center text-[#088395] ${clinic.avatarUrl ? 'hidden' : 'flex'}`}
            >
              <Building2 size={36} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-white uppercase tracking-tight leading-tight line-clamp-2">{clinic.fullName}</p>
              {clinic.clinicType && (
                <p className="text-[10px] text-[#088395] font-bold uppercase tracking-widest mt-1">{clinic.clinicType}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default function LandingPage() {
  const { t, lang } = useLanguage();
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    api.get('/Clinics')
      .then(res => setClinics(res.data || []))
      .catch(() => setClinics([]));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className={cn("flex flex-col bg-[#0b1b2b] text-white overflow-x-hidden", lang === 'ar' && "font-arabic")}>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen pt-40 pb-20 px-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#088395]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFB300]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants} className="flex justify-center mb-8">
              <div className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md text-white/80">
                <Sparkles size={16} className="text-[#FFB300]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('landing.secure')} & {t('landing.standard')}</span>
              </div>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[1.1] uppercase mb-8">
              {t('hero.title')}<br />
              <span className="text-premium italic underline decoration-white/10 underline-offset-8">
                {t('hero.titleItalic')}
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-lg lg:text-2xl text-white/60 font-medium leading-relaxed mb-12 italic">
              "{t('hero.description')}"
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/auth" className="btn-apple flex items-center gap-4 group w-full sm:w-auto justify-center">
                {t('hero.start')}
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <button className="btn-apple-secondary flex items-center gap-4 group w-full sm:w-auto justify-center">
                {t('hero.discover')}
                <Building2 size={20} className="text-[#FFB300]" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. WHY DIACARE KIDS? SECTION */}
      <section className="py-32 px-6 relative bg-white/2">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="text-center mb-24">
            <motion.h2 variants={itemVariants} className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter mb-4">
              {t('landing.why')}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">
              {t('landing.whyDesc')}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: t('landing.doctors'), desc: t('landing.doctorsDesc'), icon: <Stethoscope size={40} />, color: "text-[#1E88E5]", bg: "bg-[#1E88E5]/10" },
              { title: t('landing.parents'), desc: t('landing.parentsDesc'), icon: <Users size={40} />, color: "text-[#088395]", bg: "bg-[#088395]/10" },
              { title: t('landing.kids'), desc: t('landing.kidsDesc'), icon: <Gamepad2 size={40} />, color: "text-[#FFB300]", bg: "bg-[#FFB300]/10" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white/5 border border-white/10 rounded-[40px] p-12 text-center group hover:bg-white/10 transition-all hover:border-white/20"
              >
                <div className={cn("w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform", feature.bg, feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{feature.title}</h3>
                <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. UNIQUE APPROACH SECTION */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#FFB300]/10 border border-[#FFB300]/20 rounded-full text-[#FFB300] mb-8">
              <Brain size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('landing.unique')}</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter leading-tight mb-8">
              {t('landing.uniqueDesc')}
            </h2>
            <div className="space-y-6">
              {[
                { t: "Technologie prédictive par IA", i: <Smartphone size={18} /> },
                { i: <Laptop size={18} />, t: "Portail médical haute précision" },
                { i: <Sparkles size={18} />, t: "Pédagogie par Réalité Augmentée" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-white/50 font-bold uppercase text-xs tracking-widest">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FFB300]">{item.i}</div>
                  {item.t}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Multi-device simulation UI */}
            <div className="relative z-10 p-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] shadow-6xl lg:-rotate-6 hover:rotate-0 transition-transform duration-1000">
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200"
                alt="Technology"
                className="rounded-[32px] opacity-80"
              />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#088395] rounded-full blur-[100px] opacity-20" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. EMOTIONAL SECTION */}
      <section className="py-32 px-6 relative bg-white/5 border-y border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-32 h-32 rounded-full border-4 border-[#FFB300] p-1 mb-12 relative"
          >
            <img
              src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=400&auto=format&fit=crop"
              alt="Child Smiling"
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FFB300] rounded-full flex items-center justify-center shadow-xl">
              <Heart size={20} className="text-black" fill="currentColor" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Quote size={80} className="absolute -top-16 -left-16 text-white/5" />
            <h3 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none mb-6">
              "{t('landing.emotional')}"
            </h3>
            <div className="w-20 h-1 bg-[#FFB300] mx-auto rounded-full" />
          </motion.div>
        </div>
      </section>


      {/* 6. CLINICS SECTION — Dynamic Marquee */}
      <section className="py-32 px-0 bg-[#0b1b2b] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-5xl font-black tracking-tight leading-none uppercase italic text-white/40"
          >
            Nos <span className="text-white underline decoration-[#088395]">Cliniques</span> Partenaires
          </motion.h2>
          {clinics.length === 0 && (
            <p className="text-white/20 text-sm font-bold uppercase tracking-widest mt-6">Aucune clinique partenaire pour le moment.</p>
          )}
        </div>
        {clinics.length > 0 && (
          <ClinicsMarquee clinics={clinics} />
        )}
      </section>

      {/* 7. FINAL CTA SECTION */}
      <section className="py-40 px-6 relative overflow-hidden bg-gradient-to-b from-[#0b1b2b] to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(8,131,149,0.3),transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none mb-12">
            {t('landing.join')}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/auth" className="btn-apple !px-12 !py-6 !text-lg w-full sm:w-auto">
              {t('landing.createAccount')}
            </Link>
            <button className="btn-apple-secondary !px-12 !py-6 !text-lg w-full sm:w-auto">
              {t('landing.contactTeam')}
            </button>
          </div>
        </div>
      </section>

      {/* MODAL (Kept for clinic details) */}
      <AnimatePresence>
        {selectedClinic && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedClinic(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-4xl bg-[#0b1b2b] border border-white/10 rounded-[48px] overflow-hidden shadow-6xl z-10 flex flex-col md:flex-row">
              <button onClick={() => setSelectedClinic(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white hover:text-black transition-all z-30"><X size={20} /></button>
              <div className="md:w-1/2 h-64 md:h-auto"><img src={selectedClinic.photo} className="w-full h-full object-cover" /></div>
              <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center space-y-6">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white leading-none">{selectedClinic.name}</h2>
                <p className="text-sm text-white/50 leading-relaxed">{selectedClinic.description}</p>
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4"><MapPin size={18} className="text-[#FFB300]" /> <span className="text-xs font-bold">{selectedClinic.location}</span></div>
                  <div className="flex items-center gap-4"><Phone size={18} className="text-success" /> <span className="text-xs font-bold">{selectedClinic.phone}</span></div>
                  <div className="flex items-center gap-4"><Mail size={18} className="text-[#1E88E5]" /> <span className="text-xs font-bold text-white/30">{selectedClinic.email}</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
