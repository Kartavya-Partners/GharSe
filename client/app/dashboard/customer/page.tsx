"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import NotificationDropdown from "@/components/NotificationDropdown";
import CartSidebar from "@/components/CartSidebar";
import { useCart } from "@/context/CartContext";
import {
    Settings,
    Clock,
    MapPin,
    Truck,
    CheckCircle2,
    Camera,
    MessageSquareQuote,
    ChefHat,
    Loader2,
    Package,
    IndianRupee,
    ArrowRight,
    ImageIcon,
    Star,
    Calendar,
    History,
    ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
    _id: string;
    tiffin: {
        _id: string;
        name: string;
        type: string;
        images?: string[];
    } | null;
    tiffinSnapshot?: {
        name: string;
        price: number;
        type: string;
    };
    provider: {
        _id: string;
        name: string;
        address?: {
            street?: string;
            city?: string;
            coordinates?: { lat: number; lng: number };
        };
    } | null;
    deliveryDate: string;
    quantity: number;
    totalPrice: number;
    status: "pending" | "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "cancelled";
    deliveryAddress: {
        street: string;
        city: string;
        pincode: string;
        coordinates?: { lat: number; lng: number };
    };
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string; description: string }> = {
    pending: { label: "ORDER PLACED", color: "bg-yellow-100 text-yellow-700", dotColor: "bg-yellow-500", description: "Waiting for confirmation" },
    confirmed: { label: "CONFIRMED", color: "bg-blue-100 text-blue-700", dotColor: "bg-blue-500", description: "Order accepted by chef" },
    preparing: { label: "PREPARING", color: "bg-purple-100 text-purple-700", dotColor: "bg-purple-500", description: "Chef is cooking your meal" },
    "out-for-delivery": { label: "OUT FOR DELIVERY", color: "bg-orange-100 text-orange-700", dotColor: "bg-orange-500", description: "On the way to you" },
    delivered: { label: "DELIVERED", color: "bg-green-100 text-green-700", dotColor: "bg-green-500", description: "Enjoy your meal!" },
    cancelled: { label: "CANCELLED", color: "bg-red-100 text-red-700", dotColor: "bg-red-500", description: "Order was cancelled" },
};

function getGreeting(): { text: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
    if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
    return { text: "Good Evening", emoji: "🌙" };
}

