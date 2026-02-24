"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    tiffinId: string;
    name: string;
    price: number;
    quantity: number;
    providerId: string;
    type: "veg" | "non-veg" | "vegan";
    image: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (tiffinId: string) => void;
    updateQuantity: (tiffinId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Initialize from local storage
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem("gharse_cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to local storage whenever items change
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("gharse_cart", JSON.stringify(items));
        }
    }, [items, isMounted]);

    const addToCart = (newItem: CartItem) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.tiffinId === newItem.tiffinId);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.tiffinId === newItem.tiffinId
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...prevItems, newItem];
        });
    };

    const removeFromCart = (tiffinId: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.tiffinId !== tiffinId));
    };

    const updateQuantity = (tiffinId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(tiffinId);
            return;
        }
        setItems((prevItems) =>
            prevItems.map((item) => (item.tiffinId === tiffinId ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
