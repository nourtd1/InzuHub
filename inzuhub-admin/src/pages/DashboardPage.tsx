import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { StatCard } from '../components/ui';
import { Users, Home, ShieldAlert, Flag } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [latestKyc, setLatestKyc] = useState<any[]>([]);
    const [latestSignalements, setLatestSignalements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: statsData, error: statsError } = await supabase.from('admin_stats').select('*').single();
                if (statsError && statsError.code !== 'PGRST116') console.error(statsError);
                else setStats(statsData);

                const { data: kycData } = await supabase.from('kyc_demandes')
                    .select('*, utilisateurs(nom_complet, numero_telephone)')
                    .order('date_creation', { ascending: false })
                    .limit(5);
                if (kycData) setLatestKyc(kycData);

                const { data: sigData } = await supabase.from('signalements')
                    .select('*, proprieties:id_propriete(titre)')
                    .order('date_signalement', { ascending: false })
                    .limit(5);
                if (sigData) setLatestSignalements(sigData);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const dataA = [
        { name: '1', uv: 4 },
        { name: '5', uv: 3 },
        { name: '10', uv: 2 },
        { name: '15', uv: 6 },
        { name: '20', uv: 8 },
        { name: '25', uv: 9 },
        { name: '30', uv: 12 },
    ];

    const dataB = [
        { name: 'Kiyovu', count: 12 },
        { name: 'Gisozi', count: 19 },
        { name: 'Nyarutarama', count: 8 },
        { name: 'Kacyiru', count: 24 },
    ];

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Vue d'ensemble — InzuHub</h1>
                <p className="text-sm text-gray-500">{new Date().toLocaleString('fr-FR')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Utilisateurs"
                    value={stats?.total_utilisateurs || 0}
                    icon={<Users size={24} />}
                    trend="+8 ce mois"
                />
                <StatCard
                    title="Annonces"
                    value={stats?.total_proprietes || 0}
                    icon={<Home size={24} />}
                    trend="+3 ce mois"
                />
                <StatCard
                    title="KYC en attente"
                    value={stats?.kyc_en_attente || 0}
                    icon={<ShieldAlert size={24} />}
                    alert={(stats?.kyc_en_attente || 0) > 10}
                    trend={(stats?.kyc_en_attente || 0) > 10 ? "⚠ Urgent" : ""}
                />
                <StatCard
                    title="Signalements"
                    value={stats?.signalements_en_attente || 0}
                    icon={<Flag size={24} />}
                    alert={(stats?.signalements_en_attente || 0) > 5}
                    trend={(stats?.signalements_en_attente || 0) > 5 ? "⚠ À traiter" : ""}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Inscriptions par jour (30j)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="uv" stroke="#1B4FFF" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Annonces par quartier</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataB}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" fill="#00C896" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Dernières demandes KYC</h3>
                        <Link to="/kyc" className="text-primary text-sm font-medium hover:underline">Voir tout →</Link>
                    </div>
                    <div className="space-y-4">
                        {latestKyc.map(k => (
                            <div key={k.id_demande} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">{k.utilisateurs?.nom_complet}</p>
                                    <p className="text-sm text-gray-500">{k.utilisateurs?.numero_telephone}</p>
                                </div>
                                <div>
                                    {k.statut === 'en_attente' && <Badge variant="warning">En attente</Badge>}
                                    {k.statut === 'en_cours_review' && <Badge variant="default">En cours</Badge>}
                                    {k.statut === 'approuve' && <Badge variant="success">Approuvé</Badge>}
                                    {k.statut === 'rejete' && <Badge variant="danger">Rejeté</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Derniers signalements</h3>
                        <Link to="/signalements" className="text-primary text-sm font-medium hover:underline">Voir tout →</Link>
                    </div>
                    <div className="space-y-4">
                        {latestSignalements.map(s => (
                            <div key={s.id_signalement} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{s.proprieties?.titre || 'Annonce supprimée'}</p>
                                    <p className="text-sm text-gray-500 truncate max-w-[200px]">{s.motif}</p>
                                </div>
                                <div>
                                    {s.etat_traitement === 'en_attente' && <Badge variant="warning">En attente</Badge>}
                                    {s.etat_traitement === 'en_cours' && <Badge variant="default">En cours</Badge>}
                                    {s.etat_traitement === 'traite' && <Badge variant="success">Traité</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
