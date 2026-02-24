"use client";

import React, { useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const { items, updateQuantity, cartTotal, cartCount, removeFromCart } = useCart();
    const router = useRouter();

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCheckout = () => {
        onClose();
        router.push("/checkout");
    };

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-orange-100 bg-orange-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm shadow-orange-100/50">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                        <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md shadow-orange-500/20">
                            {cartCount}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-100/50 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDFBF7]">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag className="w-10 h-10 text-orange-300" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                            <p className="text-sm text-gray-400 text-center max-w-[200px]">Looks like you haven&apos;t added any delicious home-cooked meals yet.</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-8 py-3 bg-white border border-orange-200 text-orange-600 font-semibold rounded-full hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm"
                            >
                                Browse Meals
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.tiffinId} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition-colors group">
                                <div className="w-20 h-20 relative rounded-xl overflow-hidden shrink-0 shadow-inner">
                                    <Image
                                        src={item.image || "/images/placeholder-meal.jpg"}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-1 left-1">
                                        <div className={`w-4 h-4 flex items-center justify-center border rounded-sm bg-white/90 backdrop-blur-sm shadow-sm ${item.type === 'veg' ? 'border-green-600' : item.type === 'non-veg' ? 'border-red-600' : 'border-green-600'}`}>
                                            <div className={`w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-green-600' : item.type === 'non-veg' ? 'bg-red-600' : 'bg-green-600'}`}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                    <div className="flex justify-between items-start">
                                        <div className="pr-2">
                                            <h3 className="font-bold text-gray-900 line-clamp-1 leading-tight">{item.name}</h3>
                                            <span className="text-sm font-semibold text-orange-500 mt-1 block">₹{item.price}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.tiffinId)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.tiffinId, item.quantity - 1)}
                                                className="p-1.5 hover:bg-orange-100 hover:text-orange-600 text-gray-500 transition-colors rounded-l-lg"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.tiffinId, item.quantity + 1)}
                                                className="p-1.5 hover:bg-orange-100 hover:text-orange-600 text-gray-500 transition-colors rounded-r-lg"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className="font-bold text-gray-900 flex items-center">
                                            ₹{item.price * item.quantity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-white">
                        <div className="flex justify-between items-center mb-6 px-1">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="text-2xl font-bold text-gray-900">
                                ₹{cartTotal}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
