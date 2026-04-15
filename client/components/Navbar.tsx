"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { UtensilsCrossed, ShoppingBag, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import CartSidebar from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const { cartCount } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === "/" && pathname !== "/") return false;
        return pathname.startsWith(path);
    };

    const linkStyle = (path: string) => {
        if (isActive(path)) {
            return "text-sm font-bold text-orange-500 border-b-2 border-orange-500 pb-1";
        }
        return "text-sm font-semibold text-gray-500 hover:text-orange-500 hover:scale-105 transition-all";
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href={isAuthenticated && user ? `/dashboard/${user.role}` : "/"} className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                            <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-gray-900">
                            Ghar<span className="text-orange-500">Se</span>
                        </span>
                    </Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/explore" className={linkStyle("/explore")}>Menu</Link>
                        <Link href="/how-it-works" className={linkStyle("/how-it-works")}>How it Works</Link>
                        <Link href="/kitchens" className={linkStyle("/kitchens")}>Chefs</Link>
                        <Link href="/stories" className={linkStyle("/stories")}>Stories</Link>
                    </div>

                    {/* Auth / Profile Actions */}
                    <div className="flex items-center gap-3">
                        {isLoading ? (
                            /* Show a subtle skeleton while auth state loads */
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                            </div>
                        ) : isAuthenticated && user ? (
                            <>
                                <NotificationDropdown />
                                <Link
                                    href={`/dashboard/${user.role}`}
                                    className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all"
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </Link>
                                {user.role === "customer" && (
                                    <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-full hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors">
                                        <ShoppingBag className="w-5 h-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">
                                    Login
                                </Link>
                                <Link href="/login" className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-full transition-all shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Sidebar (Global) */}
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </nav>
    );
}
