import api from './api';
import { Order, OrderRequest } from '../types';

export const orderService = {
    // Create new order
    create: async (order: OrderRequest): Promise<Order> => {
        const response = await api.post<Order>('/api/orders', order);
        return response.data;
    },

    // Get current user's orders
    getMyOrders: async (): Promise<Order[]> => {
        const response = await api.get<Order[]>('/api/orders/my-orders');
        return response.data;
    },

    // Get all orders (ADMIN only)
    getAllOrders: async (): Promise<Order[]> => {
        const response = await api.get<Order[]>('/api/orders');
        return response.data;
    },
};
