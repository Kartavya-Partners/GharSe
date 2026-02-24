"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Bell, HelpCircle, Search } from "lucide-react";

interface ProviderNavbarProps {
    title: string;
    breadcrumbs?: { label: string; href?: string }[];
    subtitle?: string;
    rightContent?: React.ReactNode;
    showSearch?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
}

export default function ProviderNavbar({
    title,
    breadcrumbs,
    subtitle,
    rightContent,
    showSearch = false,
    searchPlaceholder = "Search...",
    searchValue = "",
    onSearchChange,
}: ProviderNavbarProps) {
    const { user } = useAuth();

    return (
        <div className="w-full">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="GharSe" width={36} height={36} className="h-8 w-auto" />
                    <span className="text-white font-bold text-lg">GharSe</span>
                </Link>

                <div className="flex items-center gap-3">
                    <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <Bell className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <HelpCircle className="w-4 h-4" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || "P"}
                    </div>
                </div>
            </div>

            {/* Breadcrumbs + Title + Actions */}
            <div className="px-6 py-5">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={index} className="flex items-center gap-2">
                                {index > 0 && <span>/</span>}
                                {crumb.href ? (
                                    <Link href={crumb.href} className="hover:text-gray-300 transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-gray-300 font-medium">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
                        )}
                    </div>
                    {rightContent && <div>{rightContent}</div>}
                </div>

                {/* Search */}
                {showSearch && (
                    <div className="mt-4 relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full h-11 pl-11 pr-4 bg-[#1a2b23] border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
