"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
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
    ChefHat,
    Filter,
    Search,
    RefreshCw,
    AlertCircle,
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
    quantity: number;
    totalPrice: number;
    status: "pending" | "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "cancelled";
    deliveryDate: string;
    deliveryAddress: {
        street: string;
        city: string;
        pincode: string;
    };
    deliveryInstructions?: string;
    paymentStatus: "pending" | "paid" | "refunded";
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bgColor: string }> = {
    pending: { label: "Pending", icon: Clock, color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20" },
    confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
    preparing: { label: "Preparing", icon: ChefHat, color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20" },
    "out-for-delivery": { label: "Out for Delivery", icon: Truck, color: "text-teal-400", bgColor: "bg-teal-500/10 border-teal-500/20" },
    delivered: { label: "Delivered", icon: Package, color: "text-green-400", bgColor: "bg-green-500/10 border-green-500/20" },
    cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
};

const STATUS_FLOW: Record<string, string> = {
    pending: "confirmed",
    confirmed: "preparing",
    preparing: "out-for-delivery",
    "out-for-delivery": "delivered",
};

const STATUS_ACTION_LABELS: Record<string, string> = {
    pending: "Accept Order",
    confirmed: "Start Preparing",
    preparing: "Out for Delivery",
    "out-for-delivery": "Mark Delivered",
};

type FilterTab = "all" | "pending" | "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "cancelled";

export default function OrderHistoryPage() {
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [error, setError] = useState("");

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
    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            setError("");
            const response = await axios.get("/orders/provider");
            setOrders(response.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load orders. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.role === "provider") {
            fetchOrders();
        }
    }, [isAuthenticated, user]);

    // Update order status
    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            setUpdatingOrderId(orderId);
            await axios.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === orderId ? { ...order, status: newStatus as Order["status"] } : order
                )
            );
        } catch (err) {
            console.error("Error updating status:", err);
            setError("Failed to update order status.");
            setTimeout(() => setError(""), 3000);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    // Cancel order
    const handleCancel = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        await handleStatusUpdate(orderId, "cancelled");
    };

    // Filter orders
    const filteredOrders = orders.filter((order) => {
        const matchesTab = activeTab === "all" || order.status === activeTab;
        const matchesSearch =
            searchQuery === "" ||
            (order.tiffin?.name || order.tiffinSnapshot?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order._id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Stats
    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f1a15]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "provider") {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0f1a15]">
            {/* ========== NAVBAR ========== */}
            <header className="sticky top-0 z-50 bg-[#0d1a14] border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/provider"
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Back to Dashboard</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-teal-400" />
                                </div>
                                <span className="hidden sm:block font-medium text-gray-300">
                                    {user?.name}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== MAIN ========== */}
            <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1 flex items-center gap-3">
                                <Package className="w-8 h-8 text-teal-400" />
                                Order History
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Track, manage, and update all customer orders.
                            </p>
                        </div>
                        <Button
                            onClick={fetchOrders}
                            variant="outline"
                            className="bg-[#1a2b23] border-white/10 text-gray-300 hover:bg-[#243b30] hover:text-white rounded-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                        {(["pending", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"] as const).map((status) => {
                            const config = STATUS_CONFIG[status];
                            const StatusIcon = config.icon;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setActiveTab(status)}
                                    className={`p-3 rounded-xl border transition-all text-center ${activeTab === status
                                        ? "bg-teal-600/20 border-teal-500/30"
                                        : "bg-[#1a2b23] border-white/5 hover:border-white/10"
                                        }`}
                                >
                                    <StatusIcon className={`w-4 h-4 mx-auto mb-1 ${config.color}`} />
                                    <div className="text-lg font-bold text-white">{statusCounts[status] || 0}</div>
                                    <div className="text-[10px] text-gray-500 font-medium truncate">{config.label}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search & Filter bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by item, customer, or order ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-11 pr-4 bg-[#1a2b23] border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === "all"
                                    ? "bg-teal-600 text-white"
                                    : "bg-[#1a2b23] text-gray-400 hover:text-white hover:bg-[#243b30] border border-white/5"
                                    }`}
                            >
                                All ({orders.length})
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-red-400">{error}</span>
                    </motion.div>
                )}

                {/* Order List */}
                {filteredOrders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 bg-teal-500/10 rounded-full flex items-center justify-center">
                            <Package className="w-10 h-10 text-teal-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
                        <p className="text-gray-500">
                            {searchQuery
                                ? "No orders match your search."
                                : activeTab === "all"
                                    ? "Orders will appear here when customers place them."
                                    : `No ${STATUS_CONFIG[activeTab]?.label.toLowerCase()} orders.`}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredOrders.map((order) => {
                                const statusConfig = STATUS_CONFIG[order.status];
                                const StatusIcon = statusConfig.icon;
                                const nextStatus = STATUS_FLOW[order.status];
                                const isUpdating = updatingOrderId === order._id;

                                return (
                                    <motion.div
                                        key={order._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-[#1a2b23] rounded-2xl border border-white/5 overflow-hidden hover:border-teal-500/20 transition-all"
                                    >
                                        {/* Order Header */}
                                        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                    <StatusIcon className="w-3 h-3 inline mr-1" />
                                                    {statusConfig.label}
                                                </span>
                                                <span className="text-sm text-gray-500 font-mono">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Placed: {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Content */}
                                        <div className="p-4">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                {/* Order Details */}
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white mb-1">
                                                        {order.tiffin?.name || order.tiffinSnapshot?.name || "Deleted Item"} {"\u00D7"} {order.quantity}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5" />
                                                            {order.customer.name}
                                                        </span>
                                                        {order.customer.phone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="w-3.5 h-3.5" />
                                                                {order.customer.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-start gap-1 text-sm text-gray-500">
                                                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                        <span>
                                                            {order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                                                        </span>
                                                    </div>
                                                    {order.deliveryInstructions && (
                                                        <div className="mt-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-sm">
                                                            <div className="flex items-start gap-2">
                                                                <MessageSquare className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <span className="font-medium text-amber-300">Note: </span>
                                                                    <span className="text-amber-200/70">{order.deliveryInstructions}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Status Progress Bar */}
                                                    {order.status !== "cancelled" && (
                                                        <div className="mt-4 flex items-center gap-1">
                                                            {["pending", "confirmed", "preparing", "out-for-delivery", "delivered"].map((step, i) => {
                                                                const steps = ["pending", "confirmed", "preparing", "out-for-delivery", "delivered"];
                                                                const currentIdx = steps.indexOf(order.status);
                                                                const isCompleted = i <= currentIdx;
                                                                const isCurrent = i === currentIdx;

                                                                return (
                                                                    <div key={step} className="flex items-center gap-1 flex-1">
                                                                        <div
                                                                            className={`h-1.5 flex-1 rounded-full transition-all ${isCompleted
                                                                                ? "bg-teal-500"
                                                                                : "bg-white/5"
                                                                                }`}
                                                                        />
                                                                        {isCurrent && (
                                                                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price & Actions */}
                                                <div className="flex flex-col items-end gap-3">
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-teal-400 flex items-center">
                                                            <IndianRupee className="w-5 h-5" />
                                                            {order.totalPrice}
                                                        </div>
                                                        <span className={`text-xs ${order.paymentStatus === "paid"
                                                            ? "text-green-400"
                                                            : order.paymentStatus === "refunded"
                                                                ? "text-red-400"
                                                                : "text-amber-400"
                                                            }`}>
                                                            Payment: {order.paymentStatus}
                                                        </span>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2">
                                                        {order.status === "pending" && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleCancel(order._id)}
                                                                disabled={isUpdating}
                                                                className="text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300 rounded-lg text-xs"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                                                Reject
                                                            </Button>
                                                        )}
                                                        {nextStatus && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(order._id, nextStatus)}
                                                                disabled={isUpdating}
                                                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs"
                                                            >
                                                                {isUpdating ? (
                                                                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                                )}
                                                                {STATUS_ACTION_LABELS[order.status]}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Summary footer */}
                        <div className="mt-6 p-4 bg-[#1a2b23] rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {filteredOrders.length} of {orders.length} orders
                            </span>
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                                Total Revenue: <IndianRupee className="w-3.5 h-3.5" />
                                <span className="font-bold text-teal-400">
                                    {orders
                                        .filter((o) => o.status === "delivered")
                                        .reduce((sum, o) => sum + o.totalPrice, 0)
                                        .toLocaleString()}
                                </span>
                            </span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
