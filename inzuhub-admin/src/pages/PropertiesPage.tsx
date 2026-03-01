import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge } from '../components/ui';

export default function PropertiesPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatut, setFilterStatut] = useState('Tous');
    const [quartiers, setQuartiers] = useState<any[]>([]);
    const [filterQuartier, setFilterQuartier] = useState('Tous');

    const fetchProperties = async () => {
        setLoading(true);
        let query = supabase
            .from('proprietes')
            .select('*, utilisateurs(nom_complet), quartiers(nom_quartier), photos(*)')
            .order('date_publication', { ascending: false });

        if (filterStatut !== 'Tous') {
            query = query.eq('statut', filterStatut.toLowerCase());
        }

        if (filterQuartier !== 'Tous') {
            query = query.eq('id_quartier', filterQuartier);
        }

        const { data, error } = await query;
        if (!error) setProperties(data || []);
        setLoading(false);
    };

    useEffect(() => {
        const fetchQuartiers = async () => {
            const { data } = await supabase.from('quartiers').select('*');
            setQuartiers(data || []);
        };
        fetchQuartiers();
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [filterStatut, filterQuartier]);

    const handleSupprimer = async (id: string, titre: string) => {
        if (!window.confirm(`🔴 Supprimer l'annonce "${titre}" ?`)) return;

        try {
            const { error } = await supabase.from('proprietes').delete().eq('id_propriete', id);
            if (error) throw error;
            alert('Annonce supprimée.');
            fetchProperties();
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la suppression.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Annonces</h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <select
                        value={filterStatut}
                        onChange={e => setFilterStatut(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                    >
                        <option value="Tous">Tous (Statuts)</option>
                        <option value="Disponible">Disponibles</option>
                        <option value="En_cours">En cours (réservées)</option>
                        <option value="Loue">Louées</option>
                    </select>

                    <select
                        value={filterQuartier}
                        onChange={e => setFilterQuartier(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white max-w-xs"
                    >
                        <option value="Tous">Tous les quartiers</option>
                        {quartiers.map(q => (
                            <option key={q.id_quartier} value={q.id_quartier}>{q.nom_quartier}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <p className="text-gray-500">Chargement...</p>
                ) : properties.length === 0 ? (
                    <p className="text-gray-500">Aucune annonce trouvée.</p>
                ) : properties.map(p => (
                    <div key={p.id_propriete} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group relative">
                        <div className="h-48 bg-gray-100 relative">
                            {p.photos && p.photos.length > 0 ? (
                                <img src={p.photos[0].url_photo} alt="property" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">Pas de photo</div>
                            )}
                            <div className="absolute top-2 right-2 flex space-x-1">
                                {p.statut === 'disponible' && <Badge variant="success">Disponible</Badge>}
                                {p.statut === 'en_cours' && <Badge variant="warning">Réservé</Badge>}
                                {p.statut === 'loue' && <Badge variant="danger">Loué</Badge>}
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{p.titre}</h3>
                            <p className="text-gray-500 text-sm mb-2">{p.quartiers?.nom_quartier}</p>

                            <p className="text-primary font-bold text-lg mb-3">
                                {new Intl.NumberFormat('fr-RW').format(p.prix_mensuel)} RWF<span className="text-sm text-gray-500 font-normal"> /mois</span>
                            </p>

                            <div className="text-sm text-gray-600 border-t pt-3 mt-auto">
                                <p>Propriétaire: <span className="font-semibold text-gray-900">{p.utilisateurs?.nom_complet || 'Inconnu'}</span></p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(p.date_publication).toLocaleDateString()}</p>
                            </div>

                            <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 p-4">
                                <button onClick={() => alert('Feature viewing not implemented in full')} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">👁 Voir</button>
                                <button onClick={() => handleSupprimer(p.id_propriete, p.titre)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">🗑 Supprimer</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
