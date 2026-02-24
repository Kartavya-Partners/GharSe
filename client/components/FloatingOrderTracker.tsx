"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, ChefHat, Clock, CheckCircle, Navigation, ChevronRight } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface Order {
    _id: string;
    status: string;
    tiffinSnapshot?: { name: string };
    provider?: { name: string };
}

export default function FloatingOrderTracker() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    // Don't show on checkout or orders page to avoid redundancy and clutter
    const hideOnRoutes = ["/checkout", "/orders", "/login", "/signup"];
    const shouldHide = hideOnRoutes.some(route => pathname?.startsWith(route));

    useEffect(() => {
        if (!isAuthenticated) {
            setActiveOrder(null);
            return;
        }

        const fetchActiveOrder = async () => {
            try {
                const res = await axios.get("/orders/myorders");
                const orders: Order[] = res.data;
                const active = orders.find(o => !["delivered", "cancelled"].includes(o.status));
                setActiveOrder(active || null);
            } catch (error) {
                console.error("Failed to fetch active order for tracker:", error);
            }
        };

        fetchActiveOrder();
        const interval = setInterval(fetchActiveOrder, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    if (shouldHide || !activeOrder) return null;

    const getConfig = (status: string) => {
        switch (status) {
            case "pending":
                return { icon: Clock, color: "text-orange-500", bg: "bg-orange-100", text: "Waiting for confirmation" };
            case "confirmed":
                return { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-100", text: "Order Confirmed" };
            case "preparing":
                return { icon: ChefHat, color: "text-purple-500", bg: "bg-purple-100", text: "Chef is cooking" };
            case "out-for-delivery":
                return { icon: Bike, color: "text-green-500", bg: "bg-green-100", text: "Out for delivery" };
            default:
                return { icon: Navigation, color: "text-gray-500", bg: "bg-gray-100", text: "Tracking Order" };
        }
    };

    const config = getConfig(activeOrder.status);
    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] cursor-pointer"
                onClick={() => router.push("/orders")}
            >
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-gray-700/50 rounded-full py-2.5 px-4 flex items-center gap-3 hover:shadow-2xl hover:scale-105 transition-all group">
                    <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color} ${activeOrder.status === 'out-for-delivery' ? 'animate-bounce' : ''}`} />
                    </div>
                    <div className="flex flex-col pr-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                            {config.text}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                            {activeOrder.tiffinSnapshot?.name || "Your meal"}
                        </span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
