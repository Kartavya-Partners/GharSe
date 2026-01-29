"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ChefHat,
    User,
    LogOut,
    Loader2,
    Clock,
    CheckCircle2,
    XCircle,
    Package,
    Truck,
    MapPin,
    Phone,
    Calendar,
    IndianRupee,
    MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
    _id: string;
    customer: {
        _id: string;
        name: string;
        phone?: string;
        address?: {
            city?: string;
        };
    };
    tiffin: {
        _id: string;
        name: string;
        type: string;
    } | null;
    tiffinSnapshot?: {
        name: string;
        price: number;
        type: string;
    };
    deliveryDate: string;
    quantity: number;
    totalPrice: number;
    status: "pending" | "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "cancelled";
    deliveryAddress: {
        street: string;
        city: string;
        pincode: string;
    };
    deliveryInstructions?: string;
    createdAt: string;
}

const STATUS_CONFIG = {
    pending: { label: "New Order", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
    preparing: { label: "Preparing", color: "bg-orange-100 text-orange-700", icon: ChefHat },
    "out-for-delivery": { label: "On the Way", color: "bg-purple-100 text-purple-700", icon: Truck },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: Package },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

const NEXT_STATUS: Record<string, string> = {
    confirmed: "preparing",
    preparing: "out-for-delivery",
    "out-for-delivery": "delivered",
};

export default function ProviderOrdersPage() {
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"new" | "active" | "completed">("new");
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    // Redirect if not provider
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login?role=provider");
            } else if (user?.role !== "provider") {
                router.push("/explore");
            }
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/orders/provider");
                setOrders(response.data);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === "provider") {
            fetchOrders();
        }
    }, [isAuthenticated, user]);

    // Update order status
    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            await axios.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === orderId ? { ...order, status: newStatus as Order["status"] } : order
                )
            );
        } catch (err) {
            console.error("Error updating status:", err);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    // Filter orders by tab
    const filteredOrders = orders.filter((order) => {
        if (activeTab === "new") return order.status === "pending";
        if (activeTab === "active")
            return ["confirmed", "preparing", "out-for-delivery"].includes(order.status);
        return ["delivered", "cancelled"].includes(order.status);
    });

    // Count for badges
    const newCount = orders.filter((o) => o.status === "pending").length;
    const activeCount = orders.filter((o) =>
        ["confirmed", "preparing", "out-for-delivery"].includes(o.status)
    ).length;

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "provider") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/provider"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-200" />
                            <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="hidden sm:block font-medium text-gray-700">
                                    {user?.name}
                                </span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={logout}>
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex gap-1">
                        {[
                            { id: "new", label: "New Orders", count: newCount },
                            { id: "active", label: "Active", count: activeCount },
                            { id: "completed", label: "Completed" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id
                                    ? "border-green-500 text-green-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders here</h3>
                        <p className="text-gray-500">
                            {activeTab === "new"
                                ? "New orders will appear here"
                                : activeTab === "active"
                                    ? "No active orders at the moment"
                                    : "Completed orders will show here"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredOrders.map((order) => {
                                const statusConfig = STATUS_CONFIG[order.status];
                                const StatusIcon = statusConfig.icon;
                                const nextStatus = NEXT_STATUS[order.status];

                                return (
                                    <motion.div
                                        key={order._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-white rounded-xl border shadow-sm overflow-hidden"
                                    >
                                        {/* Order Header */}
                                        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                                                    <StatusIcon className="w-3 h-3 inline mr-1" />
                                                    {statusConfig.label}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </div>
                                        </div>

                                        {/* Order Content */}
                                        <div className="p-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                {/* Order Details */}
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {order.tiffin?.name || order.tiffinSnapshot?.name || "Deleted Item"} × {order.quantity}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-4 h-4" />
                                                            {order.customer.name}
                                                        </span>
                                                        {order.customer.phone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="w-4 h-4" />
                                                                {order.customer.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-start gap-1 text-sm text-gray-500">
                                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                        <span>
                                                            {order.deliveryAddress.street}, {order.deliveryAddress.city} -{" "}
                                                            {order.deliveryAddress.pincode}
                                                        </span>
                                                    </div>
                                                    {order.deliveryInstructions && (
                                                        <div className="mt-2 p-3 bg-yellow-50 rounded-lg text-sm">
                                                            <div className="flex items-start gap-2">
                                                                <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <span className="font-medium text-yellow-800">Delivery Note:</span>
                                                                    <p className="text-yellow-700">{order.deliveryInstructions}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price & Actions */}
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-900 flex items-center">
                                                            <IndianRupee className="w-5 h-5" />
                                                            {order.totalPrice}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    {order.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                                onClick={() => updateStatus(order._id, "cancelled")}
                                                                disabled={updatingOrderId === order._id}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-500 hover:bg-green-600 text-white"
                                                                onClick={() => updateStatus(order._id, "confirmed")}
                                                                disabled={updatingOrderId === order._id}
                                                            >
                                                                {updatingOrderId === order._id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                        Accept
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {nextStatus && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-500 hover:bg-green-600 text-white"
                                                            onClick={() => updateStatus(order._id, nextStatus)}
                                                            disabled={updatingOrderId === order._id}
                                                        >
                                                            {updatingOrderId === order._id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    Mark as{" "}
                                                                    {nextStatus === "preparing"
                                                                        ? "Preparing"
                                                                        : nextStatus === "out-for-delivery"
                                                                            ? "Out for Delivery"
                                                                            : "Delivered"}
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
