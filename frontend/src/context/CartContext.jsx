import React, { createContext, useContext, useState, useMemo } from 'react';
import { useCurrency } from './CurrencyContext';
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const { taxRate } = useCurrency();

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const totals = useMemo(() => {
        const originalSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tax = originalSubtotal * (taxRate / 100);
        
        const totalDiscount = cart.reduce((acc, item) => {
            const hasDiscount = item.memberDiscountPercentage > 0;
            if (hasDiscount) {
                const itemGrossPrice = item.price * (1 + taxRate / 100);
                const discountAmount = itemGrossPrice * (item.memberDiscountPercentage / 100);
                return acc + (discountAmount * item.quantity);
            }
            return acc;
        }, 0);

        const total = (originalSubtotal + tax) - totalDiscount;
        const subtotal = originalSubtotal;
        const savings = totalDiscount;
        
        return { subtotal, tax, total, savings, originalSubtotal };
    }, [cart, selectedCustomer, taxRate]);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            totals,
            selectedCustomer,
            setSelectedCustomer
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
