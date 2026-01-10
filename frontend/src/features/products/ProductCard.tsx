import React from 'react';
import { Product } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onEdit?: (product: Product) => void;
    onDelete?: (productId: string) => void;
    isAdmin?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    onEdit,
    onDelete,
    isAdmin = false,
}) => {
    const isOutOfStock = product.quantity === 0;

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl">{product.name}</CardTitle>
                        <CardDescription className="mt-2">
                            {product.description || 'No description available'}
                        </CardDescription>
                    </div>
                    <Package className="h-5 w-5 text-muted-foreground" />
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                        </span>
                        <Badge variant={isOutOfStock ? 'destructive' : 'secondary'}>
                            {isOutOfStock ? 'Out of Stock' : `${product.quantity} in stock`}
                        </Badge>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex gap-2">
                {isAdmin ? (
                    <>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onEdit?.(product)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => onDelete?.(product.id)}
                        >
                            Delete
                        </Button>
                    </>
                ) : (
                    <Button
                        className="w-full gap-2"
                        disabled={isOutOfStock}
                        onClick={() => onAddToCart?.(product)}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
