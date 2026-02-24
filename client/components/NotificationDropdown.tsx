"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Clock, CheckCircle, PackageSearch, ChefHat, Bike, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Order {
    _id: string;
    status: string;
    tiffinSnapshot?: {
        name: string;
    };
    updatedAt: string;
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const { isAuthenticated } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Poll for active orders
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchOrders = async () => {
            try {
                const res = await axios.get("/orders/myorders");
                // Only show active (non-delivered, non-cancelled) orders, sort by recent update
                const active = res.data.filter((o: Order) => o.status !== "delivered" && o.status !== "cancelled");
                setOrders(active);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // 30s poll
        return () => clearInterval(interval);
    }, [isAuthenticated, isOpen]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="w-4 h-4 text-orange-500" />;
            case "confirmed":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "preparing":
                return <ChefHat className="w-4 h-4 text-orange-500" />;
            case "out-for-delivery":
                return <Bike className="w-4 h-4 text-orange-500" />;
            default:
                return <PackageSearch className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusText = (status: string, mealName: string) => {
        switch (status) {
            case "pending":
                return `Waiting for kitchen to confirm your ${mealName}`;
            case "confirmed":
                return `Kitchen has confirmed your ${mealName}`;
            case "preparing":
                return `Chef is preparing your ${mealName}`;
            case "out-for-delivery":
                return `Rider is picking up your ${mealName}`;
            default:
                return `Update on your ${mealName}`;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
                <Bell className="w-5 h-5" />
                {orders.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[200] transform opacity-100 scale-100 transition-all origin-top-right">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                        <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
                            {orders.length} New
                        </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {!isAuthenticated ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                Please sign in to see your notifications
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                No pending updates
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {orders.map((order) => (
                                    <div
                                        key={order._id}
                                        onClick={() => {
                                            setIsOpen(false);
                                            router.push("/orders");
                                        }}
                                        className="p-4 hover:bg-orange-50 dark:hover:bg-orange-900/10 cursor-pointer transition-colors flex gap-3"
                                    >
                                        <div className="shrink-0 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm">
                                                {getStatusIcon(order.status)}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium line-clamp-2">
                                                {getStatusText(order.status, order.tiffinSnapshot?.name || "Order")}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Tap to track
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
