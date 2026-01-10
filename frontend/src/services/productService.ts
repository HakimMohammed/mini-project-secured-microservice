import api from './api';
import { Product, ProductRequest } from '../types';

export const productService = {
    // Get all products
    getAll: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/api/products');
        return response.data;
    },

    // Get product by ID
    getById: async (id: string): Promise<Product> => {
        const response = await api.get<Product>(`/api/products/${id}`);
        return response.data;
    },

    // Create new product (ADMIN only)
    create: async (product: ProductRequest): Promise<Product> => {
        const response = await api.post<Product>('/api/products', product);
        return response.data;
    },

    // Update product (ADMIN only)
    update: async (id: string, product: ProductRequest): Promise<Product> => {
        const response = await api.put<Product>(`/api/products/${id}`, product);
        return response.data;
    },

    // Delete product (ADMIN only)
    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/products/${id}`);
    },
};
