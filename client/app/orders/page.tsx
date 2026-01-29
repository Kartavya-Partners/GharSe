"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ShoppingBag,
    Loader2,
    MapPin,
    CheckCircle2,
    Clock,
    ChefHat,
    Truck,
    Package,
    XCircle,
    IndianRupee,
    Calendar,
    RefreshCcw,
} from "lucide-react";
import { motion } from "framer-motion";

interface Order {
    _id: string;
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
    provider: {
        _id: string;
        name: string;
    } | null;
    deliveryDate: string;
    quantity: number;
    totalPrice: number;
    status: "pending" | "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "cancelled";
    deliveryAddress: {
        street: string;
        city: string;
        pincode: string;
    };
    createdAt: string;
}

const STATUS_STEPS = [
    { key: "pending", label: "Order Placed", icon: Clock, description: "Waiting for confirmation" },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2, description: "Order accepted by chef" },
    { key: "preparing", label: "Preparing", icon: ChefHat, description: "Chef is cooking your meal" },
    { key: "out-for-delivery", label: "On the Way", icon: Truck, description: "Your food is out for delivery" },
    { key: "delivered", label: "Delivered", icon: Package, description: "Enjoy your meal!" },
];

function getStatusIndex(status: string): number {
    if (status === "cancelled") return -1;
    return STATUS_STEPS.findIndex((s) => s.key === status);
}

function OrdersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const success = searchParams.get("success");

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?role=customer");
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/orders/myorders");
            setOrders(response.data);

            // Auto-select most recent active order
            const activeOrder = response.data.find(
                (o: Order) => !["delivered", "cancelled"].includes(o.status)
            );
            if (activeOrder) setSelectedOrder(activeOrder);
            else if (response.data.length > 0) setSelectedOrder(response.data[0]);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    // Poll for status updates every 30 seconds
    useEffect(() => {
        if (!selectedOrder || ["delivered", "cancelled"].includes(selectedOrder.status)) return;

        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [selectedOrder]);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    const currentStatusIndex = selectedOrder ? getStatusIndex(selectedOrder.status) : -1;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/explore"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-lg font-semibold text-gray-900">My Orders</h1>
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchOrders}>
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Success Message */}
            {success && (
                <div className="max-w-4xl mx-auto px-4 pt-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-green-700">Order placed successfully! Track it below.</span>
                    </div>
                </div>
            )}

            <main className="max-w-4xl mx-auto px-4 py-8">
                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Start ordering delicious homemade meals!</p>
                        <Link href="/explore">
                            <Button className="bg-orange-500 hover:bg-orange-600">Browse Tiffins</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Orders List */}
                        <div className="md:col-span-1 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Your Orders
                            </h2>
                            {orders.map((order) => (
                                <button
                                    key={order._id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedOrder?._id === order._id
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="font-medium text-gray-900">{order.tiffin?.name || order.tiffinSnapshot?.name || "Deleted Item"}</span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === "delivered"
                                                ? "bg-green-100 text-green-700"
                                                : order.status === "cancelled"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-orange-100 text-orange-700"
                                                }`}
                                        >
                                            {order.status === "out-for-delivery" ? "On Way" : order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                        <span className="text-gray-300">|</span>
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        {order.totalPrice}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Order Detail / Tracking */}
                        <div className="md:col-span-2">
                            {selectedOrder && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                {selectedOrder.tiffin?.name || selectedOrder.tiffinSnapshot?.name || "Deleted Item"} × {selectedOrder.quantity}
                                            </h2>
                                            <p className="text-gray-600">From {selectedOrder.provider?.name || "Unknown Provider"}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900 flex items-center">
                                                <IndianRupee className="w-5 h-5" />
                                                {selectedOrder.totalPrice}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                #{selectedOrder._id.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Cancelled */}
                                    {selectedOrder.status === "cancelled" && (
                                        <div className="p-4 bg-red-50 rounded-xl flex items-center gap-3 mb-6">
                                            <XCircle className="w-6 h-6 text-red-500" />
                                            <div>
                                                <p className="font-medium text-red-700">Order Cancelled</p>
                                                <p className="text-sm text-red-600">This order was cancelled</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Live Tracking */}
                                    {selectedOrder.status !== "cancelled" && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                                Order Status
                                            </h3>
                                            <div className="relative">
                                                {/* Progress Line */}
                                                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />
                                                <div
                                                    className="absolute left-5 top-5 w-0.5 bg-orange-500 transition-all duration-500"
                                                    style={{
                                                        height: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                                                    }}
                                                />

                                                {/* Steps */}
                                                <div className="space-y-6">
                                                    {STATUS_STEPS.map((step, index) => {
                                                        const isComplete = index <= currentStatusIndex;
                                                        const isCurrent = index === currentStatusIndex;
                                                        const StepIcon = step.icon;

                                                        return (
                                                            <motion.div
                                                                key={step.key}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="flex items-start gap-4"
                                                            >
                                                                <div
                                                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${isComplete
                                                                        ? "bg-orange-500 text-white"
                                                                        : "bg-gray-100 text-gray-400"
                                                                        } ${isCurrent ? "ring-4 ring-orange-200" : ""}`}
                                                                >
                                                                    <StepIcon className="w-5 h-5" />
                                                                </div>
                                                                <div className={isComplete ? "text-gray-900" : "text-gray-400"}>
                                                                    <p className="font-medium">{step.label}</p>
                                                                    <p className="text-sm">{step.description}</p>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Address */}
                                    <div className="pt-6 border-t">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            Delivery Address
                                        </h3>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-gray-900">{selectedOrder.deliveryAddress.street}</p>
                                                <p className="text-gray-600">
                                                    {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function OrdersPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            }
        >
            <OrdersContent />
        </Suspense>
    );
}
