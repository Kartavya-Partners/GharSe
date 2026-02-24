"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "@/components/provider/ProfileDropdown";
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
    Bell,
    HelpCircle,
    ClipboardList,
    UtensilsCrossed,
    ArrowRight,
    TrendingUp,
    Eye,
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
    createdAt: string;
}

interface Tiffin {
    _id: string;
    name: string;
    isAvailable: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
    pending: { label: "New Order", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: CheckCircle2 },
    preparing: { label: "Preparing", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: ChefHat },
    "out-for-delivery": { label: "On the Way", color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: Truck },
    delivered: { label: "Delivered", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: Package },
    cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

const NEXT_STATUS: Record<string, string> = {
    pending: "confirmed",
    confirmed: "preparing",
    preparing: "out-for-delivery",
    "out-for-delivery": "delivered",
};

export default function ProviderOrdersPage() {
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [tiffins, setTiffins] = useState<Tiffin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [ordersRes, tiffinsRes] = await Promise.all([
                    axios.get("/orders/provider"),
                    axios.get("/tiffins/provider/me"),
                ]);
                setOrders(ordersRes.data);
                setTiffins(tiffinsRes.data);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === "provider") {
            fetchData();
        }
    }, [isAuthenticated, user]);

    // Update order status
    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            setUpdatingOrderId(orderId);
            await axios.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
            );
        } catch (err) {
            console.error("Error updating status:", err);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    // Computed stats
    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;
    const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const activeOrders = orders.filter((o) => ["confirmed", "preparing", "out-for-delivery"].includes(o.status));
    const recentOrders = orders.slice(0, 5); // Show latest 5 orders
    const menuItemCount = tiffins.length;
    const activeMenuItems = tiffins.filter((t) => t.isAvailable).length;

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
            {/* ========== TOP NAVBAR ========== */}
            <header className="sticky top-0 z-50 bg-[#0d1a14] border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-teal-600 p-1.5 rounded-lg">
                                <ChefHat className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">GharSe</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all relative">
                                <Bell className="w-4 h-4" />
                                {pendingOrders.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                        {pendingOrders.length}
                                    </span>
                                )}
                            </button>
                            <ProfileDropdown />
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== MAIN ========== */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-xl font-semibold text-white mb-0.5">
                        {user?.name?.split(" ")[0]} Kitchen is live.
                    </h1>
                    <p className="text-sm text-gray-400">
                        Today’s operations at a glance
                    </p>
                </motion.div>

                {/* ========== STATS ROW ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: "Today's Orders", value: todayOrders.toString(), icon: Package, color: "text-teal-400", bg: "bg-teal-500/10" },
                        { label: "Total Revenue", value: `\u20B9${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "Active Orders", value: activeOrders.length.toString(), icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
                        { label: "Pending Orders", value: pendingOrders.length.toString(), icon: ClipboardList, color: "text-blue-400", bg: "bg-blue-500/10" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-[#1a2b23] rounded-2xl p-5 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
                                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                        </div>
                    ))}
                </motion.div>

                {/* ========== QUICK ACCESS CARDS ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-bold text-white mb-4">Quick Access</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Menu Management */}
                        <Link href="/dashboard/provider" className="group">
                            <div className="bg-[#1a2b23] rounded-2xl p-6 border border-white/5 hover:border-teal-500/30 transition-all group-hover:shadow-lg group-hover:shadow-teal-500/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                        <UtensilsCrossed className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-teal-400 transition-colors group-hover:translate-x-1 transform transition-transform" />
                                </div>
                                <h3 className="text-white font-bold text-base mb-1">Menu Management</h3>
                                <p className="text-gray-500 text-sm mb-3">Add, edit, or remove your tiffin items</p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-md bg-teal-500/10 text-teal-400 font-medium">
                                        {menuItemCount} items
                                    </span>
                                    <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 font-medium">
                                        {activeMenuItems} active
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Order History */}
                        <Link href="/dashboard/provider/order-history" className="group">
                            <div className="bg-[#1a2b23] rounded-2xl p-6 border border-white/5 hover:border-teal-500/30 transition-all group-hover:shadow-lg group-hover:shadow-teal-500/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <ClipboardList className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-teal-400 transition-colors group-hover:translate-x-1 transform transition-transform" />
                                </div>
                                <h3 className="text-white font-bold text-base mb-1">Order History</h3>
                                <p className="text-gray-500 text-sm mb-3">Track and manage all customer orders</p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 font-medium">
                                        {pendingOrders.length} pending
                                    </span>
                                    <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 font-medium">
                                        {activeOrders.length} active
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Weekly Menu */}
                        <Link href="/dashboard/provider/weekly-menu" className="group">
                            <div className="bg-[#1a2b23] rounded-2xl p-6 border border-white/5 hover:border-teal-500/30 transition-all group-hover:shadow-lg group-hover:shadow-teal-500/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-teal-400 transition-colors group-hover:translate-x-1 transform transition-transform" />
                                </div>
                                <h3 className="text-white font-bold text-base mb-1">Weekly Menu</h3>
                                <p className="text-gray-500 text-sm mb-3">Plan your weekly lunch &amp; dinner schedule</p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-md bg-teal-500/10 text-teal-400 font-medium">
                                        MON - SUN
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* ========== RECENT ORDERS ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                        <Link
                            href="/dashboard/provider/order-history"
                            className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                        >
                            View All Orders
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="bg-[#1a2b23] rounded-2xl border border-white/5 text-center py-16">
                            <div className="w-16 h-16 mx-auto mb-4 bg-teal-500/10 rounded-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-teal-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">No orders yet</h3>
                            <p className="text-gray-500 text-sm">Orders will appear here when customers place them.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {recentOrders.map((order) => {
                                    const statusConfig = STATUS_CONFIG[order.status];
                                    const StatusIcon = statusConfig.icon;
                                    const nextStatus = NEXT_STATUS[order.status];

                                    return (
                                        <motion.div
                                            key={order._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-[#1a2b23] rounded-2xl border border-white/5 overflow-hidden hover:border-teal-500/20 transition-all"
                                        >
                                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                {/* Left: Order Info */}
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    {/* Status icon */}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${order.status === "pending" ? "bg-amber-500/10" :
                                                        order.status === "confirmed" ? "bg-blue-500/10" :
                                                            order.status === "preparing" ? "bg-purple-500/10" :
                                                                order.status === "out-for-delivery" ? "bg-teal-500/10" :
                                                                    order.status === "delivered" ? "bg-green-500/10" :
                                                                        "bg-red-500/10"
                                                        }`}>
                                                        <StatusIcon className={`w-5 h-5 ${order.status === "pending" ? "text-amber-400" :
                                                            order.status === "confirmed" ? "text-blue-400" :
                                                                order.status === "preparing" ? "text-purple-400" :
                                                                    order.status === "out-for-delivery" ? "text-teal-400" :
                                                                        order.status === "delivered" ? "text-green-400" :
                                                                            "text-red-400"
                                                            }`} />
                                                    </div>

                                                    {/* Order details */}
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h3 className="font-semibold text-white text-sm truncate">
                                                                {order.tiffin?.name || order.tiffinSnapshot?.name || "Deleted Item"} {"\u00D7"} {order.quantity}
                                                            </h3>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.color}`}>
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                {order.customer.name}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                })}
                                                            </span>
                                                            <span className="font-mono text-gray-600">
                                                                #{order._id.slice(-6).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Price & Action */}
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <div className="text-right mr-2">
                                                        <div className="text-lg font-bold text-teal-400 flex items-center">
                                                            <IndianRupee className="w-4 h-4" />
                                                            {order.totalPrice}
                                                        </div>
                                                    </div>

                                                    {/* Quick action */}
                                                    {order.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300 rounded-lg text-xs h-8"
                                                                onClick={() => updateStatus(order._id, "cancelled")}
                                                                disabled={updatingOrderId === order._id}
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs h-8"
                                                                onClick={() => updateStatus(order._id, "confirmed")}
                                                                disabled={updatingOrderId === order._id}
                                                            >
                                                                {updatingOrderId === order._id ? (
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                                        Accept
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {nextStatus && order.status !== "pending" && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs h-8"
                                                            onClick={() => updateStatus(order._id, nextStatus)}
                                                            disabled={updatingOrderId === order._id}
                                                        >
                                                            {updatingOrderId === order._id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    Mark{" "}
                                                                    {nextStatus === "preparing"
                                                                        ? "Preparing"
                                                                        : nextStatus === "out-for-delivery"
                                                                            ? "Out for Delivery"
                                                                            : "Delivered"}
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}

                                                    {(order.status === "delivered" || order.status === "cancelled") && (
                                                        <Link
                                                            href="/dashboard/provider/order-history"
                                                            className="text-gray-500 hover:text-teal-400 transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* View All button */}
                            {orders.length > 5 && (
                                <Link href="/dashboard/provider/order-history">
                                    <div className="mt-2 p-4 bg-[#1a2b23] rounded-2xl border border-dashed border-white/10 text-center hover:border-teal-500/30 hover:bg-[#1a2b23]/80 transition-all cursor-pointer">
                                        <span className="text-sm text-gray-400 hover:text-teal-400 transition-colors flex items-center justify-center gap-2">
                                            View all {orders.length} orders
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
