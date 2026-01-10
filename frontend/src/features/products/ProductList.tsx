import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { Product, ProductRequest } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductForm } from './ProductForm';
import { Button } from '../../components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface ProductListProps {
    onAddToCart?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onAddToCart }) => {
    const { isAdmin } = useAuth();
    const { data: products, loading, error, refetch } = useApi<Product[]>(
        () => productService.getAll(),
        []
    );

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>();

    const handleCreate = async (data: ProductRequest) => {
        await productService.create(data);
        setShowForm(false);
        refetch();
    };

    const handleUpdate = async (data: ProductRequest) => {
        if (editingProduct) {
            await productService.update(editingProduct.id, data);
            setEditingProduct(undefined);
            refetch();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await productService.delete(id);
            refetch();
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(undefined);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading products...</p>
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

    if (showForm || editingProduct) {
        return (
            <ProductForm
                product={editingProduct}
                onSubmit={editingProduct ? handleUpdate : handleCreate}
                onCancel={handleCancel}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">
                        {products?.length || 0} products available
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={refetch}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    {isAdmin && (
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    )}
                </div>
            </div>

            {products && products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No products available</p>
                    {isAdmin && (
                        <Button onClick={() => setShowForm(true)} className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Product
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products?.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={onAddToCart}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
