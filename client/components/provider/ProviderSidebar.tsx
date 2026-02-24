"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    UtensilsCrossed,
    ClipboardList,
    DollarSign,
    Settings,
    HelpCircle,
    LogOut,
    Calendar,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/dashboard/provider/orders", icon: LayoutDashboard },
    { label: "Menu Management", href: "/dashboard/provider", icon: UtensilsCrossed },
    { label: "Order History", href: "/dashboard/provider/order-history", icon: ClipboardList },
    { label: "Weekly Menu", href: "/dashboard/provider/weekly-menu", icon: Calendar },
];

const systemItems = [
    { label: "Settings", href: "/dashboard/provider", icon: Settings },
    { label: "Help & Support", href: "/dashboard/provider", icon: HelpCircle },
];

export default function ProviderSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="hidden lg:flex flex-col w-[240px] min-h-screen bg-[#0d1a14] border-r border-white/5">
            {/* Profile Section */}
            <div className="p-5 flex items-center gap-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {user?.name ? (
                        <span>{user.name.charAt(0).toUpperCase()}</span>
                    ) : (
                        <span>P</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                        {user?.name || "GharSe Provider"}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                        {user?.email ? `Chef ${user.name?.split(" ")[0]}` : "Chef"}
                    </p>
                </div>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                ? "bg-teal-600/20 text-teal-400"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                {/* System Section */}
                <div className="pt-6">
                    <p className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        System
                    </p>
                    {systemItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? "bg-teal-600/20 text-teal-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Sign Out */}
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
