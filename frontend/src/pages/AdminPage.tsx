import React from 'react';
import { OrderList } from '../features/orders/OrderList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react';

export const AdminPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
                    <LayoutDashboard className="h-8 w-8" />
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage products and view all orders
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Manage in Products tab</div>
                        <p className="text-xs text-muted-foreground">
                            Create, update, and delete products
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">All Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">View below</div>
                        <p className="text-xs text-muted-foreground">
                            Monitor all customer orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">User Management</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Keycloak</div>
                        <p className="text-xs text-muted-foreground">
                            Managed via Keycloak console
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <OrderList />
            </div>
        </div>
    );
};
