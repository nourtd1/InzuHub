import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge } from '../components/ui';

export default function SignalementsPage() {
    const [signalements, setSignalements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Tous');

    const fetchSignalements = async () => {
        setLoading(true);
        let query = supabase
            .from('signalements')
            .select('*, proprieties:id_propriete(titre), utilisateurs(nom_complet)')
            .order('date_signalement', { ascending: false });

        if (filter === 'en_attente') query = query.eq('etat_traitement', 'en_attente');
        else if (filter === 'en_cours') query = query.eq('etat_traitement', 'en_cours');
        else if (filter === 'traite') query = query.eq('etat_traitement', 'traite');

        const { data, error } = await query;
        if (!error) setSignalements(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchSignalements();

        const sub = supabase.channel('admin-signalements-page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'signalements' }, fetchSignalements)
            .subscribe();

        return () => { sub.unsubscribe(); };
    }, [filter]);

    const handleIgnorer = async (id: string) => {
        if (!window.confirm("Ignorer ce signalement ?")) return;
        await supabase.from('signalements').update({ etat_traitement: 'traite' }).eq('id_signalement', id);
        alert('Signalement ignoré');
        fetchSignalements();
    };

    const handleSupprimerAnnonce = async (id_propriete: string, id_signalement: string) => {
        if (!window.confirm("🔴 ATTENTION : Supprimer définitivement cette annonce ?")) return;

        try {
            await supabase.from('proprietes').delete().eq('id_propriete', id_propriete);
            await supabase.from('signalements').update({ etat_traitement: 'traite' }).eq('id_signalement', id_signalement);
            alert('Annonce supprimée avec succès.');
            fetchSignalements();
        } catch (e) {
            console.error(e);
            alert('Erreur: impossible de supprimer l\'annonce.');
        }
    };

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'en_attente': return <Badge variant="warning">⏳ En attente</Badge>;
            case 'en_cours': return <Badge variant="default">🔍 En cours</Badge>;
            case 'traite': return <Badge variant="success">✅ Traité</Badge>;
            default: return <Badge variant="default">{statut}</Badge>;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Signalements</h1>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {['Tous', 'en_attente', 'en_cours', 'traite'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                    >
                        {f === 'Tous' ? 'Tous' :
                            f === 'en_attente' ? '⏳ En attente' :
                                f === 'en_cours' ? '🔍 En cours' :
                                    '✅ Traités'}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annonce signalée</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signalé par</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Chargement...</td></tr>
                            ) : signalements.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Aucun signalement trouvé.</td></tr>
                            ) : signalements.map((s) => (
                                <tr key={s.id_signalement} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {s.proprieties?.titre || 'Inconnu / Supprimée'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {s.motif}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {s.utilisateurs?.nom_complet}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(s.date_signalement).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(s.etat_traitement)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                                        {/* Fake action, ideal is linking to a public view or expanding the row */}
                                        {s.etat_traitement !== 'traite' && (
                                            <>
                                                <button onClick={() => handleIgnorer(s.id_signalement)} className="text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded-md transition-colors">
                                                    ✓ Ignorer
                                                </button>
                                                <button onClick={() => handleSupprimerAnnonce(s.id_propriete, s.id_signalement)} className="text-red-700 hover:text-red-800 bg-red-100 px-3 py-1 rounded-md transition-colors">
                                                    🗑 Supprimer l'annonce
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
