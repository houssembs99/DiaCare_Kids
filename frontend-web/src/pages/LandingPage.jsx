import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Shield, Smartphone, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] -z-10" />

            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">DiaCare <span className="text-primary-400">Kids</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-slate-400">
                    <a href="#" className="hover:text-white transition-colors">Solution</a>
                    <a href="#" className="hover:text-white transition-colors">Pour les Médecins</a>
                    <a href="#" className="hover:text-white transition-colors">Réalité Augmentée</a>
                </div>
                <button className="px-6 py-2 bg-white text-slate-950 font-semibold rounded-full hover:bg-primary-100 transition-all">
                    Connexion
                </button>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        Nouveau : Module AR Educatif
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-6">
                        Suivre le diabète devient un <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">Jeu d'Enfant</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                        DiaCare Kids est la première plateforme intelligente qui accompagne les enfants, les parents et les médecins dans la gestion du diabète de type 1.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/25 group">
                            Commencer le suivi
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl font-bold transition-all">
                            Découvrir l'AR
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative"
                >
                    <div className="relative z-10 rounded-[2.5rem] border-8 border-slate-900 bg-slate-900 overflow-hidden shadow-2xl shadow-blue-500/20">
                        <div className="bg-slate-950 p-6 h-[500px] flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <div className="h-8 w-32 bg-slate-800 rounded-lg animate-pulse" />
                                <div className="h-8 w-8 bg-slate-800 rounded-full animate-pulse" />
                            </div>
                            <div className="h-32 w-full bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-3xl border border-white/5 flex items-center justify-center">
                                <Activity className="w-12 h-12 text-primary-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-24 bg-slate-900 rounded-2xl border border-white/5" />
                                <div className="h-24 bg-slate-900 rounded-2xl border border-white/5" />
                            </div>
                            <div className="mt-auto h-12 w-full bg-primary-500 rounded-xl" />
                        </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
                </motion.div>
            </main>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-900">
                <div className="grid md:grid-cols-3 gap-12">
                    <FeatureCard
                        icon={<Heart className="w-6 h-6 text-pink-400" />}
                        title="Suivi Quotidien"
                        description="Interface intuitive pour que les parents puissent noter glycémie, insuline et repas en quelques secondes."
                    />
                    <FeatureCard
                        icon={<Smartphone className="w-6 h-6 text-blue-400" />}
                        title="Réalité Augmentée"
                        description="L'enfant apprend le rôle de l'insuline à travers des simulations AR immersives et ludiques."
                    />
                    <FeatureCard
                        icon={<Shield className="w-6 h-6 text-green-400" />}
                        title="Aide à la Décision"
                        description="Algorithmes intelligents qui alertent et guident en cas d'hypoglycémie ou d'hyperglycémie."
                    />
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
