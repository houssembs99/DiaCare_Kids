"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Send, FileText, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useBranding } from '@/lib/BrandingContext';

// ─── Coordonnées DiaCare Kids (dynamiques) ────────────────────────────────
const DIACARE_INFO = {
    name: "DiaCare Kids",
    address: "12 Avenue Habib Bourguiba, 1000 Tunis, Tunisie",
    phone: "+216 71 000 000",
    email: "contact@diacarekids.com",
    website: "www.diacarekids.com",
    logo: "https://res.cloudinary.com/dieh0inyl/image/upload/v1/diacare/logo_diacare"
};

// ─── Génération du HTML de la facture ──────────────────────────────────────
function generateInvoiceHTML({
    invoiceNumber,
    clientName,
    clientEmail,
    clientPhone,
    clientAddress,
    clientRole,
    planName,
    planDetails,
    dateInscription,
    dateDebut,
    dateFin,
    duree,
    amount,
    currency,
    issuerInfo,
    isPaid,
    platformLogoUrl
}) {
    const currencySymbol = currency === 'eur' ? '€' : currency === 'usd' ? '$' : currency === 'tnd' ? 'DT' : currency.toUpperCase();
    const formattedAmount = parseFloat(amount).toFixed(2);
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1a1a2e; }
            .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #0b1b2b 0%, #1a3a5c 100%); color: white; padding: 40px; display: flex; justify-content: space-between; align-items: flex-start; }
            .header-left h1 { font-size: 28px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
            .header-left p { font-size: 11px; opacity: 0.6; margin-top: 4px; letter-spacing: 1px; }
            .header-right { text-align: right; font-size: 11px; line-height: 1.8; opacity: 0.8; }
            .header-right strong { opacity: 1; font-size: 13px; }
            .invoice-meta { display: flex; justify-content: space-between; padding: 30px 40px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
            .meta-block { }
            .meta-block .label { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
            .meta-block .value { font-size: 14px; font-weight: 800; color: #0b1b2b; }
            .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .body-section { padding: 40px; }
            .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #94a3b8; font-weight: 800; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; }
            .client-info { display: flex; gap: 40px; margin-bottom: 30px; }
            .client-info .col { flex: 1; }
            .info-row { margin-bottom: 10px; }
            .info-row .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700; }
            .info-row .val { font-size: 13px; font-weight: 600; color: #1a1a2e; margin-top: 2px; }
            .table-container { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #0b1b2b; color: white; padding: 14px 20px; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; text-align: left; }
            thead th:last-child { text-align: right; }
            tbody td { padding: 16px 20px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
            tbody td:last-child { text-align: right; font-weight: 800; }
            .total-row { background: linear-gradient(135deg, #0b1b2b 0%, #1a3a5c 100%); }
            .total-row td { color: white !important; font-size: 16px !important; font-weight: 900 !important; padding: 20px !important; }
            .dates-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 20px 0 30px; }
            .date-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
            .date-card .date-label { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700; }
            .date-card .date-value { font-size: 14px; font-weight: 800; color: #0b1b2b; margin-top: 6px; }
            .footer { background: #f8fafc; border-top: 2px solid #e2e8f0; padding: 30px 40px; text-align: center; }
            .footer p { font-size: 10px; color: #94a3b8; line-height: 1.8; }
            .footer .brand { font-weight: 900; color: #0b1b2b; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
            .accent { color: #088395; }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="header-left">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                        ${platformLogoUrl ? `<img src="${platformLogoUrl}" alt="Logo" style="max-height: 50px; max-width: 150px; object-fit: contain; border-radius: 8px;">` : ''}
                        <h1 style="margin: 0;">${issuerInfo?.name || DIACARE_INFO.name}</h1>
                    </div>
                    <p>FACTURE D'ABONNEMENT</p>
                </div>
                <div class="header-right">
                    <strong>${issuerInfo?.name || DIACARE_INFO.name}</strong><br>
                    ${issuerInfo?.address || DIACARE_INFO.address}<br>
                    ${issuerInfo?.phone || DIACARE_INFO.phone}<br>
                    ${issuerInfo?.email || DIACARE_INFO.email}
                </div>
            </div>

            <!-- Invoice Meta -->
            <div class="invoice-meta">
                <div class="meta-block">
                    <div class="label">Numéro de facture</div>
                    <div class="value">${invoiceNumber}</div>
                </div>
                <div class="meta-block">
                    <div class="label">Date d'émission</div>
                    <div class="value">${today}</div>
                </div>
                <div class="meta-block">
                    <div class="label">Statut</div>
                    <span class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}">${isPaid ? '✓ Payée' : '⏳ En Attente'}</span>
                </div>
            </div>

            <!-- Body -->
            <div class="body-section">
                <!-- Client Info -->
                <div class="section-title">Informations du Client</div>
                <div class="client-info">
                    <div class="col">
                        <div class="info-row"><div class="lbl">Nom complet</div><div class="val">${clientName}</div></div>
                        <div class="info-row"><div class="lbl">Email</div><div class="val">${clientEmail}</div></div>
                        <div class="info-row"><div class="lbl">Téléphone</div><div class="val">${clientPhone || 'Non renseigné'}</div></div>
                    </div>
                    <div class="col">
                        <div class="info-row"><div class="lbl">Type de compte</div><div class="val accent">${clientRole}</div></div>
                        <div class="info-row"><div class="lbl">Adresse</div><div class="val">${clientAddress || 'Non renseignée'}</div></div>
                    </div>
                </div>

                <!-- Dates -->
                <div class="section-title">Période d'Abonnement</div>
                <div class="dates-grid">
                    <div class="date-card">
                        <div class="date-label">Date d'inscription</div>
                        <div class="date-value">${dateInscription}</div>
                    </div>
                    <div class="date-card">
                        <div class="date-label">Début abonnement</div>
                        <div class="date-value">${dateDebut}</div>
                    </div>
                    <div class="date-card">
                        <div class="date-label">Fin abonnement</div>
                        <div class="date-value">${dateFin}</div>
                    </div>
                </div>

                <!-- Détail Facturation -->
                <div class="section-title">Détail de la Facturation</div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Durée</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>Forfait ${planName}</strong><br>
                                    <span style="font-size: 11px; color: #64748b;">${planDetails || 'Accès complet à la plateforme DiaCare Kids'}</span>
                                </td>
                                <td>${duree}</td>
                                <td>${formattedAmount} ${currencySymbol}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="2">TOTAL À PAYER</td>
                                <td>${formattedAmount} ${currencySymbol}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                ${platformLogoUrl ? `<img src="${platformLogoUrl}" alt="Logo" style="max-height: 32px; max-width: 120px; object-fit: contain; margin: 0 auto 10px; display: block; opacity: 0.7;">` : ''}
                <p class="brand">${issuerInfo?.name || DIACARE_INFO.name}</p>
                <p>
                    Cette facture a été générée automatiquement par la plateforme ${issuerInfo?.name || DIACARE_INFO.name}.<br>
                    Pour toute question, contactez-nous à <span class="accent">${issuerInfo?.email || DIACARE_INFO.email}</span><br>
                    ${issuerInfo?.website || DIACARE_INFO.website}
                </p>
            </div>
        </div>
    </body>
    </html>`;
}

// ─── Composant Modal de Facture ────────────────────────────────────────────
export default function InvoiceGenerator({ isOpen, onClose, user, plan, issuerInfo }) {
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    const iframeRef = useRef(null);
    const { branding } = useBranding();
    const platformLogoUrl = branding.logoUrl;

    if (!isOpen || !user) return null;

    // Use branding info as default if issuerInfo is not provided
    const displayInfo = {
        name: issuerInfo?.name || "DiaCare Kids",
        address: issuerInfo?.address || branding.address,
        phone: issuerInfo?.phone || branding.phone,
        email: issuerInfo?.email || branding.email,
        website: issuerInfo?.website || branding.website
    };

    const now = new Date();
    const invoiceNumber = `INV-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${(user.id || 'xxx').slice(-4).toUpperCase()}`;

    const dateInscription = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : now.toLocaleDateString('fr-FR');
    
    const subStartDate = user.subscription?.startDate ? new Date(user.subscription.startDate) : now;
    const dateDebut = subStartDate.toLocaleDateString('fr-FR');
    
    const subEndDate = user.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : new Date(now.getTime() + 30*24*60*60*1000);
    const dateFin = subEndDate.toLocaleDateString('fr-FR');

    const diffMs = subEndDate - subStartDate;
    const diffDays = Math.ceil(diffMs / (1000*3600*24));
    const duree = diffDays > 300 ? '1 An' : `${diffDays} Jours`;

    const planName = plan?.name || user.subscription?.planType || 'Standard';
    const planDetails = plan?.description || `Abonnement ${planName} - ${user.role || 'Utilisateur'}`;
    const amount = plan?.price || 0;
    const currency = (plan?.currency || 'eur').toLowerCase() === 'dt' ? 'tnd' : (plan?.currency || 'eur').toLowerCase();
    const currencySymbol = currency === 'eur' ? '€' : currency === 'usd' ? '$' : currency === 'tnd' ? 'DT' : currency.toUpperCase();

    const invoiceHTML = generateInvoiceHTML({
        invoiceNumber,
        clientName: user.fullName || 'Client',
        clientEmail: user.email || '',
        clientPhone: user.contactNumber || '',
        clientAddress: user.address || '',
        clientRole: user.role || 'Utilisateur',
        planName,
        planDetails,
        dateInscription,
        dateDebut,
        dateFin,
        duree,
        amount,
        currency,
        issuerInfo: displayInfo,
        isPaid: user.subscription?.isActive === true,
        platformLogoUrl
    });

    const handleDownloadPDF = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const handleSendEmail = async () => {
        setIsSending(true);
        setSent(false);
        try {
            await api.post('/Invoices/send', {
                toEmail: user.email,
                toName: user.fullName || 'Client',
                subject: `Facture ${invoiceNumber} - ${issuerInfo?.name || DIACARE_INFO.name}`,
                htmlBody: invoiceHTML
            });
            setSent(true);
        } catch (err) {
            const errMsg = err.response?.data?.error || err.message;
            alert(`Erreur d'envoi : ${errMsg}`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    className="bg-[#0b1b2b] border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/20 text-[#088395] rounded-2xl flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tighter text-white">Facture {invoiceNumber}</h2>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{user.fullName} • {planName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="flex-1 overflow-auto p-4">
                        <iframe
                            ref={iframeRef}
                            srcDoc={invoiceHTML}
                            className="w-full h-[500px] rounded-2xl bg-white border border-white/10"
                            title="Aperçu Facture"
                        />
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-t border-white/10 bg-white/5 flex flex-wrap gap-4">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex-1 flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10"
                        >
                            <Download size={18} /> Télécharger PDF
                        </button>
                        <button
                            onClick={handleSendEmail}
                            disabled={isSending || sent}
                            className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#088395] hover:bg-[#066a7a] disabled:bg-[#088395]/50 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_10px_30px_rgba(8,131,149,0.3)]"
                        >
                            {sent ? (
                                <><CheckCircle size={18} /> Facture Envoyée !</>
                            ) : isSending ? (
                                <><Loader2 size={18} className="animate-spin" /> Envoi en cours...</>
                            ) : (
                                <><Send size={18} /> Envoyer par Email</>
                            )}
                        </button>
                    </div>

                    {/* Invoice Summary */}
                    <div className="px-6 pb-6 flex flex-wrap gap-4">
                        <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Montant</div>
                            <div className="text-xl font-black text-white mt-1">{parseFloat(amount).toFixed(2)} {currencySymbol}</div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Durée</div>
                            <div className="text-xl font-black text-white mt-1">{duree}</div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Statut</div>
                            <div className={`text-xl font-black mt-1 ${user.subscription?.isActive ? 'text-green-400' : 'text-yellow-400'}`}>
                                {user.subscription?.isActive ? 'Payée' : 'En Attente'}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
