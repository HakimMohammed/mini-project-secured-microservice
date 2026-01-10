import React from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { OrderCard } from './OrderCard';
import { Button } from '../../components/ui/button';
import { RefreshCw } from 'lucide-react';

export const OrderList: React.FC = () => {
    const { isAdmin } = useAuth();

    const { data: orders, loading, error, refetch } = useApi<Order[]>(
        () => isAdmin ? orderService.getAllOrders() : orderService.getMyOrders(),
        [isAdmin]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={refetch} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? 'All Orders' : 'My Orders'}
                    </h2>
                    <p className="text-muted-foreground">
                        {orders?.length || 0} {orders?.length === 1 ? 'order' : 'orders'} found
                    </p>
                </div>
                <Button variant="outline" onClick={refetch}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {orders && orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No orders found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {orders?.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
};
