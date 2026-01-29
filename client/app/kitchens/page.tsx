"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { Button } from "@/components/ui/button";
import {
    UtensilsCrossed,
    Search,
    ChefHat,
    Star,
    MapPin,
    LogOut,
    User,
    Loader2,
    Navigation,
    ShoppingBag,
    Leaf,
    Drumstick,
    ArrowRight,
    Map,
    List,
} from "lucide-react";
import { motion } from "framer-motion";

// Dynamic import for map component (SSR-safe)
const KitchenMap = dynamic(() => import("@/components/KitchenMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[500px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
    ),
});

interface Provider {
    _id: string;
    name: string;
    address?: {
        street?: string;
        city?: string;
        pincode?: string;
    };
    tiffinCount: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    types: string[];
    mealTypes: string[];
    distance?: number | null;
}

export default function KitchensPage() {
    const { user, isLoading: authLoading, logout, isAuthenticated } = useAuth();
    const { location, isLoading: locationLoading, requestLocation } = useLocation();
    const router = useRouter();

    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "map">("list");

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?role=customer");
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch providers
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();

                if (location) {
                    params.set("lat", location.lat.toString());
                    params.set("lng", location.lng.toString());
                    params.set("radius", "15");
                }

                const endpoint = `/providers${params.toString() ? `?${params}` : ""}`;
                const response = await axios.get(endpoint);
                setProviders(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load kitchens");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchProviders();
        }
    }, [isAuthenticated, location]);

    // Filter by search
    const filteredProviders = providers.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address?.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ========== NAVBAR ========== */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text-orange">GharSe</span>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for kitchens..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 pl-12 pr-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <Link href="/orders" className="hidden sm:flex items-center gap-1 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                                <ShoppingBag className="w-4 h-4" />
                                <span>Orders</span>
                            </Link>
                            <Link href="/profile" className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="hidden sm:block font-medium text-gray-700">{user?.name}</span>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-red-600">
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== BROWSE MODE TABS ========== */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex gap-1 pt-4">
                        <Link
                            href="/explore"
                            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-all border-b-2 text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                        >
                            <UtensilsCrossed className="w-5 h-5" />
                            Browse Meals
                        </Link>
                        <button className="flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-all border-b-2 bg-green-50 text-green-600 border-green-500">
                            <ChefHat className="w-5 h-5" />
                            Browse Kitchens
                        </button>
                    </div>
                </div>
            </div>

            {/* ========== MAIN CONTENT ========== */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* Location Banner */}
                {!location && !locationLoading && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Navigation className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Enable location for better results</p>
                                <p className="text-sm text-gray-600">Find home kitchens nearest to you</p>
                            </div>
                        </div>
                        <Button
                            onClick={requestLocation}
                            className="bg-green-500 hover:bg-green-600 text-white"
                        >
                            Share Location
                        </Button>
                    </div>
                )}

                {location && (
                    <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2 text-green-700">
                        <Navigation className="w-4 h-4" />
                        <span className="text-sm font-medium">Showing kitchens near your location</span>
                    </div>
                )}

                {/* Mobile Search */}
                <div className="md:hidden mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search kitchens..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-12 pr-4 bg-white rounded-xl border focus:ring-2 focus:ring-green-400"
                        />
                    </div>
                </div>

                {/* Header with View Toggle */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Home Kitchens</h1>
                        <p className="text-gray-600">Discover amazing home chefs in your area</p>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "list"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <List className="w-4 h-4" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "map"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Map className="w-4 h-4" />
                            Map
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                    </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredProviders.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                            <ChefHat className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No kitchens found</h3>
                        <p className="text-gray-600">
                            {searchQuery ? "Try adjusting your search" : "No kitchens available in your area yet"}
                        </p>
                    </div>
                )}

                {/* Map View */}
                {!isLoading && !error && filteredProviders.length > 0 && viewMode === "map" && (
                    <div className="mb-8">
                        <KitchenMap
                            kitchens={filteredProviders.map(p => ({
                                _id: p._id,
                                name: p.name,
                                address: p.address ? {
                                    ...p.address,
                                    coordinates: (p as any).address?.coordinates
                                } : undefined,
                                tiffinCount: p.tiffinCount,
                                avgPrice: p.avgPrice,
                                distance: p.distance,
                            }))}
                            userLocation={location}
                        />
                        <p className="text-sm text-gray-500 mt-3 text-center">
                            Click on a marker to view kitchen details
                        </p>
                    </div>
                )}

                {/* Kitchen Grid (List View) */}
                {!isLoading && !error && filteredProviders.length > 0 && viewMode === "list" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProviders.map((provider, index) => (
                            <motion.div
                                key={provider._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/kitchens/${provider._id}`}>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                                        {/* Header */}
                                        <div className="relative h-32 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center">
                                            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <ChefHat className="w-10 h-10 text-green-600" />
                                            </div>
                                            {/* Type Badges */}
                                            <div className="absolute top-3 right-3 flex gap-1">
                                                {provider.types.includes("veg") && (
                                                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                                        <Leaf className="w-3 h-3" />
                                                    </span>
                                                )}
                                                {provider.types.includes("non-veg") && (
                                                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                                        <Drumstick className="w-3 h-3" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                                                {provider.name}&apos;s Kitchen
                                            </h3>

                                            {/* Location & Distance */}
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                                <MapPin className="w-4 h-4" />
                                                <span>{provider.address?.city || "Location not set"}</span>
                                                {provider.distance !== null && provider.distance !== undefined && (
                                                    <>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-green-600 font-medium">
                                                            {provider.distance.toFixed(1)} km
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                                                    <span className="text-sm font-medium">{provider.tiffinCount} meals</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-sm font-medium">4.5</span>
                                                </div>
                                            </div>

                                            {/* Price Range & CTA */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm text-gray-500">From </span>
                                                    <span className="text-xl font-bold text-gray-900">₹{provider.minPrice}</span>
                                                    <span className="text-sm text-gray-500">/meal</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-green-600 font-medium group-hover:translate-x-1 transition-transform">
                                                    View Menu
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
