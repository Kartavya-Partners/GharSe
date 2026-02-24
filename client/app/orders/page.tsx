"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import {
    ArrowLeft,
    ShoppingBag,
    Loader2,
    MapPin,
    CheckCircle2,
    Clock,
    ChefHat,
    Truck,
    Home,
    MessageSquare,
    Phone,
    ThermometerSun, // fallback icon for soup_kitchen
    Calendar,
    RefreshCcw,
    Moon,
    Sun,
    XCircle,
} from "lucide-react";

// Types
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
    { key: "pending", label: "Order Placed", icon: ShoppingBag, description: "Waiting for confirmation" },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2, description: "Chef has accepted your order" },
    { key: "preparing", label: "Preparing", icon: ThermometerSun, description: "Chef is cooking your meal" },
    { key: "out-for-delivery", label: "On the Way", icon: Truck, description: "Your food is out for delivery" },
    { key: "delivered", label: "Delivered", icon: Home, description: "Enjoy your meal!" },
];

function getStatusIndex(status: string): number {
    if (status === "cancelled") return -1;
    return STATUS_STEPS.findIndex((s) => s.key === status);
}

import { OrderTrackingMapProps } from "@/components/OrderTrackingMap";

// Dynamic Map for Order Tracking
// Passing dummy coordinates for Pune since backend doesn't save specific provider/order GPS currently
const OrderTrackingMap = dynamic<OrderTrackingMapProps>(
    () => import("@/components/OrderTrackingMap"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full min-h-[400px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center animate-pulse rounded-xl">
                <div className="flex flex-col items-center gap-2">
                    <MapPin className="w-8 h-8 text-orange-400 animate-bounce" />
                    <span className="text-sm font-medium text-gray-400">Loading Map...</span>
                </div>
            </div>
        ),
    }
);


function OrdersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const success = searchParams.get("success");

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { cartCount } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Theme toggle
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        if (typeof window !== "undefined") {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
            setIsDarkMode(false);
        } else {
            html.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
            setIsDarkMode(true);
        }
    };

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

            if (response.data.length > 0) {
                // Auto-select most recent active order or the latest one
                const activeOrder = response.data.find(
                    (o: Order) => !["delivered", "cancelled"].includes(o.status)
                );
                setSelectedOrder((prev) => prev ? response.data.find((o: Order) => o._id === prev._id) || activeOrder || response.data[0] : activeOrder || response.data[0]);
            }
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111827]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    const currentStatusIndex = selectedOrder ? getStatusIndex(selectedOrder.status) : -1;

    // Default mock coordinates for Provider and Home in Pune (Narhe)
    const providerCoords: [number, number] = [18.465, 73.835];
    const customerCoords: [number, number] = [18.450, 73.815];

    return (
        <div className="bg-[#F3F4F6] dark:bg-[#111827] text-gray-800 dark:text-gray-200 min-h-screen transition-colors duration-300 font-sans">
            {/* Navbar */}
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Banner */}
                {success && (
                    <div className="mb-8 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex items-center gap-3 animate-fade-in-down shadow-sm">
                        <div className="flex-shrink-0">
                            <CheckCircle2 className="text-green-500 w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                            Order placed successfully! Track its journey to your doorstep below.
                        </p>
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#1F2937] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Start ordering delicious homemade meals!</p>
                        <Link href="/explore" className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors">
                            Browse Tiffins
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column - Order List */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Your Orders</h2>
                                <span className="text-xs text-orange-500 font-medium hover:underline cursor-pointer">View All</span>
                            </div>

                            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                                {orders.map((order) => {
                                    const isSelected = selectedOrder?._id === order._id;
                                    const date = new Date(order.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });
                                    const itemName = order.tiffin?.name || order.tiffinSnapshot?.name || "Deleted Item";
                                    const providerName = order.provider?.name || "Unknown Provider";

                                    return (
                                        <div
                                            key={order._id}
                                            onClick={() => setSelectedOrder(order)}
                                            className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${isSelected
                                                ? "border-2 border-orange-500 bg-orange-50 dark:bg-[#431407]/30 shadow-sm"
                                                : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1F2937] hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full z-0"></div>
                                            )}

                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <div>
                                                    <h3 className={`text-lg transition-colors ${isSelected ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-800 dark:text-gray-200"}`}>
                                                        {itemName}
                                                    </h3>
                                                    <p className={`text-xs mt-1 ${isSelected ? "text-gray-500 dark:text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
                                                        From {providerName}&apos;s Kitchen
                                                    </p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === "delivered"
                                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                    : order.status === "cancelled"
                                                        ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                                                        : "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300"
                                                    }`}>
                                                    {order.status === "out-for-delivery" ? "On Way" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>

                                            <div className={`flex items-center justify-between text-sm mt-4 pt-4 relative z-10 ${isSelected
                                                ? "text-gray-600 dark:text-gray-300 border-t border-orange-200 dark:border-orange-800/50"
                                                : "text-gray-500 dark:text-gray-400 mt-3 border-t-0 pt-0" // The HTML uses border only on selected
                                                }`}>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className={`w-4 h-4 ${isSelected ? "text-orange-500" : ""}`} />
                                                    <span>{date}</span>
                                                </div>
                                                <div className={`text-lg font-bold ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300 font-medium"}`}>
                                                    ₹{order.totalPrice}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Column - Order Details & tracking */}
                        <div className="lg:col-span-8">
                            {selectedOrder && (
                                <div className="rounded-2xl bg-white dark:bg-[#1F2937] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    {/* Selected Order Header */}
                                    <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {selectedOrder.tiffin?.name || selectedOrder.tiffinSnapshot?.name} <span className="text-gray-400 dark:text-gray-600 font-normal">× {selectedOrder.quantity}</span>
                                                </h2>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                                Prepared by <span className="font-medium text-orange-500">{selectedOrder.provider?.name}</span>
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white">₹{selectedOrder.totalPrice}</div>
                                            <div className="text-sm font-mono text-gray-400 dark:text-gray-500 tracking-wider">#{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}</div>
                                        </div>
                                    </div>

                                    {/* Main Tracking Content */}
                                    {selectedOrder.status === "cancelled" ? (
                                        <div className="p-12 text-center">
                                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
                                                <XCircle className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Cancelled</h3>
                                            <p className="text-gray-500 dark:text-gray-400">This order has been cancelled and refunded to source if paid.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
                                            {/* Status Timeline */}
                                            <div className="relative pl-2">
                                                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-6">Order Status</h3>

                                                {/* Connecting Line */}
                                                <div className="absolute left-[20px] top-[40px] bottom-[-20px] w-[2px] bg-gray-200 dark:bg-gray-700 z-0"></div>

                                                {/* Active Progress Line */}
                                                <div
                                                    className="absolute left-[20px] top-[40px] w-[2px] bg-gradient-to-b from-orange-500 to-orange-500 z-10 transition-all duration-1000 ease-in-out"
                                                    style={{ height: `${Math.max(0, currentStatusIndex * 25)}%` }}
                                                ></div>

                                                {STATUS_STEPS.map((step, index) => {
                                                    const isCompleted = currentStatusIndex >= index;
                                                    const isActive = currentStatusIndex === index;
                                                    const isPending = currentStatusIndex < index;

                                                    const Icon = step.icon;

                                                    return (
                                                        <div key={step.key} className={`relative z-10 flex gap-4 mb-8 ${isPending ? 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300' : 'group'}`}>
                                                            {isCompleted ? (
                                                                // Completed or Active styles
                                                                isActive ? (
                                                                    // Active (Pulse white bg orange border)
                                                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-orange-500 text-orange-500 flex items-center justify-center ring-4 ring-white dark:ring-[#1F2937] shadow-sm shrink-0">
                                                                        <Icon className="w-5 h-5 animate-pulse" />
                                                                    </div>
                                                                ) : (
                                                                    // Completed (Solid orange)
                                                                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 ring-4 ring-white dark:ring-[#1F2937] transition-transform group-hover:scale-110 shrink-0">
                                                                        <Icon className="w-5 h-5" />
                                                                    </div>
                                                                )
                                                            ) : (
                                                                // Pending styles
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 flex items-center justify-center ring-4 ring-white dark:ring-[#1F2937] shrink-0">
                                                                    <Icon className="w-5 h-5" />
                                                                </div>
                                                            )}

                                                            <div className="pt-1">
                                                                <h4 className={`font-medium ${isCompleted ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                                                    {step.label}
                                                                </h4>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                                                                {index === 0 && (
                                                                    <span className="text-xs text-orange-500 mt-1 inline-block">
                                                                        {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Live Tracking Map */}
                                            <div className="flex flex-col h-full min-h-[400px]">
                                                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Live Tracking</h3>
                                                <div className="relative flex-grow rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700">

                                                    {/* Next.js Dynamic Component for Map */}
                                                    <OrderTrackingMap
                                                        providerCoords={providerCoords}
                                                        customerCoords={customerCoords}
                                                    />

                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Details */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Delivery Address</h4>
                                            <div className="flex gap-3">
                                                <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder?.deliveryAddress?.street}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder?.deliveryAddress?.city} - {selectedOrder?.deliveryAddress?.pincode}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                                            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Need Help?</h4>
                                            <div className="flex gap-4">
                                                <button className="text-sm font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1">
                                                    Chat Support
                                                </button>
                                                <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
                                                    Call Kitchen
                                                </button>
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
                <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] dark:bg-[#111827]">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            }
        >
            <OrdersContent />
        </Suspense>
    );
}