export default function CustomerDashboard() {
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    const { cartCount } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?role=customer");
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/orders/myorders");
                const allOrders: Order[] = response.data;
                setOrders(allOrders);

                // Find active order (not delivered/cancelled)
                const active = allOrders.find(
                    (o) => !["delivered", "cancelled"].includes(o.status)
                );
                setActiveOrder(active || null);

                // Recent delivered orders for gallery
                const delivered = allOrders
                    .filter((o) => o.status === "delivered")
                    .slice(0, 4);
                setRecentOrders(delivered);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) fetchOrders();
    }, [isAuthenticated]);

    // Poll for active order updates
    useEffect(() => {
        if (!activeOrder || ["delivered", "cancelled"].includes(activeOrder.status)) return;
        const interval = setInterval(async () => {
            try {
                const response = await axios.get("/orders/myorders");
                const allOrders: Order[] = response.data;
                setOrders(allOrders);
                const active = allOrders.find(
                    (o) => !["delivered", "cancelled"].includes(o.status)
                );
                setActiveOrder(active || null);
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [activeOrder]);

    const greeting = getGreeting();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const statusConfig = activeOrder ? STATUS_CONFIG[activeOrder.status] : null;

    return (
        <div className="min-h-screen bg-[#FBF8F4] flex">
            {/* Sidebar */}
            <CustomerSidebar />

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Center Content */}
                <main className="flex-1 max-w-[800px]">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-4 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {greeting.text}, {user?.name?.split(" ")[0]}! {greeting.emoji}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Your personal food journey continues. Here&apos;s what&apos;s cooking.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 z-50">
                            <NotificationDropdown />
                            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                                <ShoppingBag className="w-5 h-5 text-gray-600" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="px-8 space-y-6 pb-8">
                        {/* ========== ACTIVE ORDER CARD ========== */}
                        {isLoading ? (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                            </div>
                        ) : activeOrder ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${statusConfig?.color}`}>
                                                    {statusConfig?.label}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Order #{activeOrder._id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {activeOrder.tiffin?.name || activeOrder.tiffinSnapshot?.name || "Your Order"}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {activeOrder.provider?.name ? `From ${activeOrder.provider.name}'s Kitchen` : ""}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-orange-500 text-lg font-bold">
                                                {new Date(activeOrder.deliveryDate).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-400">Estimated Arrival</p>
                                        </div>
                                    </div>

                                    {/* Order Status Timeline */}
                                    <div className="space-y-4 mt-6">
                                        {["confirmed", "out-for-delivery", "delivered"].map((step, idx) => {
                                            const stepStatuses = ["pending", "confirmed", "preparing", "out-for-delivery", "delivered"];
                                            const currentIdx = stepStatuses.indexOf(activeOrder.status);
                                            const stepIdx = stepStatuses.indexOf(step);
                                            const isComplete = stepIdx <= currentIdx;
                                            const isCurrent = step === activeOrder.status ||
                                                (step === "confirmed" && ["confirmed", "preparing"].includes(activeOrder.status));

                                            const labels: Record<string, { title: string; desc: string }> = {
                                                confirmed: { title: "Order Picked Up", desc: activeOrder.provider?.name ? `From ${activeOrder.provider.name}'s Kitchen` : "Confirmed" },
                                                "out-for-delivery": { title: "Rider on the way", desc: `${activeOrder.deliveryAddress.city}` },
                                                delivered: { title: "Delivered", desc: `Scheduled for delivery` },
                                            };

                                            return (
                                                <div key={step} className="flex items-start gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`w-3 h-3 rounded-full border-2 ${isComplete
                                                                ? step === "out-for-delivery" ? "bg-orange-500 border-orange-500" : "bg-green-500 border-green-500"
                                                                : "bg-white border-gray-300"
                                                                }`}
                                                        />
                                                        {idx < 2 && (
                                                            <div className={`w-0.5 h-6 ${isComplete ? "bg-green-200" : "bg-gray-200"}`} />
                                                        )}
                                                    </div>
                                                    <div className="-mt-0.5">
                                                        <p className={`text-sm font-semibold ${isComplete ? "text-gray-900" : "text-gray-400"}`}>
                                                            {labels[step]?.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {labels[step]?.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* View Full Tracking */}
                                <Link
                                    href="/orders"
                                    className="block px-6 py-3 bg-gray-50 border-t text-center text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                                >
                                    View Full Tracking →
                                </Link>
                            </motion.div>
                        ) : (
                            /* No Active Order */
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center">
                                    <Package className="w-8 h-8 text-orange-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No active orders</h3>
                                <p className="text-sm text-gray-500 mb-4">Ready for your next meal?</p>
                                <Link
                                    href="/explore"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                                >
                                    Browse Meals
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        )}

                        {/* ========== CHEF QUOTE ========== */}
                        {activeOrder?.provider && (
                            <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MessageSquareQuote className="w-4 h-4 text-orange-600" />
                                </div>
                                <p className="text-sm text-gray-600">
                                    &ldquo;Packed with extra love (and pickle!) today.&rdquo; —{" "}
                                    <span className="text-orange-600 font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {activeOrder.provider.name}
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* ========== MEAL MEMORY GALLERY ========== */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-orange-500" />
                                    Meal Memory Gallery
                                </h2>
                                <Link href="/orders" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                                    View All
                                </Link>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {recentOrders.map((order, idx) => (
                                    <motion.div
                                        key={order._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="aspect-square rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                    >
                                        {order.tiffin?.images?.[0] ? (
                                            <img
                                                src={order.tiffin.images[0]}
                                                alt={order.tiffin.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ChefHat className="w-8 h-8 text-orange-300" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {/* Add Photo placeholder */}
                                {recentOrders.length < 4 && (
                                    <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors cursor-pointer">
                                        <Camera className="w-6 h-6 mb-1" />
                                        <span className="text-xs">Add Photo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ========== RECENT ORDERS ========== */}
                        {orders.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <History className="w-5 h-5 text-orange-500" />
                                    Recent Orders
                                </h2>
                                <div className="space-y-3">
                                    {orders.slice(0, 5).map((order, idx) => {
                                        const cfg = STATUS_CONFIG[order.status];
                                        return (
                                            <motion.div
                                                key={order._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <Link
                                                    href="/orders"
                                                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                            <ChefHat className="w-5 h-5 text-orange-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {order.tiffin?.name || order.tiffinSnapshot?.name || "Order"}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                })} • ₹{order.totalPrice}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg?.color}`}>
                                                            {cfg?.label}
                                                        </span>
                                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Cart Sidebar */}
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}
