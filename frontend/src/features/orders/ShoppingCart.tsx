import React, { useState } from 'react';
import { Product } from '../../types';
import { orderService } from '../../services/orderService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartViewProps {
    items: CartItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onClearCart: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
    items,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const totalAmount = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const orderRequest = {
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                })),
            };

            await orderService.create(orderRequest);
            setSuccess(true);
            onClearCart();

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Shopping Cart
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Your cart is empty</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Shopping Cart
                    </CardTitle>
                    <Badge>{items.length} {items.length === 1 ? 'item' : 'items'}</Badge>
                </div>
                <CardDescription>Review your items before checkout</CardDescription>
            </CardHeader>

            <CardContent>
                {error && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-md mb-4">
                        Order created successfully!
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.product.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{item.product.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.product.description}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    ${item.product.price.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.product.quantity}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemoveItem(item.product.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">${totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={onClearCart} disabled={loading}>
                    Clear Cart
                </Button>
                <Button className="flex-1" onClick={handleCheckout} disabled={loading}>
                    {loading ? 'Processing...' : 'Checkout'}
                </Button>
            </CardFooter>
        </Card>
    );
};
