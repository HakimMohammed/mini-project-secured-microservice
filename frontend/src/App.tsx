import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './config/keycloak';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminPage } from './pages/AdminPage';

const App: React.FC = () => {
    const handleKeycloakEvent = (event: string, error?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Keycloak event:', event, error);
        }
        if (event === 'onAuthError' || event === 'onInitError') {
            console.error(`Keycloak ${event}:`, error);
        }
    };

    const handleKeycloakTokens = (tokens: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Keycloak tokens received:', {
                token: tokens.token ? 'present' : 'missing',
                refreshToken: tokens.refreshToken ? 'present' : 'missing',
            });
        }
    };

    return (
        <ErrorBoundary>
            <ReactKeycloakProvider
            authClient={keycloak}
            initOptions={{
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                pkceMethod: 'S256',
            }}
            onEvent={handleKeycloakEvent}
            onTokens={handleKeycloakTokens}
            LoadingComponent={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Initializing authentication...</p>
                    </div>
                </div>
            }
        >
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
                                <Layout>
                                    <HomePage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
                                <Layout>
                                    <OrdersPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <Layout>
                                    <AdminPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </ReactKeycloakProvider>
        </ErrorBoundary>
    );
};

export default App;
