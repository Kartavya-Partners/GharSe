"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { Button } from "@/components/ui/button";
import {
    UtensilsCrossed,
    Search,
    Filter,
    Star,
    Clock,
    Leaf,
    Drumstick,
    Salad,
    Sun,
    Coffee,
    Moon,
    MapPin,
    LogOut,
    User,
    Loader2,
    ChefHat,
    ShoppingBag,
    Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TiffinDetailsModal from "@/components/TiffinDetailsModal";

// Types
interface Provider {
    _id: string;
    name: string;
    address?: {
        city?: string;
    };
    rating?: number;
    reviewCount?: number;
}

interface Tiffin {
    _id: string;
    name: string;
    description: string;
    price: number;
    type: "veg" | "non-veg" | "vegan";
    mealType: "breakfast" | "lunch" | "dinner";
    images: string[];
    isAvailable: boolean;
    cutoffTime: string;
    rating?: number;
    reviewCount?: number;
    provider: Provider;
    distance?: number; // Distance from customer in km
}

// Filter options
const typeFilters = [
    { value: "all", label: "All", icon: UtensilsCrossed },
    { value: "veg", label: "Veg", icon: Leaf },
    { value: "non-veg", label: "Non-Veg", icon: Drumstick },
    { value: "vegan", label: "Vegan", icon: Salad },
];

const mealFilters = [
    { value: "all", label: "All Meals", icon: UtensilsCrossed },
    { value: "breakfast", label: "Breakfast", icon: Coffee },
    { value: "lunch", label: "Lunch", icon: Sun },
    { value: "dinner", label: "Dinner", icon: Moon },
];

export default function ExplorePage() {
    const { user, isLoading: authLoading, logout, isAuthenticated } = useAuth();
    // const { location, isLoading: locationLoading, requestLocation } = useLocation(); // Removed duplicate
    const router = useRouter();

    const [tiffins, setTiffins] = useState<Tiffin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [mealFilter, setMealFilter] = useState("all");
    const [browseMode, setBrowseMode] = useState<"meals" | "kitchens">("meals");
    const [selectedTiffin, setSelectedTiffin] = useState<Tiffin | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Add setLocation to destructured context
    const { location, setLocation, isLoading: locationLoading, requestLocation } = useLocation();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?role=customer");
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch tiffins - use nearby endpoint if location available
    useEffect(() => {
        const fetchTiffins = async () => {
            try {
                setIsLoading(true);
                let endpoint = "/tiffins";
                const params = new URLSearchParams();

                // Use nearby endpoint if we have location
                if (location) {
                    endpoint = "/tiffins/nearby";
                    params.append("lat", location.lat.toString());
                    params.append("lng", location.lng.toString());
                    params.append("radius", "15"); // 15km radius
                }

                if (searchQuery) params.append("keyword", searchQuery);
                if (typeFilter !== "all") params.append("type", typeFilter);
                if (mealFilter !== "all") params.append("mealType", mealFilter);

                const response = await axios.get(`${endpoint}?${params.toString()}`);
                setTiffins(response.data);
                setError("");
            } catch (err) {
                console.error("Error fetching tiffins:", err);
                setError("Failed to load tiffins. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchTiffins();
        }
    }, [searchQuery, typeFilter, mealFilter, isAuthenticated, location]);

    // Location Logic: Fallback to saved address or prompt
    useEffect(() => {
        if (!isAuthenticated || authLoading) return;

        // If we already have a location (live or manual), do nothing
        if (location) return;

        const checkLocation = async () => {
            // 1. Try to use User's Saved Address
            const userAny = user as any;
            if (userAny?.address?.coordinates?.lat && userAny?.address?.coordinates?.lng) {
                console.log("📍 Using saved address from profile");
                setLocation({
                    lat: userAny.address.coordinates.lat,
                    lng: userAny.address.coordinates.lng
                });
            }
            // 2. If no saved address, prompt for Location
            else {
                // Small delay to let UI settle
                setTimeout(() => {
                    requestLocation();
                }, 1000);
            }
        };

        checkLocation();
    }, [isAuthenticated, authLoading, location, user, setLocation, requestLocation]);

    // Handle Tiffin Click
    const handleTiffinClick = (tiffin: Tiffin) => {
        setSelectedTiffin(tiffin);
        setIsDetailsModalOpen(true);
    };

    // Handle Order from Modal
    const handleOrder = (tiffin: Tiffin) => {
        setIsDetailsModalOpen(false);
        router.push(`/checkout?tiffinId=${tiffin._id}&quantity=1`);
    };

    // Get type badge color
    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case "veg":
                return "bg-green-100 text-green-700 border-green-200";
            case "non-veg":
                return "bg-red-100 text-red-700 border-red-200";
            case "vegan":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    // Get meal badge color
    const getMealBadgeColor = (mealType: string) => {
        switch (mealType) {
            case "breakfast":
                return "bg-yellow-100 text-yellow-700";
            case "lunch":
                return "bg-orange-100 text-orange-700";
            case "dinner":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ========== NAVBAR ========== */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="GharSe"
                                width={72}
                                height={72}
                                className="h-14 w-auto"
                            />
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for tiffins, cuisines..."
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
                                <span className="hidden sm:block font-medium text-gray-700">
                                    {user?.name}
                                </span>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-gray-500 hover:text-red-600"
                            >
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
                        <button
                            onClick={() => setBrowseMode("meals")}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-all border-b-2 ${browseMode === "meals"
                                ? "bg-orange-50 text-orange-600 border-orange-500"
                                : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <UtensilsCrossed className="w-5 h-5" />
                            Browse Meals
                        </button>
                        <Link
                            href="/kitchens"
                            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-all border-b-2 text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                        >
                            <ChefHat className="w-5 h-5" />
                            Browse Kitchens
                        </Link>
                    </div>
                </div>
            </div>

            {/* ========== FILTERS ========== */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
                    {/* Mobile Search */}
                    <div className="md:hidden mb-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for tiffins..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-12 pr-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-4">
                        {/* Type Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <div className="flex gap-2">
                                {typeFilters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => setTypeFilter(filter.value)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${typeFilter === filter.value
                                            ? "bg-orange-500 text-white shadow-md"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        <filter.icon className="w-4 h-4" />
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Meal Filter */}
                        <div className="flex gap-2">
                            {mealFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setMealFilter(filter.value)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${mealFilter === filter.value
                                        ? "bg-orange-500 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    <filter.icon className="w-4 h-4" />
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== MAIN CONTENT ========== */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* Location Banner */}
                {!location && !locationLoading && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <Navigation className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Enable location for better results</p>
                                <p className="text-sm text-gray-600">Find home chefs nearest to you</p>
                            </div>
                        </div>
                        <Button
                            onClick={requestLocation}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg"
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            Share Location
                        </Button>
                    </div>
                )}

                {/* Location Active Banner */}
                {location && (
                    <div className="mb-6 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700">Showing providers near your location</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={requestLocation}
                            className="text-green-700 hover:bg-green-100"
                            disabled={locationLoading}
                        >
                            {locationLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                                <Navigation className="w-4 h-4 mr-1" />
                            )}
                            Update
                        </Button>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Explore Tiffins
                    </h1>
                    <p className="text-gray-600">
                        Discover delicious homemade meals from trusted providers near you
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && tiffins.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <UtensilsCrossed className="w-10 h-10 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No tiffins found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery || typeFilter !== "all" || mealFilter !== "all"
                                ? "Try adjusting your filters or search query"
                                : "No tiffins available at the moment. Check back soon!"}
                        </p>
                        {(searchQuery || typeFilter !== "all" || mealFilter !== "all") && (
                            <Button
                                onClick={() => {
                                    setSearchQuery("");
                                    setTypeFilter("all");
                                    setMealFilter("all");
                                }}
                                variant="outline"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Tiffin Grid */}
                {!isLoading && !error && tiffins.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tiffins.map((tiffin, index) => (
                            <motion.div
                                key={tiffin._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-50">
                                    {tiffin.images && tiffin.images[0] ? (
                                        <img
                                            src={tiffin.images[0]}
                                            alt={tiffin.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <UtensilsCrossed className="w-16 h-16 text-orange-300" />
                                        </div>
                                    )}
                                    {/* Type Badge */}
                                    <div
                                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeBadgeColor(
                                            tiffin.type
                                        )}`}
                                    >
                                        {tiffin.type.charAt(0).toUpperCase() + tiffin.type.slice(1)}
                                    </div>
                                    {/* Meal Type Badge */}
                                    <div
                                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${getMealBadgeColor(
                                            tiffin.mealType
                                        )}`}
                                    >
                                        {tiffin.mealType.charAt(0).toUpperCase() +
                                            tiffin.mealType.slice(1)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                        {tiffin.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                        {tiffin.description}
                                    </p>

                                    {/* Provider Info */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <ChefHat className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        <span className="text-sm text-gray-600 truncate">
                                            {tiffin.provider?.name || "Home Chef"}
                                        </span>
                                        {tiffin.distance !== undefined && tiffin.distance !== null && (
                                            <>
                                                <Navigation className="w-3.5 h-3.5 text-orange-500" />
                                                <span className="text-xs font-medium text-orange-600">
                                                    {tiffin.distance} km
                                                </span>
                                            </>
                                        )}
                                        {!tiffin.distance && tiffin.provider?.address?.city && (
                                            <>
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    {tiffin.provider.address.city}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Rating & Cutoff */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-medium">
                                                {tiffin.rating?.toFixed(1) || "New"}
                                            </span>
                                            {tiffin.reviewCount && tiffin.reviewCount > 0 && (
                                                <span className="text-xs text-gray-400">
                                                    ({tiffin.reviewCount})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs">
                                                Order by {tiffin.cutoffTime}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price & Order Button */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-bold text-gray-900">
                                                ₹{tiffin.price}
                                            </span>
                                            <span className="text-sm text-gray-500">/meal</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTiffinClick(tiffin);
                                            }}
                                        >
                                            <ShoppingBag className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Tiffin Details Modal */}
                <TiffinDetailsModal
                    tiffin={selectedTiffin}
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    onOrder={handleOrder}
                />
            </main>
        </div>
    );
}
