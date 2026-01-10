import React, { useState } from 'react';
import { ProductList } from '../features/products/ProductList';
import { CartView } from '../features/orders/ShoppingCart';
import { Product } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CartItem {
    product: Product;
    quantity: number;
}

export const HomePage: React.FC = () => {
    const { isAdmin } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const handleAddToCart = (product: Product) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.product.id === product.id);

            if (existingItem) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { product, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        setCartItems(prev =>
            prev.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const handleRemoveItem = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleClearCart = () => {
        setCartItems([]);
    };

    return (
        <div className="space-y-8">
            <ProductList onAddToCart={isAdmin ? undefined : handleAddToCart} />

            {!isAdmin && cartItems.length > 0 && (
                <div className="sticky bottom-4">
                    <CartView
                        items={cartItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        onClearCart={handleClearCart}
                    />
                </div>
            )}
        </div>
    );
};
