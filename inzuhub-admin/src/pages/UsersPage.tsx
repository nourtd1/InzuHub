import React, { useEffect, useState } from 'react';
import { supabase, getPublicUrl } from '../lib/supabase';
import { Badge } from '../components/ui';
import { Search } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('Tous');
    const [filterVerif, setFilterVerif] = useState('Tous');
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        let query = supabase
            .from('utilisateurs')
            .select('*, proprietes:proprietes(count)')
            .order('date_inscription', { ascending: false });

        if (filterRole !== 'Tous') {
            query = query.eq('role', filterRole.toLowerCase());
        }

        // Status can be approved, rejected or missing
        if (filterVerif === 'Vérifiés') query = query.eq('statut_verification', 'approuve');
        else if (filterVerif === 'Non vérifiés') query = query.neq('statut_verification', 'approuve');

        const { data, error } = await query;
        if (!error) {
            let filteredData = data;
            if (search) {
                const s = search.toLowerCase();
                filteredData = data?.filter(u =>
                    (u.nom_complet && u.nom_complet.toLowerCase().includes(s)) ||
                    (u.numero_telephone && u.numero_telephone.includes(s))
                );
            }
            setUsers(filteredData || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [filterRole, filterVerif, search]);

    const handleSuspendre = async (id: string, currentlyAdmin: boolean) => {
        if (currentlyAdmin) {
            alert('Impossible de suspendre un admin depuis cette vue.');
            return;
        }
        if (!window.confirm("Suspendre ce compte l'empêchera de se connecter. Continuer?")) return;
        // You would typically add an est_suspendu boolean to check against in your RLS or Auth Edge functions
        alert('Non implementé coté métier actuel. (Schema à mettre à jour: est_actif/est_suspendu)');
    };

    const handleSupprimer = async (id: string, currentlyAdmin: boolean) => {
        if (currentlyAdmin) return;
        if (!window.confirm("🔴 ACTION IRRÉVERSIBLE. Supprimer cet utilisateur effacera toutes ses données ?")) return;

        try {
            const { error } = await supabase.from('utilisateurs').delete().eq('id_utilisateur', id);
            if (error) throw error;
            alert('Utilisateur supprimé (dépend de vos contraintes SQL - ON DELETE CASCADE).');
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Impossible de supprimer. Il se peut qu\'il ait des conversations ou factures liées.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs</h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                        <input
                            type="text"
                            placeholder="Recherche nom, téléphone..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>

                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                    >
                        <option value="Tous">Tous (Rôles)</option>
                        <option value="Proprietaire">Propriétaires</option>
                        <option value="Locataire">Locataires</option>
                    </select>

                    <select
                        value={filterVerif}
                        onChange={e => setFilterVerif(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                    >
                        <option value="Tous">Tous (Statuts)</option>
                        <option value="Vérifiés">Vérifiés</option>
                        <option value="Non vérifiés">Non vérifiés</option>
                    </select>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom complet</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vérifié</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrit le</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annonces</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Chargement...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Aucun utilisateur trouvé.</td></tr>
                            ) : users.map((u) => (
                                <tr key={u.id_utilisateur} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                {u.avatar_url ? (
                                                    <img className="h-8 w-8 rounded-full" src={getPublicUrl(u.avatar_url, 'avatars')} alt="" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                                                        {u.nom_complet?.[0] || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{u.nom_complet || 'Non défini'}</div>
                                                {u.est_admin && <span className="text-xs text-blue-600 font-bold bg-blue-100 px-1 rounded">ADMIN</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {u.numero_telephone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {u.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {u.statut_verification === 'approuve' ? (
                                            <Badge variant="success">Oui</Badge>
                                        ) : (
                                            <Badge variant="default">Non</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(u.date_inscription).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {u.proprietes?.[0]?.count || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleSuspendre(u.id_utilisateur, u.est_admin)} className="text-orange-600 bg-orange-100 px-2 py-1 rounded" disabled={u.est_admin}>🔒</button>
                                        <button onClick={() => handleSupprimer(u.id_utilisateur, u.est_admin)} className="text-red-600 bg-red-100 px-2 py-1 rounded" disabled={u.est_admin}>🗑</button>
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
