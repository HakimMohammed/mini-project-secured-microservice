import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserProfile } from '../features/auth/UserProfile';
import { useAuth } from '../hooks/useAuth';
import { ShoppingCart, Package, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { isAdmin } = useAuth();

    const navigation = [
        { name: 'Products', href: '/', icon: Package },
        { name: 'My Orders', href: '/orders', icon: ShoppingBag },
        ...(isAdmin ? [{ name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard }] : []),
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <ShoppingCart className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">E-Shop</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={cn(
                                            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <UserProfile />
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t mt-auto">
                <div className="container py-6 text-center text-sm text-muted-foreground">
                    <p>© 2026 E-Shop. Secured with Keycloak.</p>
                </div>
            </footer>
        </div>
    );
};
