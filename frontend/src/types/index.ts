// Product types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
}

export interface ProductRequest {
    name: string;
    description?: string;
    price: number;
    quantity: number;
}

// Order types
export interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    userId: string;
    orderDate: string;
    status: 'PENDING' | 'VALIDATED';
    totalAmount: number;
    items: OrderItem[];
}

export interface OrderRequest {
    items: {
        productId: string;
        quantity: number;
    }[];
}

// User types (from Keycloak token)
export interface User {
    sub: string;
    preferred_username: string;
    email: string;
    name: string;
    realm_access: {
        roles: string[];
    };
}

// API Error types
export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    errors?: Record<string, string>;
}
