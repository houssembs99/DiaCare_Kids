"use client";

import React, { useState, useEffect, use } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Shield, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

// Remplacez par votre clé publique Stripe (pk_test_...)
const stripePromise = loadStripe('pk_test_51TYX9vGhy31SpsoXnL1HYbEqtdREaoTOyrHyb7AqVnf9zLMzeMwmRWpVdNS36xa1gVP72cTnPgqoFUJiqxEKFvlr00J57zoT62');

const CheckoutForm = ({ amount, planName, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/payment-success', // Added return_url to prevent Stripe errors for cards requiring 3D secure.
            },
            redirect: 'if_required',
        });

        if (paymentError) {
            setError(paymentError.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent);
        } else {
            setError("Une erreur inattendue est survenue.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <PaymentElement 
                    options={{
                        layout: "tabs",
                        style: {
                            base: {
                                color: '#ffffff',
                                fontFamily: 'Inter, sans-serif',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                        },
                    }} 
                />
            </div>

            {error && (
                <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl flex items-center gap-3 text-accent text-sm font-bold">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="w-full py-5 bg-[#1E88E5] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-[#1E88E5]/0.80 transition-all shadow-xl disabled:opacity-50"
            >
                {isProcessing ? "Traitement..." : `Payer ${(amount / 100).toFixed(2)} €`}
            </button>
        </form>
    );
};

export default function CustomCheckoutPage({ searchParams }) {
    const resolvedSearchParams = use(searchParams);
    const [clientSecret, setClientSecret] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [stripeError, setStripeError] = useState(null);
    
    const amount = resolvedSearchParams?.amount ? parseInt(resolvedSearchParams.amount) : 19999;
    const planName = resolvedSearchParams?.plan || "Clinique";
    
    // Plans that are managed by clinics directly — no Stripe payment
    const isClinicManagedPlan = amount === 0 || planName === 'Sous Clinique';

    useEffect(() => {
        if (isClinicManagedPlan) return; // Don't create Stripe intent for clinic-managed plans
        // Demande au backend le clientSecret (l'intention de paiement)
        api.post('/Payments/create-payment-intent', { amount })
            .then(res => setClientSecret(res.data.clientSecret))
            .catch(err => {
                console.error("Erreur d'initialisation", err.response?.data || err.message);
                const serverMsg = err.response?.data?.error || err.response?.statusText || err.message;
                setStripeError(`Impossible d'initialiser le paiement (${err.response?.status || 'Network'}): ${serverMsg}. Veuillez contacter l'administration.`);
            });
    }, [amount, isClinicManagedPlan]);

    const handleSuccess = async (paymentIntent) => {
        try {
            await api.post('/Payments/confirm-subscription', { 
                paymentIntentId: paymentIntent.id,
                amount: amount,
                planName: planName
            });
            setIsSuccess(true);
        } catch (err) {
            console.error("Erreur lors de la validation en base de données", err);
            alert("Paiement réussi mais erreur lors de l'activation du compte. Veuillez contacter l'admin.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1b2b] text-white flex flex-col items-center justify-center p-4">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => window.location.href = '/pricing'}
                className="absolute top-32 left-10 z-[100] flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Retour aux forfaits
            </motion.button>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-[#0b1b2b] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-[#1E88E5]/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-xs font-black uppercase tracking-widest mb-6 border border-success/20">
                        <Shield size={14} /> Paiement Sécurisé Intégré
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-2">Abonnement DiaCare</h1>
                    <p className="text-white/60 font-bold">Forfait {planName} • {(amount / 100).toFixed(2)} €</p>
                </div>

                {isClinicManagedPlan ? (
                    /* Clinic-managed plan — no Stripe needed */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 relative z-10">
                        <div className="w-24 h-24 bg-[#088395]/20 rounded-full flex items-center justify-center text-[#088395] mx-auto">
                            <CheckCircle size={48} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase text-[#088395] mb-2">Inscription Enregistrée !</h2>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Votre abonnement <strong className="text-white">{planName}</strong> est géré directement par votre clinique.<br /><br />
                                Le paiement se fait <strong className="text-white">auprès de la clinique choisie</strong>. Votre compte sera activé une fois que la clinique aura validé votre inscription.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2">
                            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-3">Prochaines étapes</p>
                            {['Contactez votre clinique pour le paiement', 'La clinique valide votre inscription', 'Votre accès est activé automatiquement'].map((step, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-white/0.70">
                                    <div className="w-6 h-6 rounded-full bg-[#088395]/20 text-[#088395] flex items-center justify-center text-xs font-black">{i + 1}</div>
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => window.location.href = '/auth'} 
                            className="w-full py-4 bg-[#088395] hover:bg-[#088395]/0.80 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg"
                        >
                            Se Connecter
                        </button>
                    </motion.div>
                ) : isSuccess ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center text-success mx-auto">
                            <CheckCircle size={48} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase text-success mb-2">Paiement Réussi !</h2>
                            <p className="text-white/60 text-sm">Votre abonnement a été activé avec succès. Vous pouvez désormais accéder à toutes les fonctionnalités.</p>
                        </div>
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-black uppercase tracking-widest transition-all"
                        >
                            Retour au Dashboard
                        </button>
                    </motion.div>
                ) : stripeError ? (
                    <div className="relative z-10 text-center space-y-4">
                        <div className="bg-accent/10 border border-accent/20 p-5 rounded-2xl flex items-start gap-3 text-accent">
                            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                            <p className="text-sm font-bold text-left">{stripeError}</p>
                        </div>
                        <button onClick={() => window.location.href = '/auth'} className="w-full py-4 bg-white/10 border border-white/10 rounded-xl font-black uppercase tracking-widest text-sm text-white hover:bg-white/20 transition-all">
                            Retour à la connexion
                        </button>
                    </div>
                ) : clientSecret ? (
                    <div className="relative z-10">
                        {/* Le composant Elements permet à CheckoutForm d'accéder au contexte Stripe */}
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                            <CheckoutForm amount={amount} planName={planName} onSuccess={handleSuccess} />
                        </Elements>
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center opacity-50 relative z-10">
                        <div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">Connexion à Stripe...</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
