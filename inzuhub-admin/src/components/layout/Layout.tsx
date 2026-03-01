import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, Flag, Home, LogOut, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function Layout({ children }: { children?: ReactNode }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Realtime badge mockup values - normally wired to `useSignalements` and `useKycAdmin` hooks
    const [kycPendingCount, setKycPendingCount] = React.useState(0);
    const [reportsPendingCount, setReportsPendingCount] = React.useState(0);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    React.useEffect(() => {
        // Initial fetches
        const fetchCounts = async () => {
            const { count: kycCount } = await supabase.from('kyc_demandes').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente');
            const { count: repCount } = await supabase.from('signalements').select('*', { count: 'exact', head: true }).eq('etat_traitement', 'en_attente');
            setKycPendingCount(kycCount || 0);
            setReportsPendingCount(repCount || 0);
        };
        fetchCounts();

        // Setup real-time
        const subKyc = supabase.channel('admin-kyc-layout')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'kyc_demandes' }, (payload) => {
                fetchCounts();
                if (payload.eventType === 'INSERT') {
                    try { new Audio('/notification.mp3').play(); } catch (e) { }
                }
            })
            .subscribe();

        const subSig = supabase.channel('admin-sig-layout')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'signalements' }, fetchCounts)
            .subscribe();

        return () => {
            subKyc.unsubscribe();
            subSig.unsubscribe();
        }
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <span className="text-xl font-bold text-primary flex items-center gap-2">
                        🏠 InzuHub <span className="text-sm font-medium text-gray-400">Admin</span>
                    </span>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem to="/kyc" icon={<UserCheck size={20} />} label="KYC" badge={kycPendingCount} />
                    <NavItem to="/signalements" icon={<Flag size={20} />} label="Signalements" badge={reportsPendingCount} />
                    <NavItem to="/users" icon={<Users size={20} />} label="Utilisateurs" />
                    <NavItem to="/properties" icon={<Home size={20} />} label="Annonces" />
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        Se déconnecter
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                    <div>
                        {/* Can put dynamic title here using context if needed */}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-right">
                            <p className="font-semibold text-gray-700">Admin : {user?.nom_complet?.split(' ')[0] || 'Inconnu'} ▼</p>
                            <p className="text-xs text-gray-500">Dernière connexion: Aujourd'hui</p>
                        </div>
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full bg-gray-200" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                                {user?.nom_complet?.[0] || 'A'}
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: number }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
            }
        >
            <div className="flex items-center">
                <span className="mr-3">{icon}</span>
                {label}
            </div>
            {badge ? (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            ) : null}
        </NavLink>
    );
}
