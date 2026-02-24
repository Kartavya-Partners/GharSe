"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    History,
    Heart,
    Wallet,
    LogOut,
    IndianRupee,
} from "lucide-react";

const navItems = [
    { href: "/dashboard/customer", label: "My Food Journey", icon: LayoutDashboard },
    { href: "/orders", label: "Order History", icon: History },
    { href: "/dashboard/customer/favorites", label: "Favorite Chefs", icon: Heart },
    { href: "/dashboard/customer/wallet", label: "Wallet", icon: Wallet, badge: "₹450" },
];

export default function CustomerSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="w-[240px] bg-white border-r border-gray-100 min-h-screen flex flex-col sticky top-0">
            {/* Logo */}
            <div className="p-6 pb-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">G</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">GharSe</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </div>
                            {item.badge && (
                                <span
                                    className={`text-xs font-semibold ${isActive ? "text-orange-100" : "text-orange-500"
                                        }`}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Hungry CTA */}
            <div className="px-3 mb-4">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                    <p
                        className="text-orange-600 text-lg font-bold mb-1"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Hungry?
                    </p>
                    <p className="text-gray-600 text-xs mb-3">
                        Order tiffin before 11 AM for lunch delivery.
                    </p>
                    <Link
                        href="/explore"
                        className="inline-block px-4 py-1.5 bg-white border border-orange-300 text-orange-600 text-xs font-semibold rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                    >
                        Order Now
                    </Link>
                </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-bold text-sm">
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
                            <p className="text-xs text-gray-400">Premium Member</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
