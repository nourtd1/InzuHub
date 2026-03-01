import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ZoomIn } from 'lucide-react';

export default function KycDetailModal({ demande, onClose, onProcessed }: { demande: any, onClose: () => void, onProcessed: () => void }) {
    const [rejectReason, setRejectReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [fullImage, setFullImage] = useState<string | null>(null);

    const [docRecto, setDocRecto] = useState<string | null>(null);
    const [docVerso, setDocVerso] = useState<string | null>(null);
    const [selfie, setSelfie] = useState<string | null>(null);

    useEffect(() => {
        const getSignedUrls = async () => {
            if (demande.url_recto) {
                const { data } = await supabase.storage.from('kyc-documents').createSignedUrl(demande.url_recto, 3600);
                if (data?.signedUrl) setDocRecto(data.signedUrl);
            }
            if (demande.url_verso) {
                const { data } = await supabase.storage.from('kyc-documents').createSignedUrl(demande.url_verso, 3600);
                if (data?.signedUrl) setDocVerso(data.signedUrl);
            }
            if (demande.url_selfie) {
                const { data } = await supabase.storage.from('kyc-documents').createSignedUrl(demande.url_selfie, 3600);
                if (data?.signedUrl) setSelfie(data.signedUrl);
            }
        };
        // Mark as en cours de review if pending
        if (demande.statut === 'en_attente') {
            supabase.from('kyc_demandes').update({ statut: 'en_cours_review' }).eq('id_demande', demande.id_demande).then();
        }
        getSignedUrls();
    }, [demande]);

    const handleApprouver = async () => {
        if (!window.confirm("Confirmer l'approbation de ce compte ?")) return;
        setSubmitting(true);
        try {
            await supabase.from('kyc_demandes').update({ statut: 'approuve' }).eq('id_demande', demande.id_demande);
            await supabase.from('utilisateurs').update({ statut_verification: true }).eq('id_utilisateur', demande.id_utilisateur);
            await supabase.functions.invoke('send-push-notification', {
                body: {
                    userId: demande.id_utilisateur,
                    title: '✅ Identité vérifiée !',
                    body: 'Votre compte InzuHub est maintenant certifié.',
                    data: { type: 'kyc_approved' }
                }
            });
            onProcessed();
            onClose();
            alert("✅ KYC approuvé pour " + demande.utilisateurs?.nom_complet);
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejeter = async () => {
        if (!rejectReason) {
            alert('Veuillez sélectionner ou saisir un motif de rejet.');
            return;
        }
        if (!window.confirm("Confirmer le rejet de ce KYC ?")) return;

        setSubmitting(true);
        try {
            await supabase.from('kyc_demandes').update({ statut: 'rejete', "motif_rejet": rejectReason }).eq('id_demande', demande.id_demande);
            await supabase.from('utilisateurs').update({ statut_verification: false }).eq('id_utilisateur', demande.id_utilisateur);
            await supabase.functions.invoke('send-push-notification', {
                body: {
                    userId: demande.id_utilisateur,
                    title: '❌ Vérification refusée',
                    body: `Votre vérification a été refusée. Motif : ${rejectReason}`,
                    data: { type: 'kyc_rejected' }
                }
            });
            onProcessed();
            onClose();
            alert("❌ KYC rejeté.");
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
                            <div>
                                <h3 className="text-xl leading-6 font-semibold text-gray-900" id="modal-title">
                                    KYC — {demande.utilisateurs?.nom_complet}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {demande.utilisateurs?.numero_telephone} • Soumis le {new Date(demande.date_soumission).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mt-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">PHOTOS DES DOCUMENTS</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Recto */}
                                <div className="relative border rounded-lg overflow-hidden bg-gray-50 group aspect-video">
                                    {docRecto ? (
                                        <img src={docRecto} alt="Recto" className="object-cover w-full h-full" />
                                    ) : <div className="flex items-center justify-center h-full text-gray-400">Chargement...</div>}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                        <span className="text-white text-sm font-medium">Carte ID (Recto)</span>
                                    </div>
                                    {docRecto && (
                                        <button onClick={() => setFullImage(docRecto)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="flex items-center bg-white text-gray-900 px-3 py-1.5 rounded-full text-sm font-medium"><ZoomIn size={16} className="mr-2" /> Agrandir</span>
                                        </button>
                                    )}
                                </div>

                                {/* Verso */}
                                <div className="relative border rounded-lg overflow-hidden bg-gray-50 group aspect-video">
                                    {docVerso ? (
                                        <img src={docVerso} alt="Verso" className="object-cover w-full h-full" />
                                    ) : <div className="flex items-center justify-center h-full text-gray-400">Non fourni / Chargement</div>}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                        <span className="text-white text-sm font-medium">Carte ID (Verso)</span>
                                    </div>
                                    {docVerso && (
                                        <button onClick={() => setFullImage(docVerso)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="flex items-center bg-white text-gray-900 px-3 py-1.5 rounded-full text-sm font-medium"><ZoomIn size={16} className="mr-2" /> Agrandir</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                {/* Selfie */}
                                <div className="relative border rounded-lg overflow-hidden bg-gray-50 group aspect-video">
                                    {selfie ? (
                                        <img src={selfie} alt="Selfie" className="object-cover w-full h-full" />
                                    ) : <div className="flex items-center justify-center h-full text-gray-400">Chargement...</div>}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                        <span className="text-white text-sm font-medium">Selfie avec ID</span>
                                    </div>
                                    {selfie && (
                                        <button onClick={() => setFullImage(selfie)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="flex items-center bg-white text-gray-900 px-3 py-1.5 rounded-full text-sm font-medium"><ZoomIn size={16} className="mr-2" /> Agrandir</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {demande.statut !== 'approuve' && demande.statut !== 'rejete' && (
                                <div className="mt-8 border-t border-gray-200 pt-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-4">DÉCISION</h4>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Motif de rejet (obligatoire si rejet)</label>
                                        <input
                                            list="motifs-list"
                                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-primary focus:border-primary"
                                            placeholder="Sélectionner ou saisir un motif..."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                        <datalist id="motifs-list">
                                            <option value="Photo ou document illisible" />
                                            <option value="Document expiré ou invalide" />
                                            <option value="Le selfie ne correspond pas au document" />
                                            <option value="Document d'identité non autorisé" />
                                        </datalist>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            disabled={submitting}
                                            onClick={handleRejeter}
                                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                        >
                                            ❌ Rejeter la demande
                                        </button>
                                        <button
                                            type="button"
                                            disabled={submitting}
                                            onClick={handleApprouver}
                                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            ✅ Approuver le compte
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {fullImage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95" onClick={() => setFullImage(null)}>
                    <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-gray-800"><X size={24} /></button>
                    <img src={fullImage} alt="Fullscreen View" className="max-w-full max-h-full object-contain" />
                </div>
            )}
        </div>
    );
}
