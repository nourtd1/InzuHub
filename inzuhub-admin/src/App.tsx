import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KycPage from './pages/KycPage';
import SignalementsPage from './pages/SignalementsPage';
import UsersPage from './pages/UsersPage';
import PropertiesPage from './pages/PropertiesPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
    }

    if (!user || user.est_admin !== true) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

function AppContent() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="kyc" element={<KycPage />} />
                    <Route path="signalements" element={<SignalementsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="properties" element={<PropertiesPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
