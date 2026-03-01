import React, { useEffect, useState } from 'react';
import { supabase, getPublicUrl } from '../lib/supabase';
import { Badge } from '../components/ui';
import { Search } from 'lucide-react';
import KycDetailModal from '../components/kyc/KycDetailModal';

export default function KycPage() {
    const [demandes, setDemandes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Tous');
    const [search, setSearch] = useState('');
    const [selectedDemande, setSelectedDemande] = useState<any | null>(null);

    const fetchDemandes = async () => {
        setLoading(true);
        let query = supabase
            .from('kyc_demandes')
            .select('*, utilisateurs(nom_complet, numero_telephone, avatar_url)')
            .order('date_creation', { ascending: false });

        if (filter === 'en_attente') query = query.eq('statut', 'en_attente');
        else if (filter === 'en_cours_review') query = query.eq('statut', 'en_cours_review');
        else if (filter === 'approuve') query = query.eq('statut', 'approuve');
        else if (filter === 'rejete') query = query.eq('statut', 'rejete');

        const { data, error } = await query;
        if (!error) {
            // Local search processing
            let filteredData = data;
            if (search) {
                const s = search.toLowerCase();
                filteredData = data?.filter(d =>
                    d.utilisateurs?.nom_complet.toLowerCase().includes(s) ||
                    d.utilisateurs?.numero_telephone.includes(s)
                );
            }
            setDemandes(filteredData || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDemandes();

        const sub = supabase.channel('admin-kyc-page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'kyc_demandes' }, fetchDemandes)
            .subscribe();

        return () => { sub.unsubscribe(); };
    }, [filter, search]);

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'en_attente': return <Badge variant="warning">⏳ En attente</Badge>;
            case 'en_cours_review': return <Badge variant="default">🔍 En review</Badge>;
            case 'approuve': return <Badge variant="success">✅ Approuvé</Badge>;
            case 'rejete': return <Badge variant="danger">❌ Rejeté</Badge>;
            default: return <Badge variant="default">{statut}</Badge>;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Vérifications KYC</h1>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Rechercher (nom, tél)..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {['Tous', 'en_attente', 'en_cours_review', 'approuve', 'rejete'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                    >
                        {f === 'Tous' ? 'Tous' :
                            f === 'en_attente' ? '⏳ En attente' :
                                f === 'en_cours_review' ? '🔍 En review' :
                                    f === 'approuve' ? '✅ Approuvés' : '❌ Rejetés'}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Chargement...</td></tr>
                            ) : demandes.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Aucune demande KYC trouvée.</td></tr>
                            ) : demandes.map((d) => (
                                <tr key={d.id_demande} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {d.utilisateurs?.avatar_url ? (
                                                    <img className="h-10 w-10 rounded-full" src={getPublicUrl(d.utilisateurs.avatar_url, 'avatars')} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                                        {d.utilisateurs?.nom_complet?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{d.utilisateurs?.nom_complet}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {d.utilisateurs?.numero_telephone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(d.date_creation).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(d.statut)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setSelectedDemande(d)}
                                            className="text-primary hover:text-primary-hover font-semibold px-3 py-1 bg-primary/10 rounded-lg transition-colors"
                                        >
                                            🔍 Examiner
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedDemande && (
                <KycDetailModal
                    demande={selectedDemande}
                    onClose={() => setSelectedDemande(null)}
                    onProcessed={fetchDemandes}
                />
            )}
        </div>
    );
}
